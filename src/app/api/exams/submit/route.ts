import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { userId, examId, answers, submittedAt } = await request.json()

    // Validate required fields
    if (!userId || !examId || !answers) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Initialize Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get exam details
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select('*')
      .eq('id', examId)
      .single()

    if (examError || !exam) {
      return NextResponse.json(
        { error: 'Exam not found' },
        { status: 404 }
      )
    }

    // Calculate score
    let correctAnswers = 0
    let totalQuestions = 0

    for (const [questionIndex, answer] of Object.entries(answers)) {
      const question = exam.questions[parseInt(questionIndex)]
      if (question) {
        totalQuestions++
        if (answer === question.correctAnswer) {
          correctAnswers++
        }
      }
    }

    const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0

    // Get violations for this exam session
    const { data: violations, error: violationsError } = await supabase
      .from('exam_violations')
      .select('*')
      .eq('user_id', userId)
      .eq('exam_id', examId)

    const violationCount = violations?.length || 0

    // Determine if exam should be flagged for review
    const shouldFlag = violationCount >= 3

    // Save exam submission
    const { data: submission, error: submissionError } = await supabase
      .from('exam_submissions')
      .insert({
        user_id: userId,
        exam_id: examId,
        answers,
        score,
        correct_answers: correctAnswers,
        total_questions: totalQuestions,
        submitted_at: submittedAt || new Date().toISOString(),
        violation_count: violationCount,
        flagged_for_review: shouldFlag,
        status: shouldFlag ? 'under_review' : 'completed'
      })
      .select()
      .single()

    if (submissionError) {
      console.error('Submission error:', submissionError)
      return NextResponse.json(
        { error: 'Failed to submit exam' },
        { status: 500 }
      )
    }

    // Update user exam progress
    await supabase
      .from('user_exam_progress')
      .upsert({
        user_id: userId,
        exam_id: examId,
        status: 'completed',
        score,
        completed_at: submittedAt || new Date().toISOString(),
        violation_count: violationCount
      })

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        score,
        correctAnswers,
        totalQuestions,
        violationCount,
        flaggedForReview: shouldFlag,
        status: submission.status
      }
    })

  } catch (error) {
    console.error('Exam submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve exam results
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const examId = searchParams.get('examId')

    if (!userId || !examId) {
      return NextResponse.json(
        { error: 'Missing userId or examId' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get latest submission
    const { data: submission, error } = await supabase
      .from('exam_submissions')
      .select(`
        *,
        exam:exams(title, description),
        violations:exam_violations(count)
      `)
      .eq('user_id', userId)
      .eq('exam_id', examId)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      submission
    })

  } catch (error) {
    console.error('Get results error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
