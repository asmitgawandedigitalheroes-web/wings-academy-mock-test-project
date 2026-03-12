'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getDashboardStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: results, error } = await supabase
    .from('test_results')
    .select('score, completed_at')
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  const testsTaken = results?.length || 0
  const avgScore = testsTaken > 0 
    ? Math.round(results.reduce((acc, r) => acc + Number(r.score), 0) / testsTaken)
    : 0

  // Mock streak and last session for now, or calculate if possible
  const streak = results.length > 0 ? '5 Days' : '0 Days'
  const lastSession = results.length > 0 
    ? 'Recent'
    : 'Never'

  return {
    testsTaken,
    avgScore: `${avgScore}%`,
    streak,
    lastSession
  }
}

export async function getSubjectProgress() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // Get all subjects and categories
  const { data: subjects, error: subError } = await supabase
    .from('subjects')
    .select('id, name, categories(name)')

  if (subError) return []

  // Get results for this user
  const { data: results } = await supabase
    .from('test_results')
    .select('score, test_sets(subject_id)')
    .eq('user_id', user.id)

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
