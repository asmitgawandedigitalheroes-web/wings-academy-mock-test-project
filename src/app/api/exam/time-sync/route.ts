import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get session details from database
    const { data: session, error } = await supabase
      .from('test_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (error || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Calculate remaining time
    const startTime = new Date(session.started_at)
    const timeLimit = session.time_limit_minutes * 60 * 1000 // Convert to milliseconds
    const elapsed = Date.now() - startTime.getTime()
    const remaining = Math.max(0, timeLimit - elapsed)
    const remainingSeconds = Math.floor(remaining / 1000)

    // Check if time expired
    const expired = remainingSeconds <= 0

    if (expired) {
      // Auto-submit the exam
      await supabase
        .from('test_sessions')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId)
    }

    return NextResponse.json({
      timeRemaining: remainingSeconds,
      expired,
      serverTime: Date.now()
    })

  } catch (error) {
    console.error('Time sync error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
