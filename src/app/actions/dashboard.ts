'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getDashboardStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Get test results and payments in parallel
  const [
    { data: results, error },
    { count: purchasedCount }
  ] = await Promise.all([
    supabase.from('test_results').select('score, completed_at, test_sets(pass_percentage)').eq('user_id', user.id),
    supabase.from('payments').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed')
  ])

  if (error) return { error: error.message }
  if (!results) return { testsTaken: 0, avgScore: '0%', testsPassed: 0, purchasedTests: purchasedCount || 0 }


  const testsTaken = results?.length || 0
  const avgScore = testsTaken > 0 
    ? Math.round(results.reduce((acc, r) => acc + Number(r.score), 0) / testsTaken)
    : 0

  const testsPassed = results?.filter(r => {
    const passPercentage = (r.test_sets as any)?.pass_percentage || 40
    return Number(r.score) >= passPercentage
  }).length || 0

  return {
    testsTaken,
    avgScore: `${avgScore}%`,
    testsPassed,
    purchasedTests: purchasedCount || 0
  }
}

export async function getPerformanceData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data: results } = await supabase
    .from('test_results')
    .select('score, completed_at, time_spent_seconds, total_questions, test_sets(title)')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: true })
    .limit(10)

  return results?.map(r => {
    const timeInMinutes = (r.time_spent_seconds || 1) / 60
    const speed = Math.round((r.total_questions || 0) / timeInMinutes)

    return {
      name: (r.test_sets as any)?.title || 'Test',
      score: Number(r.score),
      speed: speed,
      date: new Date(r.completed_at).toLocaleDateString()
    }
  }) || []
}

export async function getRecentActivity() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const [
    { data: results },
    { data: payments }
  ] = await Promise.all([
    supabase.from('test_results').select('id, score, completed_at, test_sets(title)').eq('user_id', user.id).order('completed_at', { ascending: false }).limit(3),
    supabase.from('payments').select('id, amount, created_at, test_sets(title)').eq('user_id', user.id).eq('status', 'completed').order('created_at', { ascending: false }).limit(3)
  ])

  const activities = [
    ...(results?.map(r => ({
      id: r.id,
      type: 'test_attempt',
      title: (r.test_sets as any)?.title,
      score: `${r.score}%`,
      date: new Date(r.completed_at).toLocaleDateString(),
      icon: 'file-text'
    })) || []),
    ...(payments?.map(p => ({
      id: p.id,
      type: 'test_unlocked',
      title: (p.test_sets as any)?.title,
      score: 'Unlocked',
      date: new Date(p.created_at).toLocaleDateString(),
      icon: 'unlock'
    })) || [])
  ]

  return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
}

export async function getSubjects() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data: subjects, error } = await supabase
    .from('subjects')
    .select(`
      id, 
      name, 
      description,
      price,
      image_url,
      test_sets(id, is_paid)
    `)
    .eq('status', 'enabled')

  if (error) return []

  return subjects.map(sub => ({
    id: sub.id,
    name: sub.name,
    description: sub.description,
    price: sub.price,
    imageUrl: sub.image_url,
    totalTests: sub.test_sets?.length || 0,
    freeTests: sub.test_sets?.filter((t: any) => !t.is_paid).length || 0,
    paidTests: sub.test_sets?.filter((t: any) => t.is_paid).length || 0
  }))
}

export async function getSubjectTests(subjectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { subject: null, tests: [] }

  // Fetch all data in parallel
  const oneHourAgo = new Date(new Date().getTime() - 60 * 60 * 1000).toISOString()
  
  const [
    { data: subject },
    { data: tests, error },
    { data: purchases },
    { data: lockouts }
  ] = await Promise.all([
    supabase.from('subjects').select('id, name, description').eq('id', subjectId).single(),
    supabase.from('test_sets').select('id, title, description, time_limit_minutes, is_paid, price, test_questions(count)').eq('subject_id', subjectId).eq('is_hidden', false).order('created_at', { ascending: true }),
    supabase.from('payments').select('test_set_id').eq('user_id', user.id).eq('status', 'completed'),
    supabase.from('test_attempts').select('test_set_id, updated_at').eq('user_id', user.id).eq('status', 'terminated').gt('updated_at', oneHourAgo)
  ])

  if (error || !tests) return { subject: subject || null, tests: [] }

  const purchasedIds = new Set(purchases?.map(p => p.test_set_id) || [])
  const lockoutMap = new Map(lockouts?.map(l => [l.test_set_id, l.updated_at]))

  const mappedTests = tests.map(test => {
    const lockoutTime = lockoutMap.get(test.id)
    let lockoutMinutes = 0
    if (lockoutTime) {
      const lockoutEnd = new Date(new Date(lockoutTime).getTime() + 60 * 60 * 1000)
      lockoutMinutes = Math.ceil((lockoutEnd.getTime() - new Date().getTime()) / (1000 * 60))
    }

    return {
      id: test.id,
      title: test.title,
      description: test.description,
      duration: `${test.time_limit_minutes} min`,
      questionCount: (test.test_questions as any)[0]?.count || 0,
      isPaid: test.is_paid,
      price: test.price,
      isUnlocked: !test.is_paid || purchasedIds.has(test.id),
      lockoutMinutes: lockoutMinutes > 0 ? lockoutMinutes : 0
    }
  })

  return { subject, tests: mappedTests }
}

export async function getTestData(testId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get test details
  const { data: test } = await supabase
    .from('test_sets')
    .select('*')
    .eq('id', testId)
    .single()

  if (!test) return null

  // Get questions for this test
  const { data: questionLinks } = await supabase
    .from('test_questions')
    .select(`
      question_id,
      sort_order,
      questions(*)
    `)
    .eq('test_set_id', testId)
    .order('sort_order', { ascending: true })

  const questions = questionLinks?.map(link => (link.questions as any)) || []

  return {
    ...test,
    questions
  }
}

export async function submitTest(testId: string, answers: Record<string, number>, timeSpent: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Get test and questions for scoring
  const testData = await getTestData(testId)
  if (!testData) return { error: 'Test not found' }

  let score = 0
  let correctAnswers = 0
  const totalQuestions = testData.questions.length

  testData.questions.forEach((q: any) => {
    if (answers[q.id] === q.correct_option_index) {
      correctAnswers++
      score += Number(testData.marks_per_question || 1)
    } else if (answers[q.id] !== undefined) {
      score -= Number(testData.negative_marks || 0)
    }
  })

  // Final score as percentage
  const maxScore = totalQuestions * Number(testData.marks_per_question || 1)
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0

  const { data: result, error } = await supabase
    .from('test_results')
    .insert({
      user_id: user.id,
      test_set_id: testId,
      score: percentage,
      total_questions: totalQuestions,
      correct_answers: correctAnswers,
      time_spent_seconds: timeSpent
    })
    .select()
    .single()

  if (error) return { error: error.message }

  // Add notification
  await supabase.from('notifications').insert({
    user_id: user.id,
    type: 'test_completed',
    title: 'Test Completed',
    message: `You completed "${testData.title}" with a score of ${Math.round(percentage)}%.`
  })

  return { success: true, resultId: result.id }
}

export async function getResultDetails(resultId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('test_results')
    .select(`
      *,
      test_sets(
        id,
        title,
        pass_percentage,
        marks_per_question,
        negative_marks,
        subjects(name)
      )
    `)
    .eq('id', resultId)
    .single()

  if (error || !data) return null

  const accuracy = data.total_questions > 0 
    ? Math.round((data.correct_answers / data.total_questions) * 100) 
    : 0
    
  const passPercentage = (data.test_sets as any)?.pass_percentage || 40
  const status = Number(data.score) >= passPercentage ? 'Passed' : 'Failed'

  return {
    ...data,
    accuracy,
    status,
    subjectName: (data.test_sets as any)?.subjects?.name || 'General'
  }
}

export async function getResultsHistory() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('test_results')
    .select(`
      id,
      score,
      total_questions,
      completed_at,
      test_sets(
        title,
        pass_percentage,
        subjects(name)
      )
    `)
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false })

  if (error) return []

  return data.map(r => {
    const passPercentage = (r.test_sets as any)?.pass_percentage || 40
    return {
      id: r.id,
      title: (r.test_sets as any)?.title,
      subject: (r.test_sets as any)?.subjects?.name || 'General',
      score: `${Math.round(r.score)}%`,
      status: Number(r.score) >= passPercentage ? 'Passed' : 'Failed',
      date: new Date(r.completed_at).toLocaleDateString()
    }
  })
}

export async function getMyTests() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // Get all free tests
  const { data: freeTests } = await supabase
    .from('test_sets')
    .select('id, title, test_type, time_limit_minutes, subjects(name)')
    .eq('is_paid', false)
    .eq('is_hidden', false)

  // Get purchased tests
  const { data: purchases } = await supabase
    .from('payments')
    .select('test_set_id, test_sets(id, title, test_type, time_limit_minutes, subjects(name))')
    .eq('user_id', user.id)
    .eq('status', 'completed')

  const purchasedTests = purchases?.map(p => p.test_sets) || []
  
  // Combine and deduplicate
  const allTests = [...(freeTests || []), ...(purchasedTests as any[])]
  const uniqueTests = Array.from(new Map(allTests.map(t => [t.id, t])).values())

  // Get results to show completion status
  const { data: results } = await supabase
    .from('test_results')
    .select('test_set_id, score, completed_at')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false })

  // Check for active lockouts
  const oneHourAgo = new Date(new Date().getTime() - 60 * 60 * 1000).toISOString()
  const { data: lockouts } = await supabase
    .from('test_attempts')
    .select('test_set_id, updated_at')
    .eq('user_id', user.id)
    .eq('status', 'terminated')
    .gt('updated_at', oneHourAgo)

  const lockoutMap = new Map(lockouts?.map(l => [l.test_set_id, l.updated_at]))

  return uniqueTests.map(test => {
    const lastResult = results?.find(r => r.test_set_id === test.id)
    
    const lockoutTime = lockoutMap.get(test.id)
    let lockoutMinutes = 0
    if (lockoutTime) {
      const lockoutEnd = new Date(new Date(lockoutTime).getTime() + 60 * 60 * 1000)
      lockoutMinutes = Math.ceil((lockoutEnd.getTime() - new Date().getTime()) / (1000 * 60))
    }

    return {
      id: test.id,
      title: test.title,
      subject: (test.subjects as any)?.name || 'General',
      duration: `${test.time_limit_minutes} min`,
      status: lastResult ? 'Completed' : 'Pending',
      score: lastResult ? `${Math.round(lastResult.score)}%` : '-',
      lockoutMinutes: lockoutMinutes > 0 ? lockoutMinutes : 0
    }
  })
}

export async function getPurchases() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data: payments, error } = await supabase
    .from('payments')
    .select(`
      id,
      amount,
      status,
      transaction_id,
      created_at,
      test_sets(title, subjects(name))
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return []

  return payments.map(p => ({
    id: p.id,
    testName: (p.test_sets as any)?.title,
    subject: (p.test_sets as any)?.subjects?.name || 'General',
    price: `AED ${p.amount}`,
    status: p.status,
    date: new Date(p.created_at).toLocaleDateString(),
    transactionId: p.transaction_id || 'N/A'
  }))
}

export async function getProfileData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: results } = await supabase
    .from('test_results')
    .select('score')
    .eq('user_id', user.id)

  const totalTests = results?.length || 0
  const avgScore = (results && results.length > 0)
    ? Math.round(results.reduce((acc, r) => acc + Number(r.score), 0) / results.length)
    : 0

  return {
    ...profile,
    email: user.email,
    totalTests,
    avgScore: `${avgScore}%`,
    joinDate: new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  const fullName = formData.get('fullName') as string

  // 1. Update profiles table
  await supabase
    .from('profiles')
    .update({
      full_name: fullName,
    })
    .eq('id', user.id)

  // 2. Sync with Auth metadata so DashboardHeader updates
  await supabase.auth.updateUser({
    data: { full_name: fullName }
  })

  revalidatePath('/dashboard', 'layout')
}

export async function unlockTest(testId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Get test details for amount and title
  const { data: test } = await supabase
    .from('test_sets')
    .select('title, price')
    .eq('id', testId)
    .single()

  if (!test) return { error: 'Test not found' }

  const { error } = await supabase
    .from('payments')
    .insert({
      user_id: user.id,
      test_set_id: testId,
      amount: test.price,
      status: 'completed',
      transaction_id: `MOCK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    })

  if (error) return { error: error.message }

  // Add notification
  await supabase.from('notifications').insert({
    user_id: user.id,
    type: 'payment_success',
    title: 'Payment Successful',
    message: `You have successfully unlocked "${test.title}". You can now start the test.`
  })

  revalidatePath('/dashboard/subjects')
  revalidatePath(`/dashboard/subjects/${testId}`)
  
  return { success: true }
}

export async function startTestSession(testId: string, requestedSessionId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // 0. Check for 1-hour lockout due to termination/violations
  const oneHourAgo = new Date(new Date().getTime() - 60 * 60 * 1000).toISOString()
  const { data: recentTerminations } = await supabase
    .from('test_attempts')
    .select('updated_at')
    .eq('user_id', user.id)
    .eq('test_set_id', testId)
    .eq('status', 'terminated')
    .gt('updated_at', oneHourAgo)
    .order('updated_at', { ascending: false })
    .limit(1)

  if (recentTerminations && recentTerminations.length > 0) {
    const recentTermination = recentTerminations[0]
    const lockoutEnd = new Date(new Date(recentTermination.updated_at).getTime() + 60 * 60 * 1000)
    const minutesLeft = Math.ceil((lockoutEnd.getTime() - new Date().getTime()) / (1000 * 60))
    return { 
        error: `Test locked due to security violations. Please try again in ${minutesLeft} minutes.`,
        lockoutMinutes: minutesLeft
    }
  }

  // 1. Handle Resumption if sessionId is provided
  if (requestedSessionId) {
    const { data: session } = await supabase
      .from('test_attempts')
      .select('id, start_time, time_limit, status')
      .eq('id', requestedSessionId)
      .eq('user_id', user.id)
      .single()

    if (session && session.status === 'in_progress') {
      const startTime = new Date(session.start_time).getTime()
      const now = new Date().getTime()
      const elapsedMinutes = (now - startTime) / (1000 * 60)
      
      if (elapsedMinutes <= session.time_limit) {
         return { sessionId: session.id, startTime: session.start_time, timeLimit: session.time_limit }
      } else {
         // Mark as completed if time exceeded during interruption
         await supabase.from('test_attempts').update({ status: 'completed' }).eq('id', session.id)
      }
    }
  }

  // 2. Abandon any existing in_progress sessions for this user/test set
  // This satisfies the "Restart starts new session" requirement
  await supabase
    .from('test_attempts')
    .update({ status: 'abandoned', updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('test_set_id', testId)
    .eq('status', 'in_progress')

  // 3. Get test details for the new session
  const { data: test } = await supabase
    .from('test_sets')
    .select('id, time_limit_minutes')
    .eq('id', testId)
    .single()

  if (!test) return { error: 'Test not found' }

  // 4. Get latest attempt number
  const { data: attempts } = await supabase
    .from('test_attempts')
    .select('attempt_number')
    .eq('user_id', user.id)
    .eq('test_set_id', testId)
    .order('attempt_number', { ascending: false })
    .limit(1)

  const nextAttempt = (attempts?.[0]?.attempt_number || 0) + 1

  // 5. Create fresh session
  const { data: session, error } = await supabase
    .from('test_attempts')
    .insert({
      user_id: user.id,
      test_set_id: testId,
      attempt_number: nextAttempt,
      time_limit: test.time_limit_minutes,
      status: 'in_progress'
    })
    .select()
    .single()

  if (error) return { error: error.message }

  return { sessionId: session.id, startTime: session.start_time, timeLimit: session.time_limit }
}

export async function getSessionProgress(sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: answers } = await supabase
    .from('student_answers')
    .select('question_id, selected_option_index, is_flagged')
    .eq('attempt_id', sessionId)

  return { answers: answers || [] }
}

export async function updateTestProgress(
  sessionId: string, 
  questionId: string, 
  selectedOption: number | null, 
  isFlagged: boolean = false
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('student_answers')
    .upsert({
      attempt_id: sessionId,
      question_id: questionId,
      selected_option_index: selectedOption,
      is_flagged: isFlagged,
      updated_at: new Date().toISOString()
    }, { onConflict: 'attempt_id,question_id' })

  if (error) return { error: error.message }
  return { success: true }
}

export async function finalizeTest(sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Get session and test details
  const { data: session } = await supabase
    .from('test_attempts')
    .select('*, test_sets(*)')
    .eq('id', sessionId)
    .single()

  if (!session) return { error: 'Session not found' }
  if (session.status !== 'in_progress') return { error: 'Session already finalized' }

  const testData = (session.test_sets as any)
  
  // Get all questions to correlate answers
  const { data: questionLinks } = await supabase
    .from('test_questions')
    .select('question_id, questions(correct_option_index)')
    .eq('test_set_id', session.test_set_id)

  // Get student answers
  const { data: savedAnswers } = await supabase
    .from('student_answers')
    .select('*')
    .eq('attempt_id', sessionId)

  const answersMap = new Map(savedAnswers?.map(a => [a.question_id, a.selected_option_index]))

  let score = 0
  let correctAnswers = 0
  const totalQuestions = questionLinks?.length || 0

  questionLinks?.forEach((q: any) => {
    const studentAns = answersMap.get(q.question_id)
    const correctAns = q.questions?.correct_option_index

    if (studentAns === undefined || studentAns === null) {
      // Unanswered: no points added or subtracted
    } else if (studentAns === correctAns) {
      correctAnswers++
      score += Number(testData.marks_per_question || 1)
    } else {
      score -= Number(testData.negative_marks || 0)
    }
  })

  // Final score as percentage
  const maxScore = totalQuestions * Number(testData.marks_per_question || 1)
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0

  // Create final result
  const { data: result, error: resultError } = await supabase
    .from('test_results')
    .insert({
      user_id: user.id,
      test_set_id: session.test_set_id,
      score: percentage,
      total_questions: totalQuestions,
      correct_answers: correctAnswers,
      time_spent_seconds: Math.floor((new Date().getTime() - new Date(session.start_time).getTime()) / 1000)
    })
    .select()
    .single()

  if (resultError) return { error: resultError.message }

  // Update session status
  await supabase
    .from('test_attempts')
    .update({ status: 'completed', updated_at: new Date().toISOString() })
    .eq('id', sessionId)

  // Add notification
  await supabase.from('notifications').insert({
    user_id: user.id,
    type: 'test_completed',
    title: 'Test Completed',
    message: `You completed "${testData.title}" with a score of ${Math.round(percentage)}%.`
  })

  return { success: true, resultId: result.id }
}

export async function getSubjectProgress() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // Get subjects and results in parallel
  const [
    { data: subjects, error: subError },
    { data: results }
  ] = await Promise.all([
    supabase.from('subjects').select('id, name, categories(name)'),
    supabase.from('test_results').select('score, test_sets(subject_id)').eq('user_id', user.id)
  ])

  if (subError || !subjects) return []

  const progressData = subjects.map(sub => {
    const subResults = results?.filter(r => (r.test_sets as any)?.subject_id === sub.id) || []
    const avgScore = subResults.length > 0
      ? Math.round(subResults.reduce((acc, r) => acc + Number(r.score), 0) / subResults.length)
      : 0

    return {
      name: sub.name,
      progress: avgScore,
      color: 'bg-primary' // Default color
    }
  })

  return progressData
}

export async function getAvailableTests() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('test_sets')
    .select('id, title, test_type, time_limit_minutes, created_at')
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) return []

  return data.map(test => ({
    id: test.id,
    title: test.title,
    date: new Date(test.created_at).toLocaleDateString(),
    duration: `${test.time_limit_minutes} min`,
    difficulty: test.test_type === 'short' ? 'Medium' : 'Hard' // Simple mapping for now
  }))
}

export async function logTestViolation(
  sessionId: string,
  testId: string,
  violationType: string,
  details: any = {}
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('test_violations')
    .insert({
      user_id: user.id,
      test_set_id: testId,
      attempt_id: sessionId,
      violation_type: violationType,
      details: details
    })

  if (error) {
    console.error('Error logging violation:', error)
    return { error: error.message }
  }

  return { success: true }
}

export async function terminateTestSession(sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('test_attempts')
    .update({ 
      status: 'terminated', 
      updated_at: new Date().toISOString() 
    })
    .eq('id', sessionId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function getDetailedSubjectProgress() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // Get subjects and results for this user in parallel
  const [
    { data: subjects, error: subError },
    { data: results }
  ] = await Promise.all([
    supabase.from('subjects').select('id, name, description, test_sets(id, title)').eq('status', 'enabled'),
    supabase.from('test_results').select('score, completed_at, test_set_id').eq('user_id', user.id)
  ])

  if (subError || !subjects) return []

  const progressData = subjects.map(sub => {
    const totalTests = sub.test_sets?.length || 0
    const subResults = results?.filter(r => sub.test_sets?.some((t: any) => t.id === r.test_set_id)) || []
    
    // Get unique completed tests
    const completedTestIds = new Set(subResults.map(r => r.test_set_id))
    const completedCount = completedTestIds.size
    
    const avgScore = subResults.length > 0
      ? Math.round(subResults.reduce((acc, r) => acc + Number(r.score), 0) / subResults.length)
      : 0

    const bestScore = subResults.length > 0
      ? Math.max(...subResults.map(r => Number(r.score)))
      : 0

    const latestActivity = subResults.length > 0
      ? new Date(Math.max(...subResults.map(r => new Date(r.completed_at).getTime()))).toLocaleDateString()
      : 'No activity'

    return {
      id: sub.id,
      name: sub.name,
      description: sub.description,
      totalTests,
      completedCount,
      avgScore,
      bestScore,
      latestActivity,
      completionRate: totalTests > 0 ? Math.round((completedCount / totalTests) * 100) : 0
    }
  })

  return progressData
}

export async function getSubjectResultsDetails(subjectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { subject: null, tests: [], stats: null, history: [], accuracy: null, difficultyBreakdown: [] }

  // Fetch everything in parallel using joins where possible
  const [
    { data: subject },
    { data: tests, error: testError },
    { data: results, error: resError },
    { data: qLinks }
  ] = await Promise.all([
    supabase.from('subjects').select('id, name, description').eq('id', subjectId).single(),
    supabase.from('test_sets').select('id, title, time_limit_minutes, pass_percentage').eq('subject_id', subjectId).eq('is_hidden', false).order('created_at', { ascending: true }),
    supabase.from('test_results').select('id, score, completed_at, total_questions, correct_answers, time_spent_seconds, test_set_id, test_sets!inner(title, pass_percentage, subject_id)').eq('user_id', user.id).eq('test_sets.subject_id', subjectId).order('completed_at', { ascending: true }),
    supabase.from('test_questions').select('question_id, test_set_id, questions(difficulty_level), test_sets!inner(subject_id)').eq('test_sets.subject_id', subjectId)
  ])

  if (testError || resError || !tests) return { subject: subject || null, tests: [], stats: null, history: [], accuracy: null, difficultyBreakdown: [] }

  // 3. Crunch Summary Stats
  const totalAttempts = results?.length || 0
  const avgScore = totalAttempts > 0 
    ? Math.round(results.reduce((acc, r) => acc + Number(r.score), 0) / totalAttempts)
    : 0
  const highestScore = totalAttempts > 0
    ? Math.max(...results.map(r => Number(r.score)))
    : 0
  const passRate = totalAttempts > 0
    ? Math.round((results.filter(r => Number(r.score) >= (r.test_sets as any)?.pass_percentage).length / totalAttempts) * 100)
    : 0

  // 4. Accuracy Breakdown
  const totalCorrect = results?.reduce((acc, r) => acc + (r.correct_answers || 0), 0) || 0
  const totalAnswered = results?.reduce((acc, r) => acc + (r.total_questions || 0), 0) || 0
  const accuracy = totalAnswered > 0 
    ? { correct: totalCorrect, total: totalAnswered, percentage: Math.round((totalCorrect / totalAnswered) * 100) }
    : { correct: 0, total: 0, percentage: 0 }

  const difficultyStats: Record<string, { total: number, correct: number }> = {
    'easy': { total: 0, correct: 0 },
    'medium': { total: 0, correct: 0 },
    'hard': { total: 0, correct: 0 }
  }

  // Note: For true difficulty analysis we'd need to cross-ref student_answers. 
  // For now, let's provide a breakdown of how many questions they've faced in each category.
  qLinks?.forEach(link => {
    const diff = (link.questions as any)?.difficulty_level || 'medium'
    if (difficultyStats[diff]) difficultyStats[diff].total++
  })

  return {
    subject,
    stats: { totalAttempts, avgScore, highestScore, passRate },
    history: results.map(r => ({
      id: r.id,
      testTitle: (r.test_sets as any).title,
      score: Math.round(Number(r.score)),
      date: new Date(r.completed_at).toLocaleDateString(),
      passed: Number(r.score) >= (r.test_sets as any).pass_percentage
    })),
    accuracy,
    difficultyBreakdown: Object.entries(difficultyStats).map(([name, val]) => ({ name, value: val.total })),
    tests: tests.map(t => ({
      id: t.id,
      title: t.title,
      duration: `${t.time_limit_minutes} min`,
      result: results?.filter(r => r.test_set_id === t.id).reverse()[0] || null
    }))
  }
}

export async function updateProfileAvatar(url: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({
      avatar_url: url,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/profile')
  return { success: true }
}

export async function studentSearch(query: string) {
  const supabase = await createClient()

  if (!query || query.trim() === '') {
    return { subjects: [], tests: [] }
  }

  const searchTerm = `%${query.trim()}%`

  const [
    { data: subjects },
    { data: tests }
  ] = await Promise.all([
    supabase
      .from('subjects')
      .select('id, name, description')
      .eq('status', 'enabled')
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(5),
    supabase
      .from('test_sets')
      .select('id, title, description, subject_id')
      .eq('is_hidden', false)
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(5)
  ])

  return {
    subjects: subjects || [],
    tests: tests || []
  }
}

export async function getNotifications() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching notifications:', error)
    return []
  }

  return data
}

export async function markNotificationAsRead(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)

  if (error) {
    console.error('Error marking notification as read:', error)
    return { error: error.message }
  }
  
  return { success: true }
}
