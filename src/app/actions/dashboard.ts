'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import nodemailer from 'nodemailer'

function createMailTransporter() {
  const port = parseInt(process.env.SMTP_PORT || '465')
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
}

// Service role client for bypassing RLS on payments table (students can't read their own payments via RLS)
function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function getDashboardStats(existingUser?: any) {
  const supabase = await createClient()
  const user = existingUser || (await supabase.auth.getUser()).data.user

  if (!user) return { error: 'Not authenticated' }

  // Get test results and payments in parallel
  const [
    { data: results, error },
    { count: purchasedCount }
  ] = await Promise.all([
    supabase.from('test_results').select('score, completed_at, test_sets(pass_percentage)').eq('user_id', user.id),
    getAdminClient().from('payments').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed')
  ])

  if (error) return { error: error.message }
  if (!results) return { testsTaken: 0, avgScore: '0%', testsPassed: 0, purchasedTests: purchasedCount || 0 }


  const testsTaken = results?.length || 0
  const avgScore = testsTaken > 0 
    ? Math.round(results.reduce((acc, r) => acc + Number(r.score), 0) / testsTaken)
    : 0

  const testsPassed = results?.filter(r => {
    const passPercentage = (r.test_sets as any)?.pass_percentage || 75
    return Number(r.score) >= passPercentage
  }).length || 0

  return {
    testsTaken,
    avgScore: `${avgScore}%`,
    testsPassed,
    purchasedTests: purchasedCount || 0
  }
}

export async function getPerformanceData(existingUser?: any) {
  const supabase = await createClient()
  const user = existingUser || (await supabase.auth.getUser()).data.user

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

export async function getRecentActivity(existingUser?: any) {
  const supabase = await createClient()
  const user = existingUser || (await supabase.auth.getUser()).data.user

  if (!user) return []

  const [
    { data: results },
    { data: payments }
  ] = await Promise.all([
    supabase.from('test_results').select('id, score, completed_at, test_sets(title)').eq('user_id', user.id).order('completed_at', { ascending: false }).limit(3),
    getAdminClient().from('payments').select('id, amount, created_at, test_sets(title), modules(name)').eq('user_id', user.id).eq('status', 'completed').order('created_at', { ascending: false }).limit(3)
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
      title: (p.test_sets as any)?.title || (p.modules as any)?.name || 'Unlock Completed',
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

  // Fetch modules and module-level payments in parallel
  const [
    { data: modules, error },
    { data: modulePurchases }
  ] = await Promise.all([
    supabase
      .from('modules')
      .select(`
        id, 
        name, 
        description,
        price,
        image_url,
        icon_url,
        test_sets(id, is_paid)
      `)
      .eq('status', 'enabled'),
    getAdminClient()
      .from('payments')
      .select('module_id')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .not('module_id', 'is', null)
  ])

  if (error || !modules) return []

  const purchasedModuleIds = new Set(modulePurchases?.map(p => p.module_id) || [])

  const mappedModules = modules.map(mod => ({
    id: mod.id,
    name: mod.name,
    description: mod.description,
    price: mod.price,
    imageUrl: mod.image_url,
    iconUrl: mod.icon_url,
    totalTests: mod.test_sets?.length || 0,
    freeTests: mod.test_sets?.filter((t: any) => !t.is_paid).length || 0,
    paidTests: mod.test_sets?.filter((t: any) => t.is_paid).length || 0,
    isUnlocked: purchasedModuleIds.has(mod.id)
  }))

  // Natural sort by name (e.g. Module 1, Module 2, ..., Module 10)
  return mappedModules.sort((a, b) => {
    const parseName = (n: string) => {
      const match = n.match(/^(.*?)(\d+)\s*$/)
      return match ? { prefix: match[1].toLowerCase(), num: parseInt(match[2]) } : { prefix: n.toLowerCase(), num: 0 }
    }
    const pa = parseName(a.name), pb = parseName(b.name)
    if (pa.prefix !== pb.prefix) return pa.prefix.localeCompare(pb.prefix)
    return pa.num - pb.num
  })
}

export async function getPublicModules() {
  const supabase = await createClient()

  const { data: modules, error } = await supabase
    .from('modules')
    .select(`
      id, 
      name, 
      description,
      price,
      image_url,
      icon_url,
      test_sets(id, is_paid)
    `)
    .eq('status', 'enabled')
    .limit(6)

  if (error) {
    console.error('Error fetching public modules:', error)
    return []
  }

  if (!modules || modules.length === 0) {
    console.log('No enabled modules found in database.')
    return []
  }

  console.log(`Found ${modules.length} public modules.`)

  return modules.map(mod => ({
    id: mod.id,
    name: mod.name,
    description: mod.description,
    price: mod.price,
    imageUrl: mod.image_url,
    iconUrl: mod.icon_url,
    totalTests: mod.test_sets?.length || 0,
    freeTests: mod.test_sets?.filter((t: any) => !t.is_paid).length || 0,
    paidTests: mod.test_sets?.filter((t: any) => t.is_paid).length || 0
  }))
}

export async function getModuleTests(moduleId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { module: null, tests: [] }

  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [
    { data: moduleInfo },
    { data: tests, error: testsError },
    { data: purchases },
    { data: allAttempts },
    { data: results },
    { data: violations }
  ] = await Promise.all([
    supabase.from('modules').select('id, name, description, price, enable_purchase').eq('id', moduleId).single(),
    adminClient.from('test_sets').select('id, title, description, time_limit_minutes, is_paid, price, attempts_allowed, cooldown_hours, target_questions, test_questions(count)').eq('module_id', moduleId).eq('is_hidden', false).order('created_at', { ascending: true }),
    adminClient.from('payments').select('test_set_id, module_id').eq('user_id', user.id).eq('status', 'completed'),
    supabase.from('test_attempts').select('test_set_id, status, updated_at, attempt_number').eq('user_id', user.id),
    supabase.from('test_results').select('test_set_id, completed_at, is_violation').eq('user_id', user.id).order('completed_at', { ascending: false }),
    supabase.from('exam_violations').select('exam_id, created_at').eq('user_id', user.id).order('created_at', { ascending: false })
  ])

  if (testsError || !moduleInfo) return { module: moduleInfo || null, tests: [] }

  const purchasedIds = new Set(purchases?.map(p => p.test_set_id) || [])
  const attemptsByTest = new Map<string, any[]>()
  allAttempts?.forEach(a => {
    if (!attemptsByTest.has(a.test_set_id)) attemptsByTest.set(a.test_set_id, [])
    attemptsByTest.get(a.test_set_id)?.push(a)
  })

    const mappedTests = tests.map(test => {
      const testAttempts = attemptsByTest.get(test.id) || []
      const completedAttempts = testAttempts.filter(a => a.status === 'completed').length
      
      // Calculate 1-hour lockout
      let lockoutMinutes = 0
      const lastResult = results?.find(r => r.test_set_id === test.id)
      
      // Check violation from result OR separate violations table
      const isViolationResult = lastResult ? !!(lastResult as any).is_violation : false
      const hasViolationRecord = violations?.some(v => v.exam_id === test.id)
      
      if (isViolationResult || hasViolationRecord) {
        const lastTime = lastResult?.completed_at || violations?.find(v => v.exam_id === test.id)?.created_at
        if (lastTime) {
          const diffMs = new Date().getTime() - new Date(lastTime).getTime()
          const diffMins = Math.floor(diffMs / 60000)
          if (diffMins < 60) {
            lockoutMinutes = 60 - diffMins
          }
        }
      }

    const isModulePurchased = purchases?.some(p => p.module_id === moduleId)
    const purchasedTestIds = new Set(purchases?.filter(p => p.test_set_id).map(p => p.test_set_id) || [])

    // If module is purchased, unlimited attempts — never limit reached
    const isLimitReached = !isModulePurchased && test.attempts_allowed > 0 && completedAttempts >= test.attempts_allowed

    return {
      id: test.id,
      title: test.title,
      description: test.description,
      duration: `${test.time_limit_minutes} min`,
      questionCount: (test.test_questions as any)?.[0]?.count || test.target_questions || 0,
      isPaid: test.is_paid,
      price: test.price,
      isUnlocked: !test.is_paid || isModulePurchased || purchasedTestIds.has(test.id),
      lockoutMinutes: lockoutMinutes,
      isLimitReached: isLimitReached && lockoutMinutes <= 0,
      completedAttempts,
      attemptsAllowed: isModulePurchased ? 0 : test.attempts_allowed, // 0 = unlimited for purchased
      isModulePurchased: !!isModulePurchased
    }
  })

  return { 
    module: { 
      ...moduleInfo, 
      isUnlocked: purchases?.some(p => p.module_id === moduleId) 
    }, 
    tests: mappedTests.sort((a, b) => {
      // Free tests (isPaid: false) come first
      if (!a.isPaid && b.isPaid) return -1
      if (a.isPaid && !b.isPaid) return 1
      // Within same tier, sort by title with natural (numeric-aware) order
      // e.g. "Free Test 1" < "Free Test 2" < "Free Test 10"
      const parseTitle = (t: string) => {
        const m = t.match(/^(.*?)(\d+)\s*$/)
        return m ? { prefix: m[1].toLowerCase(), num: parseInt(m[2]) } : { prefix: t.toLowerCase(), num: 0 }
      }
      const pa = parseTitle(a.title), pb = parseTitle(b.title)
      if (pa.prefix !== pb.prefix) return pa.prefix.localeCompare(pb.prefix)
      return pa.num - pb.num
    })
  }
}

export async function getTestData(testId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get test details with module name
  const { data: test, error: testError } = await supabase
    .from('test_sets')
    .select(`
      id, 
      title, 
      description, 
      time_limit_minutes, 
      randomize_questions, 
      randomize_answers, 
      marks_per_question, 
      negative_marks, 
      module_id, 
      price, 
      test_type,
      modules(name)
    `)
    .eq('id', testId)
    .single()

  if (!test) return null

  // Check for 1-hour lockout due to violations
  const { data: lastResult } = await supabase
    .from('test_results')
    .select('completed_at, is_violation')
    .eq('user_id', user.id)
    .eq('test_set_id', testId)
    .order('completed_at', { ascending: false })
    .limit(1)
    .single()

  if (lastResult) {
    let isViolation = !!(lastResult as any).is_violation
    
    // Fallback: check violation count if flag isn't set
    if (!isViolation) {
      const { count } = await supabase
        .from('exam_violations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('exam_id', testId)
      
      if (count !== null && count >= 5) {
        isViolation = true
      }
    }

    if (isViolation) {
      const completionTime = new Date(lastResult.completed_at).getTime()
      const currentTime = new Date().getTime()
      const diffMins = Math.floor((currentTime - completionTime) / (1000 * 60))
      
      if (diffMins < 60) {
        return {
          locked: true,
          lockoutMinutes: 60 - diffMins
        }
      }
    }
  }

  // Get questions for this test using service role to bypass RLS on server
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Fetch question IDs and sort order from test_questions first
  const { data: questionLinks, error: linkError } = await adminClient
    .from('test_questions')
    .select('question_id, sort_order')
    .eq('test_set_id', testId)
    .order('sort_order', { ascending: true })

  if (linkError) {
    console.error('Error fetching question links:', linkError)
  }

  // 2. Extract unique question IDs and fetch objects in batches to avoid URL/PostgREST limits
  const uniqueQuestionIds = Array.from(new Set(questionLinks?.map(l => l.question_id) || []))
  let questionsData: any[] = []
  
  if (uniqueQuestionIds.length > 0) {
    const BATCH_SIZE = 20 // Reduced to 20 to handle potential server row limits
    for (let i = 0; i < uniqueQuestionIds.length; i += BATCH_SIZE) {
      const batchIds = uniqueQuestionIds.slice(i, i + BATCH_SIZE)
      const { data: qData, error: qError } = await adminClient
        .from('questions')
        .select('*')
        .in('id', batchIds)
      
      if (qError) {
        console.error(`Error fetching questions batch ${i / BATCH_SIZE + 1}:`, qError)
        continue
      }
      if (qData) {
        questionsData = [...questionsData, ...qData]
      }
    }
  }

  // 3. Create a map for quick lookup
  const questionMap = new Map(questionsData.map(q => [q.id, q]))

  // Essay Tests: always randomly select 2 questions from the bank (ignore pre-assigned links)
  if (test.test_type === 'essay') {
    const { data: bankQuestions, error: bankError } = await adminClient
      .from('questions')
      .select('*')
      .eq('module_id', test.module_id)
      .eq('question_type', 'essay')
      .limit(50)

    if (!bankError && bankQuestions && bankQuestions.length > 0) {
      const shuffled = [...bankQuestions].sort(() => Math.random() - 0.5)
      const selected = shuffled.slice(0, 2)
      
      return {
        ...test,
        time_limit_minutes: 40,
        questions: selected.map(q => ({
          ...q,
          question_text: String(q.question_text || '').trim(),
          options: [],
          max_length: q.max_length || 1000
        }))
      }
    }
  }

  // Map links back to full question objects, ensuring sort order and handling duplicates
  let questions = (questionLinks || [])
    .map((link: any) => {
      const q = questionMap.get(link.question_id)
      
      if (!q) {
        console.warn(`Question ${link.question_id} linked to test ${testId} not found in questions table.`)
        return null
      }
      
      const questionText = String(q.question_text || '').trim()
      
      // Standardize Options Mapping
      let rawOptions = q.options || []
      
      if (typeof rawOptions === 'string') {
        try {
          rawOptions = JSON.parse(rawOptions)
        } catch (e) {
          rawOptions = []
        }
      }

      let parsedOptions: { text: string; index: number }[] = []
      
      if (Array.isArray(rawOptions)) {
        parsedOptions = rawOptions.map((opt: any, index: number) => {
          let text = ''
          let originalIndex = index
          
          if (opt !== null && typeof opt === 'object') {
            const o = opt as any
            text = o.text || o.option || o.value || String(Object.values(o)[0] || '')
            originalIndex = ('index' in o) ? o.index : (('originalIndex' in o) ? o.originalIndex : index)
          } else {
            text = String(opt || '')
          }
          
          return { 
            text: String(text || '').trim(), 
            index: typeof originalIndex === 'number' ? originalIndex : index 
          }
        })
      } else if (rawOptions && typeof rawOptions === 'object') {
        parsedOptions = Object.entries(rawOptions).map(([key, val], index) => {
          const text = (val && typeof val === 'object') 
            ? ((val as any).text || (val as any).option || (val as any).value || String(Object.values(val as any)[0] || ''))
            : String(val || '')
          
          return {
            text: String(text || '').trim(),
            index: parseInt(key) || index
          }
        })
      }
      
      // Filter out truly empty options to avoid UI glitches
      const finalOptions = parsedOptions.filter(opt => opt.text !== '')

      return {
        ...q,
        question_text: questionText || '(No question text provided)',
        options: finalOptions
      }
    })
    .filter((q: any) => q !== null)

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
    module_name: (test.modules as any)?.name || 'General',
    questions
  }
}

export async function submitTest(testId: string, answers: Record<string, number>, timeSpent: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Get test and questions for scoring
  const rawTestData = await getTestData(testId)
  if (!rawTestData || (rawTestData as any).locked) return { error: 'Test is locked or not found' }
  const testData = rawTestData as any

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
      id,
      score,
      total_questions,
      correct_answers,
      time_spent_seconds,
      is_violation,
      completed_at,
      status,
      feedback,
      test_sets(
        id,
        title,
        pass_percentage,
        marks_per_question,
        negative_marks,
        show_score,
        show_answers,
        show_explanation,
        attempts_allowed,
        test_type,
        module_id,
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

  const passPercentage = test?.pass_percentage || 75
  const status = Number(data.score) >= passPercentage ? 'Passed' : 'Failed'

  // 2. Check for violations as a fallback for termination status
  let isViolation = !!data.is_violation
  if (!isViolation) {
    const { count } = await supabase
      .from('exam_violations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('exam_id', test.id)

    // If there are 5 or more violations, we treat it as a violation fail
    if (count !== null && count >= 5) {
      isViolation = true
    }
  }

  // 3. Check if module is purchased (unlimited attempts)
  const serviceClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: modulePurchase } = await serviceClient
    .from('payments').select('id')
    .eq('user_id', user.id).eq('module_id', test.module_id).eq('status', 'completed')
    .maybeSingle()
  const isModulePurchased = !!modulePurchase

  // 4. Check attempt count vs allowed attempts
  const attemptsAllowed = test?.attempts_allowed || 0
  let attemptsUsed = 0
  let hasReachedLimit = false

  if (!isModulePurchased && attemptsAllowed > 0) {
    const { count: completedCount } = await supabase
      .from('test_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('test_set_id', test.id)
      .eq('status', 'completed')

    attemptsUsed = completedCount || 0
    hasReachedLimit = attemptsUsed >= attemptsAllowed
  }

  const resultStatus = (data as any).status || 'completed'
  const isEssayPending = resultStatus === 'under_review'

  return {
    ...data,
    accuracy,
    status,
    resultStatus,
    isEssayPending,
    feedback: (data as any).feedback || null,
    isViolation,
    showScore: isEssayPending ? false : test.show_score,
    showAnswers: isEssayPending ? false : test.show_answers,
    showExplanation: isEssayPending ? false : test.show_explanation,
    moduleName: test?.modules?.name || 'General',
    attemptsAllowed,
    attemptsUsed,
    hasReachedLimit
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
      status,
      total_questions,
      completed_at,
      test_sets(
        title,
        test_type,
        pass_percentage,
        modules(name)
      )
    `)
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false })

  if (error) return []

  return data.map(r => {
    const testSet = (r.test_sets as any)
    const passPercentage = testSet?.pass_percentage || 75
    const isEssay = testSet?.test_type === 'essay'
    const statusLabel = isEssay && (r.status === 'under_review' || !r.score) 
      ? 'Under Review' 
      : (Number(r.score) >= passPercentage ? 'Passed' : 'Failed')

    return {
      id: r.id,
      title: testSet?.title?.replace(/Short/g, 'Free'),
      module: testSet?.modules?.name || 'General',
      score: isEssay && (r.status === 'under_review' || !r.score) ? '—' : `${Math.round(r.score)}%`,
      status: statusLabel,
      date: new Date(r.completed_at).toLocaleDateString()
    }
  })
}

export async function getMyTests() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // 1. Fetch module-level and test-level purchases in parallel via service role
  const adminClient = getAdminClient()
  const { data: allPurchases } = await adminClient
    .from('payments')
    .select('test_set_id, module_id')
    .eq('user_id', user.id)
    .eq('status', 'completed')

  const purchasedTestIds = new Set(allPurchases?.map(p => p.test_set_id).filter(Boolean) || [])
  const purchasedModuleIds = allPurchases?.map(p => p.module_id).filter(Boolean) || []

  // 2. Fetch all relevant data in parallel
  const [
    { data: freeTests },
    { data: individualPurchasedTests },
    { data: modulePurchasedTests },
    { data: results },
    { data: violations }
  ] = await Promise.all([
    // Free tests
    supabase.from('test_sets').select('id, title, test_type, time_limit_minutes, is_paid, modules(name)').eq('is_paid', false).eq('is_hidden', false),
    // Individually purchased tests
    purchasedTestIds.size > 0 
      ? supabase.from('test_sets').select('id, title, test_type, time_limit_minutes, is_paid, modules(name)').in('id', Array.from(purchasedTestIds))
      : Promise.resolve({ data: [] }),
    // Tests from purchased modules
    purchasedModuleIds.length > 0
      ? supabase.from('test_sets').select('id, title, test_type, time_limit_minutes, is_paid, modules(name)').in('module_id', purchasedModuleIds)
      : Promise.resolve({ data: [] }),
    // User results
    supabase.from('test_results').select('test_set_id, score, completed_at, is_violation').eq('user_id', user.id).order('completed_at', { ascending: false }),
    // User violations
    supabase.from('exam_violations').select('exam_id, created_at').eq('user_id', user.id).order('created_at', { ascending: false })
  ])

  // Combine and deduplicate
  const allTestsCombined = [
    ...(freeTests || []),
    ...(individualPurchasedTests || []),
    ...(modulePurchasedTests || [])
  ]
  
  const uniqueTests = Array.from(new Map(allTestsCombined.map(t => [t.id, t])).values())

  return uniqueTests.map(test => {
    const lastResult = results?.find(r => r.test_set_id === test.id)
    
    let lockoutMinutes = 0
    if (lastResult) {
      // Check if it's a violation-based termination
      let isViolation = !!(lastResult as any).is_violation
      
      // Fallback: check violation count if flag isn't set (DB schema drift)
      if (!isViolation && violations) {
        const testViolations = violations.filter(v => v.exam_id === test.id)
        // If there are many violations logged around the time of completion, it was probably a lockout
        if (testViolations.length >= 5) {
          isViolation = true
        }
      }

      if (isViolation) {
        const completionTime = new Date(lastResult.completed_at).getTime()
        const currentTime = new Date().getTime()
        const diffMs = currentTime - completionTime
        const diffMins = Math.floor(diffMs / (1000 * 60))
        
        if (diffMins < 60) {
          lockoutMinutes = 60 - diffMins
        }
      }
    }

    return {
      id: test.id,
      title: test.title?.replace(/Short/g, 'Free'),
      module: (test.modules as any)?.name || 'General',
      duration: `${test.time_limit_minutes} min`,
      status: lockoutMinutes > 0 ? 'Locked' : (lastResult ? 'Completed' : 'Pending'),
      score: lastResult ? `${Math.round(lastResult.score)}%` : '-',
      lockoutMinutes: lockoutMinutes,
      isPaid: !!test.is_paid
    }
  }).sort((a, b) => {
    if (!a.isPaid && b.isPaid) return -1
    if (a.isPaid && !b.isPaid) return 1
    return 0
  })
}

export async function getPurchases() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data: payments, error } = await getAdminClient()
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

  // Fetch profile and results in parallel for faster response
  const [{ data: profile }, { data: results }] = await Promise.all([
    supabase.from('profiles').select('id, full_name, phone, country, avatar_url').eq('id', user.id).single(),
    supabase.from('test_results').select('score').eq('user_id', user.id)
  ])

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
  const phone = formData.get('phone') as string
  const country = formData.get('country') as string

  // 1. Update profiles table
  await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      phone: phone,
      country: country
    })
    .eq('id', user.id)

  // 2. Sync with Auth metadata so DashboardHeader updates
  await supabase.auth.updateUser({
    data: { full_name: fullName }
  })

  revalidatePath('/dashboard/profile')
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
    .select('id, time_limit_minutes, attempts_allowed, cooldown_hours, module_id')
    .eq('id', testId)
    .single()

  if (!test) return { error: 'Test not found' }

  // 2. Check if user has purchased the module (unlimited attempts)
  const serviceClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: modulePurchase } = await serviceClient
    .from('payments').select('id')
    .eq('user_id', user.id).eq('module_id', test.module_id).eq('status', 'completed')
    .maybeSingle()
  const isModulePurchased = !!modulePurchase

  // 3. Fetch user attempts for this test
  const { data: testAttempts } = await supabase
    .from('test_attempts')
    .select('status, updated_at, attempt_number')
    .eq('user_id', user.id)
    .eq('test_set_id', testId)

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

  // 5. Attempt Limit Check (skip if module is purchased — unlimited attempts)
  if (!isModulePurchased && test.attempts_allowed > 0) {
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
    .select('question_id, selected_option_index, selected_options, is_flagged, essay_answer')
    .eq('attempt_id', sessionId)

  return { answers: answers || [] }
}

export async function updateTestProgress(
  sessionId: string, 
  questionId: string, 
  selectedOption: number | number[] | string | null, 
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
      essay_answer: typeof selectedOption === 'string' ? selectedOption : null,
      is_flagged: isFlagged,
      updated_at: new Date().toISOString()
    }, { onConflict: 'attempt_id,question_id' })

  if (error) return { error: error.message }
  return { success: true }
}

export async function finalizeTest(sessionId: string, isViolation: boolean = false) {
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
  
  if (isViolation) {
    let { data: result, error: resultError } = await supabase
      .from('test_results')
      .insert({
        user_id: user.id,
        test_set_id: session.test_set_id,
        score: 0,
        total_questions: 0,
        correct_answers: 0,
        time_spent_seconds: Math.floor((new Date().getTime() - new Date(session.start_time).getTime()) / 1000),
        is_violation: true
      })
      .select()
      .single()

    if (resultError) {
      // Fallback if is_violation column is missing (Postgres error 42703)
      if (resultError.code === '42703' || resultError.message.includes('is_violation')) {
        const { data: fallbackResult, error: fallbackError } = await supabase
          .from('test_results')
          .insert({
            user_id: user.id,
            test_set_id: session.test_set_id,
            score: 0,
            total_questions: 0,
            correct_answers: 0,
            time_spent_seconds: Math.floor((new Date().getTime() - new Date(session.start_time).getTime()) / 1000)
          })
          .select()
          .single()
        
        if (fallbackError) return { error: fallbackError.message }
        result = fallbackResult
      } else {
        return { error: resultError.message }
      }
    }

    await supabase
      .from('test_attempts')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', sessionId)

    return { success: true, resultId: result?.id }
  }

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
  // Exclude essay questions from auto-scoring — they are graded manually
  const totalQuestions = (questionLinks || []).filter(
    (q: any) => (q.questions?.question_type || 'single') !== 'essay'
  ).length

  questionLinks?.forEach((q: any) => {
    const studentAns = answersMap.get(q.question_id)
    const question = q.questions
    const qType = question?.question_type || 'single'

    // Essay questions are graded manually — skip entirely
    if (qType === 'essay') return

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

  // Create final result — use service role so DB triggers can access auth.users
  const resultClient = getAdminClient()
  let { data: result, error: resultError } = await resultClient
    .from('test_results')
    .insert({
      user_id: user.id,
      test_set_id: session.test_set_id,
      score: percentage,
      total_questions: totalQuestions,
      correct_answers: correctAnswers,
      time_spent_seconds: Math.floor((new Date().getTime() - new Date(session.start_time).getTime()) / 1000),
      is_violation: isViolation,
      status: (session.test_sets as any)?.test_type === 'essay' ? 'under_review' : 'completed'
    })
    .select()
    .single()

  if (resultError) {
    // Fallback if is_violation column doesn't exist yet
    if (isViolation || resultError.code === '42703') { // 42703 is undefined_column in Postgres
      const { data: fallbackResult, error: fallbackError } = await resultClient
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
      
      if (fallbackError) return { error: fallbackError.message }
      result = fallbackResult
    } else {
      return { error: resultError.message }
    }
  }

  // Update session status
  await supabase
    .from('test_attempts')
    .update({ status: 'completed', updated_at: new Date().toISOString() })
    .eq('id', sessionId)

  const isEssay = (session.test_sets as any)?.test_type === 'essay'

  // Add notification
  await supabase.from('notifications').insert({
    user_id: user.id,
    type: 'test_completed',
    title: isEssay ? 'Essay Submitted' : 'Test Completed',
    message: isEssay
      ? `Your essay "${testData.title}" has been submitted. Results will be sent to you within 24 hours.`
      : `You completed "${testData.title}" with a score of ${Math.round(percentage)}%.`
  })

  // Send confirmation email for essay submissions
  if (isEssay && user.email) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wings-academy-mock-test-project.vercel.app'
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle()
    const displayName = (profile as any)?.full_name || user.email.split('@')[0]

    // Confirmation email to student
    createMailTransporter().sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: `Essay Submitted — Results Within 24 Hours | Wings Academy`,
      html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="font-family:Arial,sans-serif;background:#f4f6fb;padding:32px 0;margin:0;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table width="600" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(20,44,115,0.08);">
<tr><td style="background:#142c73;padding:32px 40px;text-align:center;">
  <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:900;">Wings Academy</h1>
  <p style="color:#93b4ff;margin:8px 0 0;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">Mock Test Platform</p>
</td></tr>
<tr><td style="padding:40px;">
  <h2 style="color:#142c73;font-size:20px;margin:0 0 16px;">Essay Submitted Successfully</h2>
  <p style="color:#475569;font-size:15px;line-height:1.7;">Dear <strong>${displayName}</strong>,</p>
  <p style="color:#475569;font-size:15px;line-height:1.7;">Your essay for <strong>${testData.title}</strong> has been successfully submitted and is currently under review.</p>
  <div style="background:#f0f4ff;border-left:4px solid #142c73;border-radius:8px;padding:20px 24px;margin:24px 0;">
    <p style="color:#142c73;font-weight:900;font-size:14px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">What happens next?</p>
    <p style="color:#475569;font-size:14px;margin:0;line-height:1.7;">Our instructors will review and grade your essay. You will receive your results and feedback by email <strong>within 24 hours</strong>.</p>
  </div>
  <p style="color:#94a3b8;font-size:13px;margin:32px 0 0;">Questions? Contact us at <a href="mailto:${adminEmail}" style="color:#142c73;">${adminEmail}</a>.</p>
</td></tr>
<tr><td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
  <p style="color:#94a3b8;font-size:12px;margin:0;">© Wings Academy — <a href="${siteUrl}" style="color:#142c73;">${siteUrl}</a></p>
</td></tr>
</table></td></tr></table>
</body></html>`
    }).catch((err: any) => console.error('Essay submission email error:', err))

    // Alert admin to grade
    if (adminEmail) {
      createMailTransporter().sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: adminEmail,
        subject: `[Action Required] Essay Submitted — ${displayName} | ${testData.title}`,
        html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="font-family:Arial,sans-serif;background:#f4f6fb;padding:32px 0;margin:0;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table width="600" style="background:#ffffff;border-radius:16px;overflow:hidden;">
<tr><td style="background:#142c73;padding:24px 40px;">
  <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:900;">Wings Academy — Admin Alert</h1>
</td></tr>
<tr><td style="padding:32px 40px;">
  <h2 style="color:#142c73;font-size:18px;margin:0 0 16px;">New Essay Submitted for Grading</h2>
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="color:#64748b;font-size:14px;padding:8px 0;border-bottom:1px solid #f1f5f9;width:120px;"><strong>Student</strong></td><td style="color:#1e293b;font-size:14px;padding:8px 0;border-bottom:1px solid #f1f5f9;">${displayName} (${user.email})</td></tr>
    <tr><td style="color:#64748b;font-size:14px;padding:8px 0;border-bottom:1px solid #f1f5f9;"><strong>Test</strong></td><td style="color:#1e293b;font-size:14px;padding:8px 0;border-bottom:1px solid #f1f5f9;">${testData.title}</td></tr>
    <tr><td style="color:#64748b;font-size:14px;padding:8px 0;"><strong>Submitted</strong></td><td style="color:#1e293b;font-size:14px;padding:8px 0;">${new Date().toLocaleString()}</td></tr>
  </table>
  <p style="margin:24px 0 0;"><a href="${siteUrl}/admin/results" style="background:#142c73;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:14px;">Grade Essay →</a></p>
</td></tr>
</table></td></tr></table>
</body></html>`
      }).catch((err: any) => console.error('Admin essay alert email error:', err))
    }
  }

  return { success: true, resultId: result.id }
}

export async function getModuleProgress(existingUser?: any) {
  const supabase = await createClient()
  const user = existingUser || (await supabase.auth.getUser()).data.user

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
    supabase.from('test_results').select('id, score, status, completed_at, total_questions, correct_answers, time_spent_seconds, test_set_id, test_sets!inner(title, test_type, pass_percentage, module_id)').eq('user_id', user.id).eq('test_sets.module_id', moduleId).order('completed_at', { ascending: true }),
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
    history: results.map(r => {
      const isEssay = (r.test_sets as any).test_type === 'essay'
      const passPercentage = (r.test_sets as any).pass_percentage
      const isUnderReview = isEssay && (r.status === 'under_review' || !r.score)
      
      return {
        id: r.id,
        testTitle: (r.test_sets as any).title,
        score: isUnderReview ? '—' : Math.round(Number(r.score)),
        date: new Date(r.completed_at).toLocaleDateString(),
        passed: isUnderReview ? false : Number(r.score) >= passPercentage,
        status: isUnderReview ? 'Under Review' : (Number(r.score) >= passPercentage ? 'Passed' : 'Failed')
      }
    }),
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

// Called from the checkout page after the student pays via Ziina.
// Creates a PENDING payment record so the admin can verify and manually unlock.
// Uses service role client to bypass RLS (student inserting notifications for admin users).
export async function notifyAdminOfPayment(testId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Service role client bypasses RLS — needed for cross-user inserts (notifications to admins)
  const serviceClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get test + student profile details
  const [{ data: test }, { data: profile }] = await Promise.all([
    serviceClient.from('test_sets').select('title, price').eq('id', testId).single(),
    serviceClient.from('profiles').select('full_name, email').eq('id', user.id).single()
  ])

  if (!test) return { error: 'Test not found' }

  // Check if a pending payment already exists to prevent duplicate notifications
  const { data: existing } = await serviceClient
    .from('payments')
    .select('id')
    .eq('user_id', user.id)
    .eq('test_set_id', testId)
    .eq('status', 'pending')
    .maybeSingle()

  const txnId = `ZIINA-PENDING-${Math.random().toString(36).substring(2, 10).toUpperCase()}`

  if (!existing) {
    // Insert a pending payment record
    const { error: payErr } = await serviceClient
      .from('payments')
      .insert({
        user_id: user.id,
        test_set_id: testId,
        amount: test.price || 49,
        status: 'pending',
        transaction_id: txnId
      })

    if (payErr) return { error: payErr.message }
  }

  const studentName = profile?.full_name || profile?.email || 'A student'
  const studentEmail = profile?.email || user.email || ''

  // Fetch admin user IDs to notify (in-app)
  const { data: admins } = await serviceClient
    .from('profiles')
    .select('id')
    .eq('role', 'admin')

  if (admins && admins.length > 0) {
    const { error: notifErr } = await serviceClient.from('notifications').insert(
      admins.map((admin: any) => ({
        user_id: admin.id,
        type: 'payment_pending',
        title: 'Ziina Payment — Verification Required',
        message: `${studentName} has completed payment for "${test.title}" via Ziina. Please verify and grant access from their profile page.`
      }))
    )
    if (notifErr) return { error: notifErr.message }
  }

  // Send admin email via Edge Function (fire-and-forget — don't block the student)
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    await fetch(`${supabaseUrl}/functions/v1/notify-admin-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify({
        studentName,
        studentEmail,
        moduleName: test.title,
        amount: test.price || 49,
        transactionId: txnId,
      }),
    })
  } catch (emailErr) {
    // Don't fail the whole action if the email doesn't send
    console.error('Failed to send admin payment email:', emailErr)
  }

  return { success: true }
}

// Called from the MODULE checkout page after the student pays via Ziina.
// Creates a PENDING payment record at the module level so the admin can verify and unlock the entire module.
// Uses service role client to bypass RLS (student inserting notifications for admin users).
export async function notifyAdminOfModulePayment(moduleId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Service role client bypasses RLS — needed for cross-user inserts (notifications to admins)
  const serviceClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get module + student profile details
  const [{ data: moduleInfo }, { data: profile }] = await Promise.all([
    serviceClient.from('modules').select('name, price').eq('id', moduleId).single(),
    serviceClient.from('profiles').select('full_name, email').eq('id', user.id).single()
  ])

  if (!moduleInfo) return { error: 'Module not found' }

  // Check if a pending payment already exists to prevent duplicate notifications
  const { data: existing } = await serviceClient
    .from('payments')
    .select('id')
    .eq('user_id', user.id)
    .eq('module_id', moduleId)
    .eq('status', 'pending')
    .maybeSingle()

  const txnId = `ZIINA-MOD-PENDING-${Math.random().toString(36).substring(2, 10).toUpperCase()}`

  if (!existing) {
    // Insert a pending payment record at module level
    const { error: payErr } = await serviceClient
      .from('payments')
      .insert({
        user_id: user.id,
        module_id: moduleId,
        amount: moduleInfo.price || 49,
        status: 'pending',
        transaction_id: txnId
      })

    if (payErr) return { error: payErr.message }
  }

  const studentName = profile?.full_name || profile?.email || 'A student'
  const studentEmail = profile?.email || user.email || ''

  // Fetch admin user IDs to notify (in-app)
  const { data: admins } = await serviceClient
    .from('profiles')
    .select('id')
    .eq('role', 'admin')

  if (admins && admins.length > 0) {
    const { error: notifErr } = await serviceClient.from('notifications').insert(
      admins.map((admin: any) => ({
        user_id: admin.id,
        type: 'payment_pending',
        title: 'Ziina Payment — Verification Required',
        message: `${studentName} has completed payment for module "${moduleInfo.name}" via Ziina. Please verify and grant access from their profile page.`
      }))
    )
    if (notifErr) return { error: notifErr.message }
  }

  // Send admin email via Edge Function (fire-and-forget — don't block the student)
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    await fetch(`${supabaseUrl}/functions/v1/notify-admin-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify({
        studentName,
        studentEmail,
        moduleName: moduleInfo.name,
        amount: moduleInfo.price || 49,
        transactionId: txnId,
      }),
    })
  } catch (emailErr) {
    // Don't fail the whole action if the email doesn't send
    console.error('Failed to send admin payment email:', emailErr)
  }

  return { success: true }
}

export async function getUserPurchases() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await getAdminClient()
    .from('payments')
    .select(`
      id,
      amount,
      status,
      transaction_id,
      created_at,
      module_id,
      test_sets (title),
      modules (name)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user purchases:', error)
    return []
  }

  return data
}

// ─── Ziina Automated Payment ─────────────────────────────────────────────────

export async function createZiinaCheckout(moduleId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const serviceClient = getAdminClient()

  // Fetch module info
  const { data: moduleInfo } = await serviceClient
    .from('modules')
    .select('name, price')
    .eq('id', moduleId)
    .single()

  if (!moduleInfo) return { error: 'Module not found' }

  // Check if already purchased (completed)
  const { data: completed } = await serviceClient
    .from('payments')
    .select('id')
    .eq('user_id', user.id)
    .eq('module_id', moduleId)
    .eq('status', 'completed')
    .maybeSingle()

  if (completed) return { error: 'already_purchased' }

  // Check for existing pending payment — reuse its Ziina intent instead of creating duplicates
  const { data: pendingPayment } = await serviceClient
    .from('payments')
    .select('id, transaction_id')
    .eq('user_id', user.id)
    .eq('module_id', moduleId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const price = moduleInfo.price || 49

  try {
    const { createPaymentIntent, getPaymentIntent } = await import('@/utils/ziina')

    // If a pending payment exists, try to reuse its Ziina intent
    if (pendingPayment?.transaction_id) {
      try {
        const existingIntent = await getPaymentIntent(pendingPayment.transaction_id)
        if (existingIntent.redirect_url && existingIntent.status !== 'failed' && existingIntent.status !== 'canceled') {
          return { redirect_url: existingIntent.redirect_url }
        }
      } catch {
        // Intent expired or invalid — create a new one below
      }
      // Delete the stale pending payment
      await serviceClient.from('payments').delete().eq('id', pendingPayment.id)
    }

    const intent = await createPaymentIntent({
      amount: price,
      moduleId,
      userId: user.id,
      moduleName: moduleInfo.name,
    })

    // Insert pending payment with Ziina payment intent ID as transaction_id
    const { error: payErr } = await serviceClient.from('payments').insert({
      user_id: user.id,
      module_id: moduleId,
      amount: price,
      status: 'pending',
      transaction_id: intent.id,
    })

    if (payErr) return { error: payErr.message }

    return { redirect_url: intent.redirectUrl }
  } catch (err: any) {
    console.error('Ziina payment intent creation failed:', err)
    return { error: err.message || 'Failed to create payment session' }
  }
}

export async function checkPaymentStatus(transactionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { status: 'error' }

  const serviceClient = getAdminClient()

  const { data } = await serviceClient
    .from('payments')
    .select('status, module_id')
    .eq('transaction_id', transactionId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!data) return { status: 'not_found' }

  return { status: data.status, moduleId: data.module_id }
}
