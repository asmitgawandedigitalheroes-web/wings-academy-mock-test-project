'use server'

import { createClient } from '@/utils/supabase/server'

export async function getAdminDashboardStats() {
  const supabase = await createClient()

  // Execute all count and sum queries in parallel
  const [
    { count: studentCount, error: studentError },
    { count: moduleCount, error: moduleError },
    { count: questionCount, error: questionError },
    { count: testCount, error: testError },
    { data: payments, error: paymentError },
    { data: results, error: resultsError }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('modules').select('*', { count: 'exact', head: true }),
    supabase.from('questions').select('*', { count: 'exact', head: true }),
    supabase.from('test_sets').select('*', { count: 'exact', head: true }).eq('is_hidden', false),
    supabase.from('payments').select('amount').eq('status', 'completed'),
    supabase.from('test_results').select('score')
  ])

  const totalRevenue = payments?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0

  const avgPassRate = results && results.length > 0
    ? Math.round(results.filter(r => Number(r.score) >= 70).length / results.length * 100)
    : 0

  if (studentError || moduleError || questionError || testError || resultsError || paymentError) {
    console.error('Error fetching admin stats:', { studentError, moduleError, questionError, testError, resultsError, paymentError })
  }

  return {
    studentCount: studentCount || 0,
    moduleCount: moduleCount || 0,
    questionCount: questionCount || 0,
    testCount: testCount || 0,
    totalRevenue: totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
    avgPassRate: `${avgPassRate}%`
  }
}
export async function getRecentAdminActivity() {
  const supabase = await createClient()

  // Fetch all categories of activity in parallel
  const [
    { data: newProfiles },
    { data: recentTests },
    { data: newTests },
    { data: newModules },
    { data: newQuestions },
    { data: newCategories }
  ] = await Promise.all([
    supabase.from('profiles').select('full_name, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('test_results').select('score, completed_at, test_sets(title), profiles(full_name)').order('completed_at', { ascending: false }).limit(5),
    supabase.from('test_sets').select('title, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('modules').select('name, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('questions').select('question_text, created_at, modules(name)').order('created_at', { ascending: false }).limit(5),
    supabase.from('categories').select('name, created_at').order('created_at', { ascending: false }).limit(5)
  ])

  const activities: any[] = []

  newProfiles?.forEach(p => {
    activities.push({
      id: `signup-${p.created_at}`,
      type: 'signup',
      user: p.full_name || 'Anonymous',
      detail: 'New student registered',
      title: 'New Student Signup',
      message: `${p.full_name || 'Anonymous'} joined the platform`,
      time: new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date(p.created_at).getTime()
    })
  })

  recentTests?.forEach(t => {
    activities.push({
      id: `test-completion-${t.completed_at}`,
      type: 'test',
      user: (t.profiles as any)?.full_name || 'Student',
      detail: `Completed ${(t.test_sets as any)?.title || 'Mock Test'}`,
      title: 'Test Completed',
      message: `${(t.profiles as any)?.full_name || 'Student'} completed ${(t.test_sets as any)?.title || 'test'}`,
      time: new Date(t.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date(t.completed_at).getTime()
    })
  })

  newTests?.forEach(t => {
    activities.push({
      id: `test-creation-${t.created_at}`,
      type: 'admin_action',
      user: 'Admin',
      detail: `Created new test: ${t.title}`,
      title: 'New Test Created',
      message: `Admin created a new test: ${t.title}`,
      time: new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date(t.created_at).getTime()
    })
  })

  newModules?.forEach(s => {
    activities.push({
      id: `module-${s.created_at}`,
      type: 'admin_action',
      user: 'Admin',
      detail: `Added new module: ${s.name}`,
      title: 'Module Added',
      message: `New module '${s.name}' was added to the platform`,
      time: new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date(s.created_at).getTime()
    })
  })

  newQuestions?.forEach((q: any) => {
    activities.push({
      id: `question-${q.created_at}`,
      type: 'admin_action',
      user: 'Admin',
      detail: `Added new question to ${(q.modules as any)?.name || 'Module'}`,
      title: 'Question Added',
      message: `New question added to ${(q.modules as any)?.name || 'Module'}`,
      time: new Date(q.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date(q.created_at).getTime()
    })
  })

  newCategories?.forEach((c: any) => {
    activities.push({
      id: `category-${c.created_at}`,
      type: 'admin_action',
      user: 'Admin',
      detail: `Created category: ${c.name}`,
      title: 'Category Created',
      message: `New category '${c.name}' was added`,
      time: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date(c.created_at).getTime()
    })
  })

  // Sort by timestamp
  return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5)
}

export async function getAllAdminActivity() {
  const supabase = await createClient()

  // Fetch data
  const [
    { data: newProfiles },
    { data: recentTests },
    { data: newTests },
    { data: newModules },
    { data: payments },
    { data: violations },
    { data: enquiries },
    { data: newQuestions },
    { data: newCategories }
  ] = await Promise.all([
    supabase.from('profiles').select('id, full_name, created_at').order('created_at', { ascending: false }).limit(50),
    supabase.from('test_results').select('id, score, completed_at, test_sets(title), profiles(full_name)').order('completed_at', { ascending: false }).limit(50),
    supabase.from('test_sets').select('id, title, created_at').order('created_at', { ascending: false }).limit(50),
    supabase.from('modules').select('id, name, created_at').order('created_at', { ascending: false }).limit(50),
    supabase.from('payments').select('id, amount, created_at, profiles(full_name), test_sets(title)').order('created_at', { ascending: false }).limit(50),
    supabase.from('test_violations').select('id, violation_type, created_at, profiles(full_name), test_sets(title)').order('created_at', { ascending: false }).limit(50),
    supabase.from('enquiries').select('id, first_name, last_name, created_at').order('created_at', { ascending: false }).limit(50),
    supabase.from('questions').select('id, question_text, created_at, modules(name)').order('created_at', { ascending: false }).limit(50),
    supabase.from('categories').select('id, name, created_at').order('created_at', { ascending: false }).limit(50)
  ])

  const activities: any[] = []

  newProfiles?.forEach(p => {
    activities.push({
      id: `signup-${p.id}-${p.created_at}`,
      type: 'signup',
      user: p.full_name || 'Anonymous',
      detail: 'New student registered',
      time: new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date(p.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      timestamp: new Date(p.created_at).getTime()
    })
  })

  recentTests?.forEach(t => {
    activities.push({
      id: `test-completion-${t.id}-${t.completed_at}`,
      type: 'test',
      user: (t.profiles as any)?.full_name || 'Student',
      detail: `Completed ${(t.test_sets as any)?.title || 'Mock Test'}`,
      time: new Date(t.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date(t.completed_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      timestamp: new Date(t.completed_at).getTime(),
      score: t.score
    })
  })

  newTests?.forEach(t => {
    activities.push({
      id: `test-creation-${t.id}-${t.created_at}`,
      type: 'admin_action',
      user: 'Admin',
      detail: `Created new test: ${t.title}`,
      time: new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date(t.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      timestamp: new Date(t.created_at).getTime()
    })
  })

  newModules?.forEach(s => {
    activities.push({
      id: `module-${s.id}-${s.created_at}`,
      type: 'admin_action',
      user: 'Admin',
      detail: `Added new module: ${s.name}`,
      time: new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date(s.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      timestamp: new Date(s.created_at).getTime()
    })
  })

  payments?.forEach(p => {
    activities.push({
      id: `payment-${p.id}-${p.created_at}`,
      type: 'payment',
      user: (p.profiles as any)?.full_name || 'Student',
      detail: `Paid $${p.amount} for ${(p.test_sets as any)?.title || 'Module'}`,
      time: new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date(p.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      timestamp: new Date(p.created_at).getTime()
    })
  })

  violations?.forEach(v => {
    activities.push({
      id: `violation-${v.id}-${v.created_at}`,
      type: 'violation',
      user: (v.profiles as any)?.full_name || 'Student',
      detail: `Test Violation: ${v.violation_type.replace(/_/g, ' ')} in ${(v.test_sets as any)?.title || 'Test'}`,
      time: new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date(v.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      timestamp: new Date(v.created_at).getTime()
    })
  })

  enquiries?.forEach(e => {
    activities.push({
      id: `enquiry-${e.id}-${e.created_at}`,
      type: 'enquiry',
      user: `${e.first_name} ${e.last_name}`,
      detail: 'Submitted a new enquiry',
      time: new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date(e.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      timestamp: new Date(e.created_at).getTime()
    })
  })

  newQuestions?.forEach((q: any) => {
    activities.push({
      id: `question-${q.id}-${q.created_at}`,
      type: 'module_work',
      user: 'Admin',
      detail: `Added question: ${q.question_text.substring(0, 50)}${q.question_text.length > 50 ? '...' : ''} to ${(q.modules as any)?.name}`,
      time: new Date(q.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date(q.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      timestamp: new Date(q.created_at).getTime()
    })
  })

  newCategories?.forEach((c: any) => {
    activities.push({
      id: `category-${c.id}-${c.created_at}`,
      type: 'admin_action',
      user: 'Admin',
      detail: `Created category: ${c.name}`,
      time: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date(c.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      timestamp: new Date(c.created_at).getTime()
    })
  })

  // Sort by timestamp and return all
  return activities.sort((a, b) => b.timestamp - a.timestamp)
}

export async function getAdminAnalytics(days: number = 14) {
  const supabase = await createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const [
    { data: signups },
    { data: testCompletions },
    { data: payments },
    { data: subDistribution }
  ] = await Promise.all([
    supabase.from('profiles').select('created_at').gte('created_at', startDate.toISOString()),
    supabase.from('test_results').select('completed_at').gte('completed_at', startDate.toISOString()),
    supabase.from('payments').select('amount, created_at').eq('status', 'completed').gte('created_at', startDate.toISOString()),
    supabase.from('test_results').select('test_sets(modules(name))')
  ])

  // 1. Engagement Map (Last X days)
  const engagementMap: Record<string, { date: string, signups: number, completions: number, revenue: number }> = {}
  for (let i = 0; i < days; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' })
    engagementMap[dateStr] = { date: dateStr, signups: 0, completions: 0, revenue: 0 }
  }

  signups?.forEach(s => {
    const sDate = new Date(s.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })
    if (engagementMap[sDate]) engagementMap[sDate].signups++
  })

  testCompletions?.forEach(t => {
    const tDate = new Date(t.completed_at).toLocaleDateString([], { month: 'short', day: 'numeric' })
    if (engagementMap[tDate]) engagementMap[tDate].completions++
  })

  payments?.forEach(p => {
    const pDate = new Date(p.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })
    if (engagementMap[pDate]) engagementMap[pDate].revenue += Number(p.amount)
  })

  // 2. Module Distribution
  const modMap: Record<string, number> = {}
  subDistribution?.forEach((item: any) => {
    const name = item.test_sets?.modules?.name || 'Unknown'
    modMap[name] = (modMap[name] || 0) + 1
  })
  
  const totalCompletions = subDistribution?.length || 1
  const distribution = Object.entries(modMap).map(([name, count]) => ({
    name,
    value: Math.round((count / totalCompletions) * 100)
  })).sort((a, b) => b.value - a.value).slice(0, 4)

  // 3. Peak Hours
  const hoursMap: Record<number, number> = {}
  testCompletions?.forEach(t => {
    const hour = new Date(t.completed_at).getHours()
    hoursMap[hour] = (hoursMap[hour] || 0) + 1
  })
  const hoursData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    users: hoursMap[i] || 0
  }))

  return {
    engagement: Object.values(engagementMap).reverse(),
    distribution: distribution.length > 0 ? distribution : [
      { name: 'Legislation', value: 40 },
      { name: 'Engines', value: 30 },
      { name: 'Physics', value: 20 },
      { name: 'Human Factors', value: 10 },
    ],
    hours: hoursData
  }
}

export async function getReportData() {
  const supabase = await createClient()

  const [ { data: students }, { data: results } ] = await Promise.all([
    supabase.from('profiles').select('id, full_name, email, created_at, role, status').order('created_at', { ascending: false }),
    supabase.from('test_results').select('id, user_id, test_set_id, score, completed_at, time_spent_seconds, total_questions, correct_answers, profiles(full_name, email), test_sets(title)').order('completed_at', { ascending: false })
  ])

  return { students, results }
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
    if (error.code === '42P01') { // Table doesn't exist
      console.warn('Notifications table not found. Returning empty list.')
      return []
    }
    console.error('Error fetching notifications:', error)
    return []
  }

  return data
}

export async function markNotificationAsRead(id: string) {
  const supabase = await createClient()
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
}
