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

export async function getModules() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data: modules, error } = await supabase
    .from('modules')
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

  return modules.map(mod => ({
    id: mod.id,
    name: mod.name,
    description: mod.description,
    price: mod.price,
    imageUrl: mod.image_url,
    totalTests: mod.test_sets?.length || 0,
    freeTests: mod.test_sets?.filter((t: any) => !t.is_paid).length || 0,
    paidTests: mod.test_sets?.filter((t: any) => t.is_paid).length || 0
  }))
}

export async function getModuleTests(moduleId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { module: null, tests: [] }

  // Fetch all data in parallel
  const [
    { data: module },
    { data: tests, error },
    { data: purchases },
    { data: allAttempts }
  ] = await Promise.all([
    supabase.from('modules').select('id, name, description, price, enable_purchase').eq('id', moduleId).single(),
    supabase.from('test_sets').select('id, title, description, time_limit_minutes, is_paid, price, attempts_allowed, cooldown_hours, test_questions(count)').eq('module_id', moduleId).eq('is_hidden', false).order('created_at', { ascending: true }),
    supabase.from('payments').select('test_set_id, module_id').eq('user_id', user.id).eq('status', 'completed'),
    supabase.from('test_attempts').select('test_set_id, status, updated_at, attempt_number').eq('user_id', user.id)
  ])

  if (error || !tests) return { module: module || null, tests: [] }

  const purchasedIds = new Set(purchases?.map(p => p.test_set_id) || [])
  const attemptsByTest = new Map<string, any[]>()
  allAttempts?.forEach(a => {
    if (!attemptsByTest.has(a.test_set_id)) attemptsByTest.set(a.test_set_id, [])
    attemptsByTest.get(a.test_set_id)?.push(a)
  })

  const mappedTests = tests.map(test => {
    const testAttempts = attemptsByTest.get(test.id) || []
    
    // 1. Security Lockout (Hardcoded 1hr for termination)
    const lastTermination = testAttempts.filter(a => a.status === 'terminated').sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0]
    let securityLockoutMinutes = 0
    if (lastTermination) {
        const lockoutEnd = new Date(new Date(lastTermination.updated_at).getTime() + 60 * 60 * 1000)
        securityLockoutMinutes = Math.ceil((lockoutEnd.getTime() - new Date().getTime()) / (1000 * 60))
    }

    // 2. Custom Cooldown
    const lastAttempt = [...testAttempts].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0]
    let cooldownLockoutMinutes = 0
    if (lastAttempt && test.cooldown_hours > 0) {
        const cooldownEnd = new Date(new Date(lastAttempt.updated_at).getTime() + test.cooldown_hours * 60 * 60 * 1000)
        cooldownLockoutMinutes = Math.ceil((cooldownEnd.getTime() - new Date().getTime()) / (1000 * 60))
    }

    // 3. Attempt Limit
    const completedAttempts = testAttempts.filter(a => a.status === 'completed').length
    const isLimitReached = test.attempts_allowed > 0 && completedAttempts >= test.attempts_allowed

    const finalLockout = Math.max(0, securityLockoutMinutes, cooldownLockoutMinutes)

    const isModulePurchased = purchases?.some(p => p.module_id === moduleId)
    const purchasedTestIds = new Set(purchases?.filter(p => p.test_set_id).map(p => p.test_set_id) || [])

    return {
      id: test.id,
      title: test.title,
      description: test.description,
      duration: `${test.time_limit_minutes} min`,
      questionCount: (test.test_questions as any)[0]?.count || 0,
      isPaid: test.is_paid,
      price: test.price,
      isUnlocked: !test.is_paid || isModulePurchased || purchasedTestIds.has(test.id),
      lockoutMinutes: finalLockout,
      isLimitReached: isLimitReached && finalLockout <= 0, // Only show as reached if not already timed out
      completedAttempts,
      attemptsAllowed: test.attempts_allowed
    }
  })

  return { 
    module: { 
      ...module, 
      isUnlocked: purchases?.some(p => p.module_id === moduleId) 
    }, 
    tests: mappedTests 
  }
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

  let questions = questionLinks?.map(link => {
      const q = (link.questions as any)
      return {
          ...q,
          options: q.options.map((text: string, index: number) => ({ text, index }))
      }
  }) || []

  // Randomization Logic
  if (test.randomize_questions || test.randomize_answers) {
      // Find attempt to use as part of seed for stability
      const { data: latestAttempt } = await supabase
        .from('test_attempts')
        .select('attempt_number, status')
        .eq('user_id', user.id)
        .eq('test_set_id', testId)
        .order('attempt_number', { ascending: false })
        .limit(1)
        .single()
      
      const attemptNum = latestAttempt ? (latestAttempt.status === 'in_progress' ? latestAttempt.attempt_number : latestAttempt.attempt_number + 1) : 1
      const seedBase = `${user.id}-${testId}-${attemptNum}`

      // Helper for seeded random
      const createRng = (seedStr: string) => {
          let h = 0; for (let i = 0; i < seedStr.length; i++) { h = Math.imul(31, h) + seedStr.charCodeAt(i) | 0; }
          return () => { h = h * 1664525 + 1013904223 | 0; return (h >>> 0) / 4294967296; }
      }

      if (test.randomize_questions) {
          const rng = createRng(seedBase + '-q')
          for (let i = questions.length - 1; i > 0; i--) {
              const j = Math.floor(rng() * (i + 1));
              [questions[i], questions[j]] = [questions[j], questions[i]];
          }
      }

      if (test.randomize_answers) {
          questions = questions.map((q, qIdx) => {
              const rng = createRng(seedBase + `-a-${q.id}`)
              const shuffledOptions = [...q.options]
              for (let i = shuffledOptions.length - 1; i > 0; i--) {
                  const j = Math.floor(rng() * (i + 1));
                  [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
              }
              return { ...q, options: shuffledOptions }
          })
      }
  }

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

  // 1. Get result and test settings
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
        show_score,
        show_answers,
        show_explanation,
        modules(name)
      )
    `)
    .eq('id', resultId)
    .single()

  if (error || !data) return null

  const test = (data.test_sets as any)
  const accuracy = data.total_questions > 0 
    ? Math.round((data.correct_answers / data.total_questions) * 100) 
    : 0
    
  const passPercentage = test?.pass_percentage || 40
  const status = Number(data.score) >= passPercentage ? 'Passed' : 'Failed'

  // 2. Fetch Review Data if allowed (or partially allowed)
  let reviewItems = null
  
  // Find the attempt that generated this result (latest completed before result was created)
  const { data: attempt } = await supabase
    .from('test_attempts')
    .select('id')
    .eq('user_id', user.id)
    .eq('test_set_id', test.id)
    .eq('status', 'completed')
    .lte('updated_at', data.completed_at)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  if (attempt) {
    const [
        { data: questionLinks },
        { data: savedAnswers }
    ] = await Promise.all([
        supabase.from('test_questions').select('questions(*)').eq('test_set_id', test.id).order('sort_order', { ascending: true }),
        supabase.from('student_answers').select('*').eq('attempt_id', attempt.id)
    ])

    const answersMap = new Map(savedAnswers?.map(a => [a.question_id, a]))

    reviewItems = questionLinks?.map(link => {
        const q = (link.questions as any)
        const ans = answersMap.get(q.id)
        
        return {
            id: q.id,
            questionText: q.question_text,
            options: q.options,
            selectedOption: ans?.selected_option_index,
            // Respect visibility settings
            correctOption: test.show_answers ? q.correct_option_index : null,
            explanation: test.show_explanation ? q.explanation : null,
            isCorrect: test.show_answers ? (ans?.selected_option_index === q.correct_option_index) : null
        }
    }) || []
  }

  return {
    ...data,
    accuracy,
    status,
    showScore: test.show_score,
    showAnswers: test.show_answers,
    showExplanation: test.show_explanation,
    reviewItems,
    moduleName: test?.modules?.name || 'General'
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
        modules(name)
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
      module: (r.test_sets as any)?.modules?.name || 'General',
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
    .select('id, title, test_type, time_limit_minutes, modules(name)')
    .eq('is_paid', false)
    .eq('is_hidden', false)

  // Get purchased tests
  const { data: purchases } = await supabase
    .from('payments')
    .select('test_set_id, test_sets(id, title, test_type, time_limit_minutes, modules(name))')
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
      module: (test.modules as any)?.name || 'General',
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
      test_sets(title, modules(name))
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return []

  return payments.map(p => ({
    id: p.id,
    testName: (p.test_sets as any)?.title,
    module: (p.test_sets as any)?.modules?.name || 'General',
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

  revalidatePath('/dashboard/modules')
  revalidatePath(`/dashboard/modules/${testId}`)
  
  return { success: true }
}

export async function unlockModule(moduleId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Get module details
  const { data: module } = await supabase
    .from('modules')
    .select('name, price')
    .eq('id', moduleId)
    .single()

  if (!module) return { error: 'Module not found' }

  const { error } = await supabase
    .from('payments')
    .insert({
      user_id: user.id,
      module_id: moduleId,
      amount: module.price || 49,
      status: 'completed',
      transaction_id: `MOD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    })

  if (error) return { error: error.message }

  // Add notification
  await supabase.from('notifications').insert({
    user_id: user.id,
    type: 'payment_success',
    title: 'Module Unlocked',
    message: `You have successfully unlocked the entire "${module.name}" module. All tests are now available.`
  })

  revalidatePath('/dashboard/modules')
  revalidatePath(`/dashboard/modules/${moduleId}`)
  
  return { success: true }
}

export async function startTestSession(testId: string, requestedSessionId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // 1. Get test details (limits and cooldown)
  const { data: test } = await supabase
    .from('test_sets')
    .select('id, time_limit_minutes, attempts_allowed, cooldown_hours')
    .eq('id', testId)
    .single()

  if (!test) return { error: 'Test not found' }

  // 2. Fetch user attempts for this test
  const { data: testAttempts } = await supabase
    .from('test_attempts')
    .select('status, updated_at, attempt_number')
    .eq('user_id', user.id)
    .eq('test_set_id', testId)

  // 3. Security Check: Hardcoded 1-hour lockout for termination/violations
  const lastTermination = testAttempts?.filter(a => a.status === 'terminated').sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0]
  if (lastTermination) {
    const lockoutEnd = new Date(new Date(lastTermination.updated_at).getTime() + 60 * 60 * 1000)
    if (new Date() < lockoutEnd) {
        const minutesLeft = Math.ceil((lockoutEnd.getTime() - new Date().getTime()) / (1000 * 60))
        return { 
            error: `Test locked due to security violations. Please try again in ${minutesLeft} minutes.`,
            lockoutMinutes: minutesLeft
        }
    }
  }

  // 4. Custom Cooldown Check
  if (test.cooldown_hours > 0) {
    const lastAttempt = testAttempts?.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0]
    if (lastAttempt) {
        const cooldownEnd = new Date(new Date(lastAttempt.updated_at).getTime() + test.cooldown_hours * 60 * 60 * 1000)
        if (new Date() < cooldownEnd) {
            const minutesLeft = Math.ceil((cooldownEnd.getTime() - new Date().getTime()) / (1000 * 60))
            return { 
                error: `Please wait ${minutesLeft} minutes before re-taking this test (Cooldown enabled).`,
                lockoutMinutes: minutesLeft
            }
        }
    }
  }

  // 5. Attempt Limit Check
  if (test.attempts_allowed > 0) {
    const completedAttempts = testAttempts?.filter(a => a.status === 'completed').length || 0
    if (completedAttempts >= test.attempts_allowed) {
        return { error: `You have reached the maximum allowed attempts (${test.attempts_allowed}) for this test.` }
    }
  }

  // 6. Handle Resumption if sessionId is provided
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

  // 7. Abandon any existing in_progress sessions for this user/test set
  await supabase
    .from('test_attempts')
    .update({ status: 'abandoned', updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('test_set_id', testId)
    .eq('status', 'in_progress')

  // 8. Get latest attempt number for numbering
  const nextAttempt = (testAttempts?.sort((a, b) => b.attempt_number - a.attempt_number)[0]?.attempt_number || 0) + 1

  // 9. Create fresh session
  const { data: session, error: sessionError } = await supabase
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

  if (sessionError) return { error: sessionError.message }

  return { sessionId: session.id, startTime: session.start_time, timeLimit: session.time_limit }
}

export async function getSessionProgress(sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: answers } = await supabase
    .from('student_answers')
    .select('question_id, selected_option_index, selected_options, is_flagged')
    .eq('attempt_id', sessionId)

  return { answers: answers || [] }
}

export async function updateTestProgress(
  sessionId: string, 
  questionId: string, 
  selectedOption: number | number[] | null, 
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
      selected_option_index: typeof selectedOption === 'number' ? selectedOption : null,
      selected_options: Array.isArray(selectedOption) ? selectedOption : null,
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
    .select('question_id, questions(question_type, correct_option_index, correct_options)')
    .eq('test_set_id', session.test_set_id)

  // Get student answers
  const { data: savedAnswers } = await supabase
    .from('student_answers')
    .select('*')
    .eq('attempt_id', sessionId)

  const answersMap = new Map(savedAnswers?.map(a => [a.question_id, a]))

  let score = 0
  let correctAnswers = 0
  const totalQuestions = questionLinks?.length || 0

  questionLinks?.forEach((q: any) => {
    const studentAns = answersMap.get(q.question_id)
    const question = q.questions
    const qType = question?.question_type || 'single'

    let isCorrect = false

    if (qType === 'multiple') {
      const studentSelected = studentAns?.selected_options || []
      const correctOptions = question?.correct_options || []
      
      // All or nothing
      isCorrect = studentSelected.length > 0 && 
                  studentSelected.length === correctOptions.length &&
                  studentSelected.every((val: number) => correctOptions.includes(val))
    } else {
      const studentIdx = studentAns?.selected_option_index
      const correctIdx = question?.correct_option_index
      isCorrect = studentIdx !== null && studentIdx !== undefined && studentIdx === correctIdx
    }

    if (isCorrect) {
      correctAnswers++
      score += Number(testData.marks_per_question || 1)
    } else if (qType === 'multiple' ? (studentAns?.selected_options?.length > 0) : (studentAns?.selected_option_index !== null && studentAns?.selected_option_index !== undefined)) {
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

export async function getModuleProgress() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // Get modules and results in parallel
  const [
    { data: modules, error: modError },
    { data: results }
  ] = await Promise.all([
    supabase.from('modules').select('id, name, categories(name)'),
    supabase.from('test_results').select('score, test_sets(module_id)').eq('user_id', user.id)
  ])

  if (modError || !modules) return []

  const progressData = modules.map(mod => {
    const modResults = results?.filter(r => (r.test_sets as any)?.module_id === mod.id) || []
    const avgScore = modResults.length > 0
      ? Math.round(modResults.reduce((acc, r) => acc + Number(r.score), 0) / modResults.length)
      : 0

    return {
      name: mod.name,
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

export async function getDetailedModuleProgress() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // Get modules and results for this user in parallel
  const [
    { data: modules, error: modError },
    { data: results }
  ] = await Promise.all([
    supabase.from('modules').select('id, name, description, test_sets(id, title)').eq('status', 'enabled'),
    supabase.from('test_results').select('score, completed_at, test_set_id').eq('user_id', user.id)
  ])

  if (modError || !modules) return []

  const progressData = modules.map(mod => {
    const totalTests = mod.test_sets?.length || 0
    const modResults = results?.filter(r => mod.test_sets?.some((t: any) => t.id === r.test_set_id)) || []
    
    // Get unique completed tests
    const completedTestIds = new Set(modResults.map(r => r.test_set_id))
    const completedCount = completedTestIds.size
    
    const avgScore = modResults.length > 0
      ? Math.round(modResults.reduce((acc, r) => acc + Number(r.score), 0) / modResults.length)
      : 0

    const bestScore = modResults.length > 0
      ? Math.max(...modResults.map(r => Number(r.score)))
      : 0

    const latestActivity = modResults.length > 0
      ? new Date(Math.max(...modResults.map(r => new Date(r.completed_at).getTime()))).toLocaleDateString()
      : 'No activity'

    return {
      id: mod.id,
      name: mod.name,
      description: mod.description,
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

export async function getModuleResultsDetails(moduleId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { module: null, tests: [], stats: null, history: [], accuracy: null, difficultyBreakdown: [] }

  // Fetch everything in parallel using joins where possible
  const [
    { data: module },
    { data: tests, error: testError },
    { data: results, error: resError },
    { data: qLinks }
  ] = await Promise.all([
    supabase.from('modules').select('id, name, description').eq('id', moduleId).single(),
    supabase.from('test_sets').select('id, title, time_limit_minutes, pass_percentage').eq('module_id', moduleId).eq('is_hidden', false).order('created_at', { ascending: true }),
    supabase.from('test_results').select('id, score, completed_at, total_questions, correct_answers, time_spent_seconds, test_set_id, test_sets!inner(title, pass_percentage, module_id)').eq('user_id', user.id).eq('test_sets.module_id', moduleId).order('completed_at', { ascending: true }),
    supabase.from('test_questions').select('question_id, test_set_id, questions(difficulty_level), test_sets!inner(module_id)').eq('test_sets.module_id', moduleId)
  ])

  if (testError || resError || !tests) return { module: module || null, tests: [], stats: null, history: [], accuracy: null, difficultyBreakdown: [] }

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
    module,
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
    return { modules: [], tests: [] }
  }

  const searchTerm = `%${query.trim()}%`

  const [
    { data: modules },
    { data: tests }
  ] = await Promise.all([
    supabase
      .from('modules')
      .select('id, name, description')
      .eq('status', 'enabled')
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(5),
    supabase
      .from('test_sets')
      .select('id, title, description, module_id')
      .eq('is_hidden', false)
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(5)
  ])

  return {
    modules: modules || [],
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
