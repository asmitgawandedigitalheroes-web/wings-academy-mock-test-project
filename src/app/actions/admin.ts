'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { getURL } from '@/utils/url'
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

export async function addModule(formData: {
  name: string,
  categoryId?: string,
  code?: string,
  description?: string,
  free_test_limit?: number,
  paid_test_limit?: number,
  status?: string
}) {
  if (!formData.name || !formData.name.trim()) {
    return { error: 'Module name is required.' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('modules')
    .insert([{
      name: formData.name,
      category_id: formData.categoryId || null,
      code: formData.code,
      description: formData.description,
      free_test_limit: formData.free_test_limit ?? 2,
      paid_test_limit: formData.paid_test_limit ?? 3,
      status: formData.status === 'Inactive' ? 'disabled' : 'enabled'
    }])

  if (error) {
    console.error('Error adding module:', error)
    return { error: error.message }
  }

  // Add notification
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'admin_action',
      title: 'Module Created',
      message: `New module "${formData.name}" has been successfully added.`
    })
  }

  revalidatePath('/admin/modules')
  return { success: true }
}

export async function toggleModuleStatus(moduleId: string, currentStatus: 'enabled' | 'disabled') {
  const supabase = await createClient()
  const newStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled'
  
  const { error } = await supabase
    .from('modules')
    .update({ status: newStatus })
    .eq('id', moduleId)

  if (error) {
    console.error('Error toggling module status:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/modules')
  revalidatePath(`/admin/modules/${moduleId}`)
  return { success: true }
}

export async function addQuestion(formData: {
  moduleId: string,
  question_text: string,
  options: string[],
  correct_options?: number[],
  correct_option_index?: number,
  question_type?: 'single' | 'multiple' | 'essay',
  explanation?: string,
  min_length?: number | null,
  max_length?: number | null
}) {
  const supabase = await createClient()

  const qType = formData.question_type || 'single'
  const correctOptions = formData.correct_options || (formData.correct_option_index !== undefined ? [formData.correct_option_index] : [])

  const { error } = await supabase
    .from('questions')
    .insert([{
      module_id: formData.moduleId,
      question_text: formData.question_text,
      options: formData.options,
      question_type: qType,
      correct_options: correctOptions,
      correct_option_index: qType === 'single' ? correctOptions[0] : null,
      explanation: formData.explanation,
      min_length: formData.min_length || null,
      max_length: formData.max_length || null
    }])

  if (error) {
    console.error('Error adding question:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/modules')
  return { success: true }
}

export async function getStats() {
  const supabase = await createClient()

  const [modulesCount, questionsCount] = await Promise.all([
    supabase.from('modules').select('*', { count: 'exact', head: true }),
    supabase.from('questions').select('*', { count: 'exact', head: true })
  ])

  return {
    modules: modulesCount.count || 0,
    questions: questionsCount.count || 0
  }
}

export async function getCategories() {
    const supabase = await createClient()
    const { data } = await supabase.from('categories').select('*').order('name')
    return data || []
}

export async function getModulesWithCategories() {
    const supabase = await createClient()
    const { data } = await supabase
        .from('modules')
        .select(`
            id, 
            name, 
            status, 
            categories:category_id(id, name),
            test_sets(
                id,
                pass_percentage,
                test_results(id, score)
            ),
            questions:questions(count)
        `)
        .order('name')

    // Aggregate stats from test_sets
    const modulesWithStats = (data || []).map(module => {
        let totalTaken = 0;
        let totalPassed = 0;

        module.test_sets?.forEach((test: any) => {
            const results = test.test_results || [];
            const passMark = test.pass_percentage || 75;
            totalTaken += results.length;
            totalPassed += results.filter((r: any) => r.score >= passMark).length;
        });

        return {
            ...module,
            taken: totalTaken,
            passed: totalPassed,
            test_count: module.test_sets?.length || 0,
            question_count: module.questions && module.questions[0] ? (module.questions[0] as any).count : 0
        };
    });

    return modulesWithStats as any[]
}
export async function getTestsByModule(moduleId: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('test_sets')
        .select(`
            id,
            title,
            module_id,
            time_limit_minutes,
            pass_percentage,
            test_type,
            is_paid,
            price,
            status,
            created_at,
            question_count:test_questions(count),
            test_results(id, score)
        `)
        .eq('module_id', moduleId)
        .order('created_at', { ascending: false })
    
    // Transform the data to pull counts and stats
    const testsWithStats = (data || []).map(test => {
        const results = test.test_results || [];
        const passMark = test.pass_percentage || 75;
        const taken = results.length;
        const passed = results.filter((r: any) => r.score >= passMark).length;

        return {
            ...test,
            title: test.title?.replace(/Short/g, 'Free'),
            question_count: test.question_count && test.question_count[0] ? (test.question_count[0] as any).count : 0,
            taken,
            passed
        };
    });

    return testsWithStats
}

export async function addTest(formData: { 
  title: string, 
  moduleId: string, 
  duration: number, 
  description?: string,
  passPercentage?: number,
  targetQuestions?: number,
  attemptsAllowed?: number,
  testType?: 'short' | 'full' | 'essay',
  isPaid?: boolean,
  price?: number,
  marksPerQuestion?: number,
  negativeMarks?: number
}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('test_sets')
    .insert([{
      title: formData.title,
      description: formData.description,
      module_id: formData.moduleId,
      time_limit_minutes: formData.duration,
      pass_percentage: formData.passPercentage || 75,
      target_questions: formData.targetQuestions || 0,
      attempts_allowed: formData.attemptsAllowed || 1,
      test_type: formData.testType || 'full',
      is_paid: formData.isPaid || false,
      price: formData.price || 0,
      marks_per_question: formData.marksPerQuestion || 1,
      negative_marks: formData.negativeMarks || 0
    }])

  if (error) {
    console.error('Error adding test:', error)
    return { error: error.message }
  }

  // Add notification
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'admin_action',
      title: 'Test Created',
      message: `New test "${formData.title}" has been successfully created.`
    })
  }

  revalidatePath(`/admin/modules/${formData.moduleId}`)
  return { success: true }
}

export async function duplicateTestSet(testId: string, moduleId: string) {
  const supabase = await createClient()

  // Get original test details
  const { data: original, error: fetchError } = await supabase
    .from('test_sets')
    .select('*')
    .eq('id', testId)
    .single()

  if (fetchError || !original) {
    console.error('Error fetching original test:', fetchError)
    return { error: 'Failed to fetch original test' }
  }

  // Prepare new test data
  const { id: _, created_at: __, ...settings } = original
  const newTitle = `Copy - ${original.title}`

  const { data: newTest, error: insertError } = await supabase
    .from('test_sets')
    .insert([{
      ...settings,
      title: newTitle,
      status: 'draft' // Always start as draft
    }])
    .select()
    .single()

  if (insertError) {
    console.error('Error duplicating test:', insertError)
    return { error: insertError.message }
  }

  // Add notification
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'admin_action',
      title: 'Test Duplicated',
      message: `Test "${original.title}" has been duplicated as "${newTitle}".`
    })
  }

  revalidatePath(`/admin/modules/${moduleId}`)
  return { success: true, newTestId: newTest.id }
}

export async function updateTestSettings(testId: string, moduleId: string, data: {
    title: string,
    description?: string,
    time_limit_minutes: number,
    pass_percentage: number,
    target_questions: number,
    attempts_allowed: number,
    cooldown_hours: number,
    is_paid: boolean,
    price: number,
    status: 'published' | 'draft',
    show_score: boolean,
    show_answers: boolean,
    show_explanation: boolean,
    start_date?: string | null,
    end_date?: string | null,
    randomize_questions: boolean,
    randomize_answers: boolean,
    marks_per_question: number,
    negative_marks: number
}) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('test_sets')
        .update({
            title: data.title,
            description: data.description,
            time_limit_minutes: data.time_limit_minutes,
            pass_percentage: data.pass_percentage,
            target_questions: data.target_questions,
            attempts_allowed: data.attempts_allowed,
            cooldown_hours: data.cooldown_hours,
            is_paid: data.is_paid,
            price: data.price,
            status: data.status,
            show_score: data.show_score,
            show_answers: data.show_answers,
            show_explanation: data.show_explanation,
            start_date: data.start_date,
            end_date: data.end_date,
            randomize_questions: data.randomize_questions,
            randomize_answers: data.randomize_answers,
            marks_per_question: data.marks_per_question,
            negative_marks: data.negative_marks,
            is_hidden: data.status === 'draft'
        })
        .eq('id', testId)

    if (error) {
        console.error('Error updating test settings:', error)
        return { error: error.message }
    }

    revalidatePath(`/admin/modules/${moduleId}`)
    revalidatePath(`/admin/tests/${testId}`)
    revalidatePath(`/admin/tests/${testId}/settings`)
    return { success: true }
}

export async function toggleTestStatus(testId: string, moduleId: string, currentStatus: 'published' | 'draft') {
  const supabase = await createClient()
  const newStatus = currentStatus === 'published' ? 'draft' : 'published'
  
  const { error } = await supabase
    .from('test_sets')
    .update({ 
      status: newStatus,
      is_hidden: newStatus === 'draft' // Sync hidden property for backward compatibility if needed
    })
    .eq('id', testId)

  if (error) {
    console.error('Error toggling test status:', error)
    return { error: error.message }
  }

  revalidatePath(`/admin/modules/${moduleId}`)
  revalidatePath('/admin/tests')
  revalidatePath(`/admin/tests/${testId}`)
  return { success: true }
}

export async function toggleTestPaid(testId: string, moduleId: string, currentPaid: boolean, price: number = 0) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('test_sets')
    .update({ is_paid: !currentPaid, price: !currentPaid ? price : 0 })
    .eq('id', testId)

  if (error) {
    console.error('Error toggling paid status:', error)
    return { error: error.message }
  }

  revalidatePath(`/admin/modules/${moduleId}`)
  return { success: true }
}

export async function deleteTestSet(testId: string, moduleId: string) {
  const supabase = await createClient()
  
  // 1. Delete links in test_questions
  await supabase.from('test_questions').delete().eq('test_set_id', testId)
  
  // 2. Delete the test set
  const { error } = await supabase
    .from('test_sets')
    .delete()
    .eq('id', testId)

  if (error) {
    console.error('Error deleting test set:', error)
    return { error: error.message }
  }

  revalidatePath(`/admin/modules/${moduleId}`)
  return { success: true }
}

export async function getModuleDetails(moduleId: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('modules')
        .select('*, categories(name)')
        .eq('id', moduleId)
        .single()
    return data
}
export async function addQuestionToTest(formData: {
  testSetId: string,
  moduleId: string,
  question_text: string,
  question_type: 'single' | 'multiple' | 'essay',
  options: string[],
  correct_options: number[],
  difficulty_level?: 'easy' | 'medium' | 'hard',
  explanation?: string,
  marks?: number,
  image_url?: string | null,
  min_length?: number | null,
  max_length?: number | null
}) {
  const supabase = await createClient()

  // 1. Create the question
  const { data: questionData, error: questionError } = await supabase
    .from('questions')
    .insert([{
      module_id: formData.moduleId,
      question_text: formData.question_text,
      question_type: formData.question_type,
      options: (formData.options || []).map(opt => String(opt || '').trim()).filter(opt => opt !== ''),
      correct_options: formData.correct_options,
      difficulty_level: formData.difficulty_level || 'medium',
      correct_option_index: formData.question_type === 'single' ? formData.correct_options[0] : null,
      explanation: formData.explanation,
      marks: formData.marks ?? 1,
      image_url: formData.image_url || null,
      min_length: formData.min_length || null,
      max_length: formData.max_length || null
    }])
    .select()
    .single()

  if (questionError) {
    console.error('Error adding question:', questionError)
    return { error: questionError.message }
  }

  // 2. Link it to the test set
  const { error: linkError } = await supabase
    .from('test_questions')
    .insert([{
      test_set_id: formData.testSetId,
      question_id: questionData.id
    }])

  if (linkError) {
    console.error('Error linking question to test:', linkError)
    return { error: linkError.message }
  }

  // Add notification
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    // Get test title for better message
    const { data: testInfo } = await supabase.from('test_sets').select('title').eq('id', formData.testSetId).single()
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'admin_action',
      title: 'Question Added',
      message: `A new question was added to "${testInfo?.title || 'a test'}".`
    })
  }

  revalidatePath(`/admin/tests/${formData.testSetId}`)
  return { success: true }
}

export async function getQuestionById(questionId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('questions')
    .select('*')
    .eq('id', questionId)
    .single()
  return data
}

export async function getQuestionsByTest(testSetId: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('test_questions')
        .select(`
            sort_order,
            questions (*)
        `)
        .eq('test_set_id', testSetId)
        .order('sort_order')
    
    return (data || []).map(item => item.questions)
}

export async function getTestDetails(testId: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('test_sets')
        .select(`
            id,
            title,
            description,
            module_id,
            time_limit_minutes,
            pass_percentage,
            target_questions,
            attempts_allowed,
            cooldown_hours,
            is_paid,
            price,
            status,
            show_score,
            show_answers,
            show_explanation,
            start_date,
            end_date,
            randomize_questions,
            randomize_answers,
            marks_per_question,
            negative_marks,
            modules(id, name, categories(name)), 
            test_results(id, score), 
            question_count:test_questions(count)
        `)
        .eq('id', testId)
        .single()
    
    if (data) {
        const test = data as any;
        test.title = test.title?.replace(/Short/g, 'Free');
        const results = test.test_results || [];
        const passMark = test.pass_percentage || 75;
        test.taken = results.length;
        test.passed = results.filter((r: any) => r.score >= passMark).length;
        test.question_count = test.question_count && test.question_count[0] ? (test.question_count[0] as any).count : 0;
    }

    return data
}

export async function updateQuestion(questionId: string, testSetId: string, formData: {
  question_text: string,
  question_type: 'single' | 'multiple' | 'essay',
  options: string[],
  correct_options: number[],
  difficulty_level?: 'easy' | 'medium' | 'hard',
  explanation?: string,
  marks?: number,
  image_url?: string | null,
  min_length?: number | null,
  max_length?: number | null
}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('questions')
    .update({
      question_text: formData.question_text,
      question_type: formData.question_type,
      options: (formData.options || []).map(opt => String(opt || '').trim()).filter(opt => opt !== ''),
      correct_options: formData.correct_options,
      difficulty_level: formData.difficulty_level,
      correct_option_index: formData.question_type === 'single' ? formData.correct_options[0] : null,
      explanation: formData.explanation,
      marks: formData.marks ?? 1,
      image_url: formData.image_url || null,
      min_length: formData.min_length || null,
      max_length: formData.max_length || null
    })
    .eq('id', questionId)

  if (error) {
    console.error('Error updating question:', error)
    return { error: error.message }
  }

  revalidatePath(`/admin/tests/${testSetId}`)
  return { success: true }
}

export async function deleteQuestion(questionId: string, testSetId: string) {
  const supabase = await createClient()

  await supabase.from('test_questions').delete().eq('question_id', questionId)

  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId)

  if (error) {
    console.error('Error deleting question:', error)
    return { error: error.message }
  }

  revalidatePath(`/admin/tests/${testSetId}`)
  return { success: true }
}

export async function getCourses() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })
  
  return data || []
}

export async function addCourse(formData: { title: string, description: string, image_url?: string }) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('courses')
    .insert([{
      title: formData.title,
      description: formData.description,
      image_url: formData.image_url
    }])

  if (error) {
    console.error('Error adding course:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/courses')
  return { success: true }
}

export async function getCourseDetails(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single()
  return data
}

export async function getCourseModules(courseId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('course_modules')
    .select('*, modules(*, categories(*))')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })
  
  return data || []
}

export async function addModuleToCourse(courseId: string, moduleId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('course_modules')
    .insert([{ course_id: courseId, module_id: moduleId }])
  
  if (error) {
    console.error('Error adding module to course:', error)
    return { error: error.message }
  }
  revalidatePath(`/admin/courses/${courseId}`)
  return { success: true }
}

export async function removeModuleFromCourse(courseId: string, moduleId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('course_modules')
    .delete()
    .match({ course_id: courseId, module_id: moduleId })

  if (error) {
    console.error('Error removing module:', error)
    return { error: error.message }
  }
  revalidatePath(`/admin/courses/${courseId}`)
  return { success: true }
}

export async function bulkUploadQuestions(testSetId: string, moduleId: string, questions: any[]) {
  const supabase = await createClient()
  
  if (!questions || questions.length === 0) return { error: 'No questions provided' }

  // 1. Fetch limit and current count
  const { data: testData, error: testError } = await supabase
    .from('test_sets')
    .select('target_questions, current_count:test_questions(count)')
    .eq('id', testSetId)
    .single()
  
  if (testError) return { error: 'Failed to fetch test settings' }

  const limit = testData.target_questions || 0;
  const currentCount = testData.current_count && testData.current_count[0] ? (testData.current_count[0] as any).count : 0;
  
  // If target_questions is 0, it means no limit/unlimited capacity for the upload
  const remainingCapacity = limit === 0 ? questions.length : Math.max(0, limit - currentCount);

  let finalQuestions = questions;
  let limitReached = false;
  let skippedCount = 0;

  if (questions.length > remainingCapacity) {
    limitReached = true;
    skippedCount = questions.length - remainingCapacity;
    finalQuestions = questions.slice(0, remainingCapacity);
  }

  if (finalQuestions.length === 0 && questions.length > 0) {
    return { 
      error: 'Question limit reached. No more questions can be added to this test.',
      limitReached: true,
      skippedCount: questions.length
    }
  }

  let successCount = 0
  let errorCount = 0
  let lastError = null

  for (const q of finalQuestions) {
    try {
      // Robust field mapping
      const qText = q.question_text || q.Question || q.question;
      const qType = q.question_type || q.Type || q.type;
      
      // Map options A-E, being careful about case sensitivity
      const rawOptions = [
        q.option_a ?? q.OptionA ?? q.A,
        q.option_b ?? q.OptionB ?? q.B,
        q.option_c ?? q.OptionC ?? q.C,
        q.option_d ?? q.OptionD ?? q.D,
        q.option_e ?? q.OptionE ?? q.E
      ];
      const options = rawOptions
        .filter(o => o !== undefined && o !== null && String(o).trim() !== '')
        .map(o => String(o));

      const correctStr = String(q.correct_answer || q.CorrectAnswer || q.correct_options || '');
      const difficulty = (String(q.difficulty || q.Difficulty || 'medium')).toLowerCase() as 'easy' | 'medium' | 'hard';
      const expl = q.explanation || q.Explanation;
      const marks = parseInt(String(q.marks || q.Marks || '1')) || 1;
      const minLen = parseInt(String(q.min_length || q.MinLength || '')) || null;
      const maxLen = parseInt(String(q.max_length || q.MaxLength || '')) || null;

      // Friendly type mapping
      let type: 'single' | 'multiple' | 'essay' = 'single';
      const qTypeLower = String(qType || '').toLowerCase();
      if (qTypeLower === 'essay') {
        type = 'essay';
      } else if (qTypeLower.includes('multiple') || qTypeLower === 'multiple choice') {
        type = 'multiple';
      }

      if (!qText || (type !== 'essay' && options.length < 2)) {
        console.error('Invalid question data (missing text or options):', q)
        errorCount++
        continue
      }
      
      // Parse correct options (A, B, C or numbers)
      const correctParts = type === 'essay' ? [] : correctStr.split(/[|,]/).map(p => p.trim().toUpperCase()).filter(p => p !== '')
      
      const correctOptionsIndices = type === 'essay' ? [] : correctParts.map(part => {
        if (/^[A-E]$/.test(part)) {
          return part.charCodeAt(0) - 65;
        }
        const num = parseInt(part);
        return !isNaN(num) ? num : -1;
      }).filter(idx => idx >= 0 && idx < options.length);

      if (type !== 'essay' && correctOptionsIndices.length === 0) {
        console.error('No valid correct options detected for:', qText, 'Correct string was:', correctStr)
        errorCount++
        continue
      }

      // Auto-promote to multiple if more than one correct index is provided
      const finalType = type === 'essay' ? 'essay' : (correctOptionsIndices.length > 1 ? 'multiple' : type);

      const { data: qData, error: qError } = await supabase
        .from('questions')
        .insert([{
          module_id: moduleId,
          question_text: qText,
          question_type: finalType,
          options: (options || []).map(opt => String(opt || '').trim()).filter(opt => opt !== ''),
          correct_options: correctOptionsIndices,
          correct_option_index: finalType === 'single' ? correctOptionsIndices[0] : null,
          difficulty_level: ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium',
          explanation: expl || null,
          marks: marks,
          min_length: minLen,
          max_length: maxLen
        }])
        .select()
        .single()

      if (qError) {
        console.error('Supabase Error (Questions):', qError)
        throw qError
      }

      // Link to test set
      const { error: linkError } = await supabase
        .from('test_questions')
        .insert([{
          test_set_id: testSetId,
          question_id: qData.id,
          sort_order: successCount // Initial sorting
        }])

      if (linkError) {
        console.error('Supabase Error (Link):', linkError)
        throw linkError
      }

      successCount++
    } catch (err: any) {
      console.error('Catch Error during upload:', err)
      lastError = err?.message || 'Unknown error'
      errorCount++
    }
  }

  // Add notification
  const { data: { user } } = await supabase.auth.getUser()
  if (user && successCount > 0) {
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'admin_action',
      title: 'Bulk Upload Successful',
      message: `Successfully uploaded ${successCount} questions to the test.`
    })
  }

  revalidatePath(`/admin/tests/${testSetId}`)
  return { 
    success: true, 
    successCount, 
    errorCount, 
    lastError,
    limitReached,
    skippedCount
  }
}

export async function updateUserStatus(userId: string, status: 'active' | 'suspended') {
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ status })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user status:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function promoteUserToAdmin(userId: string) {
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', userId)

  if (error) {
    console.error('Error promoting user:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function deleteUser(userId: string) {
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  try {
    // 1. Get all attempt IDs for this user to clean up answers
    const { data: attempts } = await supabaseAdmin
      .from('test_attempts')
      .select('id')
      .eq('user_id', userId)
    
    const attemptIds = (attempts || []).map(a => a.id)

    // 2. Delete student answers if attempts exist
    if (attemptIds.length > 0) {
      await supabaseAdmin
        .from('student_answers')
        .delete()
        .in('attempt_id', attemptIds)
    }

    // 3. Delete other related records
    await Promise.all([
      supabaseAdmin.from('test_violations').delete().eq('user_id', userId),
      supabaseAdmin.from('test_results').delete().eq('user_id', userId),
      supabaseAdmin.from('payments').delete().eq('user_id', userId)
    ])

    // 4. Delete attempts
    await supabaseAdmin.from('test_attempts').delete().eq('user_id', userId)

    // 5. Delete profile
    await supabaseAdmin.from('profiles').delete().eq('id', userId)

    // 6. Finally delete the Auth user
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    
    if (authError) {
      console.error('Error deleting auth user:', authError)
      // We don't return error here if profile was deleted, but log it
    }

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error: any) {
    console.error('Comprehensive error deleting user:', error)
    return { error: error.message || 'Failed to delete user and related records' }
  }
}

export async function getAllTests() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('test_sets')
    .select(`
      *,
      modules (
        id,
        name
      ),
      test_results(id, score)
    `)
    .order('created_at', { ascending: false })
  
  if (data) {
    data.forEach((test: any) => {
        const results = test.test_results || [];
        const passMark = test.pass_percentage || 70;
        test.taken = results.length;
        test.passed = results.filter((r: any) => r.score >= passMark).length;
    });
  }

  return data || []
}
export async function updateModuleSettings(moduleId: string, data: {
  name: string,
  code?: string,
  category_id?: string | null,
  description?: string,
  status: 'enabled' | 'disabled' | 'hidden',
  free_tests_limit: number,
  paid_tests_limit: number,
  enable_purchase: boolean,
  price: number,
  icon_url?: string,
  image_url?: string
}) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('modules')
    .update({
      name: data.name,
      code: data.code,
      category_id: data.category_id || null,
      description: data.description,
      status: data.status === 'hidden' ? 'disabled' : data.status, // Internal status mapping
      free_tests_limit: data.free_tests_limit,
      paid_tests_limit: data.paid_tests_limit,
      enable_purchase: data.enable_purchase,
      price: data.price,
      icon_url: data.icon_url,
      image_url: data.image_url
    })
    .eq('id', moduleId)

  if (error) {
    console.error('Error updating module settings:', error)
    return { error: error.message }
  }

  revalidatePath(`/admin/modules/${moduleId}`)
  revalidatePath('/admin/modules')
  revalidatePath('/admin/questions')
  return { success: true }
}

export async function uploadModuleAsset(file: File, path: string) {
  const supabase = await createClient()
  
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random()}.${fileExt}`
  const filePath = `${path}/${fileName}`

  const { error: uploadError, data } = await supabase.storage
    .from('module-assets')
    .upload(filePath, file)

  if (uploadError) {
    console.error('Error uploading asset:', uploadError)
    return { error: uploadError.message }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('module-assets')
    .getPublicUrl(filePath)

  return { success: true, url: publicUrl }
}

export async function uploadQuestionImage(file: File) {
  const supabase = await createClient()
  
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `questions/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('question-images')
    .upload(filePath, file)

  if (uploadError) {
    console.error('Error uploading question image:', uploadError)
    return { error: uploadError.message }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('question-images')
    .getPublicUrl(filePath)

  return { success: true, url: publicUrl }
}

export async function deleteModule(moduleId: string) {
  const supabase = await createClient()

  try {
    // 1. Get all tests for this module
    const { data: tests, error: testsError } = await supabase
      .from('test_sets')
      .select('id')
      .eq('module_id', moduleId)

    if (testsError) {
      console.error('Error fetching tests for module:', testsError)
      return { error: 'Failed to fetch associated tests: ' + testsError.message }
    }

    const testIds = (tests || []).map(t => t.id)

    if (testIds.length > 0) {
      // 2. Delete test_questions links
      const { error: tqError } = await supabase
        .from('test_questions')
        .delete()
        .in('test_set_id', testIds)
      if (tqError) {
        console.error('Error deleting test_questions:', tqError)
        return { error: 'Failed to remove question links: ' + tqError.message }
      }

      // 3. Delete test_sets
      const { error: tsError } = await supabase
        .from('test_sets')
        .delete()
        .in('id', testIds)
      if (tsError) {
        console.error('Error deleting test_sets:', tsError)
        return { error: 'Failed to delete tests: ' + tsError.message }
      }
    }

    // 4. Delete questions
    const { error: qError } = await supabase
      .from('questions')
      .delete()
      .eq('module_id', moduleId)
    if (qError) {
      console.error('Error deleting questions:', qError)
      return { error: 'Failed to delete questions: ' + qError.message }
    }

    // 5. Delete module
    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', moduleId)

    if (error) {
      console.error('Error deleting module:', error)
      return { error: error.message }
    }

    revalidatePath('/admin/questions')
    revalidatePath('/admin/modules')
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error deleting module:', err)
    return { error: err?.message || 'An unexpected error occurred while deleting the module.' }
  }
}

export async function deleteCourse(courseId: string) {
  const supabase = await createClient()

  // 1. Delete course_modules links
  await supabase.from('course_modules').delete().eq('course_id', courseId)
  
  // 2. Delete the course
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId)

  if (error) {
    console.error('Error deleting course:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/courses')
  return { success: true }
}

export async function getPlatformSettings() {
  const supabase = await createClient()
  const SETTINGS_ID = '00000000-0000-0000-0000-000000000000'
  
  const { data, error } = await supabase
    .from('platform_settings')
    .select('*')
    .eq('id', SETTINGS_ID)
    .single()
  
  if (error) {
    console.error('Error fetching platform settings:', error)
    return null
  }
  
  return data
}

export async function updatePlatformSettings(formData: {
  platform_name: string,
  support_email: string,
  support_phone?: string,
  office_address?: string,
  maintenance_mode: boolean,
  default_test_price: number,
  facebook_url?: string,
  twitter_url?: string,
  linkedin_url?: string,
  instagram_url?: string,
  youtube_url?: string
}) {
  const supabase = await createClient()
  const SETTINGS_ID = '00000000-0000-0000-0000-000000000000'

  const { error } = await supabase
    .from('platform_settings')
    .update({
      platform_name: formData.platform_name,
      support_email: formData.support_email,
      support_phone: formData.support_phone,
      office_address: formData.office_address,
      maintenance_mode: formData.maintenance_mode,
      default_test_price: formData.default_test_price,
      facebook_url: formData.facebook_url,
      twitter_url: formData.twitter_url,
      linkedin_url: formData.linkedin_url,
      instagram_url: formData.instagram_url,
      youtube_url: formData.youtube_url,
      updated_at: new Date().toISOString()
    })
    .eq('id', SETTINGS_ID)

  if (error) {
    console.error('Error updating platform settings:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/settings')
  revalidatePath('/admin') // For sidebar footer reference if needed
  return { success: true }
}

export async function getAdminEmail() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    console.error('Error fetching admin user:', error)
    return null
  }

  return data.user.email
}

export async function updateAdminCredentials(data: { email?: string, password?: string }) {
  const supabase = await createClient()

  const updatePayload: { email?: string, password?: string } = {}
  if (data.email) updatePayload.email = data.email
  if (data.password) updatePayload.password = data.password

  // Check if there is anything to update
  if (Object.keys(updatePayload).length === 0) {
      return { success: true }
  }

  const { error } = await supabase.auth.updateUser(updatePayload, {
    emailRedirectTo: `${getURL()}api/auth/callback?next=/admin/settings`,
  })

  if (error) {
    console.error('Error updating admin credentials:', error)
    return { error: error.message }
  }

  return { success: true }
}

export async function globalSearch(query: string) {
  const supabase = await createClient()

  if (!query || query.trim() === '') {
    return { users: [], modules: [], tests: [] }
  }

  const searchTerm = `%${query.trim()}%`

  // Use Promise.all to fetch concurrently
  const [
    { data: users },
    { data: modules },
    { data: tests }
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .or(`email.ilike.${searchTerm},full_name.ilike.${searchTerm}`)
      .limit(5),
    supabase
      .from('modules')
      .select('id, name, description')
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(5),
    supabase
      .from('test_sets')
      .select('id, title, module_id')
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(5)
  ])

  return {
    users: users || [],
    modules: modules || [],
    tests: tests || []
  }
}

export async function createUser(formData: { name: string, email: string, password: string }) {
  if (!formData.password || formData.password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabaseAdmin.auth.admin.createUser({
    email: formData.email,
    password: formData.password,
    email_confirm: true,
    user_metadata: {
      full_name: formData.name
    }
  })

  if (error) {
    console.error('Error creating user:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function flushPlatformCache() {
  try {
    // Revalidate all paths
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error: any) {
    console.error('Error flushing cache:', error)
    return { error: error.message || 'Failed to flush cache' }
  }
}
export async function getTestCompletions(testId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('test_results')
    .select(`
      id,
      score,
      completed_at,
      profiles (
        full_name,
        email
      )
    `)
    .eq('test_set_id', testId)
    .order('completed_at', { ascending: false })

  if (error) {
    console.error('Error fetching test completions:', error)
    return { error: error.message }
  }

  return { success: true, data: data || [] }
}

export async function getModuleCompletions(moduleId: string) {
  const supabase = await createClient()
  
  // First get all tests in the module
  const { data: tests } = await supabase
    .from('test_sets')
    .select('id')
    .eq('module_id', moduleId)
  
  const testIds = (tests || []).map(t => t.id)
  
  if (testIds.length === 0) return { success: true, data: [] }

  const { data, error } = await supabase
    .from('test_results')
    .select(`
      id,
      score,
      completed_at,
      profiles (
        id,
        full_name,
        email
      )
    `)
    .in('test_set_id', testIds)
    .order('completed_at', { ascending: false })

  if (error) {
    console.error('Error fetching module completions:', error)
    return { error: error.message }
  }

  // Aggregate by student to show unique students
  const studentMap = new Map<string, any>()
  
  data?.forEach((res: any) => {
    const studentId = res.profiles?.id
    if (!studentId) return

    if (!studentMap.has(studentId)) {
      studentMap.set(studentId, {
        profile: res.profiles,
        testsCompleted: 0,
        lastAttempt: res.completed_at,
        bestScore: res.score
      })
    }
    
    const stats = studentMap.get(studentId)
    stats.testsCompleted += 1
    if (res.score > stats.bestScore) stats.bestScore = res.score
    if (new Date(res.completed_at) > new Date(stats.lastAttempt)) {
      stats.lastAttempt = res.completed_at
    }
  })

  return { success: true, data: Array.from(studentMap.values()) }
}

export async function forceLogoutUser(userId: string) {
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabaseAdmin.auth.admin.signOut(userId, 'global')

  if (error) {
    console.error('Error force logging out user:', error)
    return { error: error.message }
  }

  return { success: true }
}

export async function checkDatabaseHealth() {
  const supabase = await createClient()
  const start = Date.now()
  
  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1)
    const end = Date.now()
    
    if (error) throw error

    return {
      success: true,
      latency: `${end - start}ms`,
      status: 'Operational',
      timestamp: new Date().toISOString()
    }
  } catch (err: any) {
    console.error('Database health check failed:', err)
    return {
      success: false,
      error: err.message || 'Database connection error',
      status: 'Down',
      timestamp: new Date().toISOString()
    }
  }
}

// ---------------------------------------------------------------------------
// Essay Grading
// ---------------------------------------------------------------------------

// Admin grades a submitted essay result.
// Updates the test_results row → DB trigger fires → edge function sends email.
export async function gradeEssayResult(
  resultId: string,
  score: number,
  feedback: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('test_results')
    .update({
      score,
      feedback,
      status: 'graded',
      graded_by: user.id
    })
    .eq('id', resultId)

  if (error) return { error: error.message }

  revalidatePath('/admin/results')
  revalidatePath(`/admin/results/${resultId}`)
  return { success: true }
}

// ---------------------------------------------------------------------------
// Admin Grant Test Access
// ---------------------------------------------------------------------------

// Admin manually unlocks a paid test for a specific student (e.g. for testing
// or after verifying a Ziina payment). Creates a completed payment record.
export async function grantTestAccess(userId: string, testId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Use service role client to bypass RLS for inserting payments for other users
  const serviceClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get test title for the notification message
  const { data: test } = await supabase
    .from('test_sets')
    .select('title, module_id')
    .eq('id', testId)
    .single()

  if (!test) return { error: 'Test not found' }

  // Check if access already granted to avoid duplicates (use service client to bypass RLS)
  const { data: existing } = await serviceClient
    .from('payments')
    .select('id')
    .eq('user_id', userId)
    .eq('test_set_id', testId)
    .eq('status', 'completed')
    .maybeSingle()

  if (existing) return { error: 'Student already has access to this test' }

  // Create a completed payment record using service role (bypasses RLS)
  const { error: payErr } = await serviceClient
    .from('payments')
    .insert({
      user_id: userId,
      test_set_id: testId,
      amount: 0,
      status: 'completed',
      transaction_id: `ADMIN-GRANT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    })

  if (payErr) return { error: payErr.message }

  // Notify the student (use service client to bypass RLS for inserting notification)
  await serviceClient.from('notifications').insert({
    user_id: userId,
    type: 'payment_success',
    title: 'Test Access Granted',
    message: `An admin has unlocked "${test.title}" for you. You can now start the test.`
  })

  revalidatePath(`/admin/users/${userId}`)
  revalidatePath(`/dashboard/modules/${test.module_id}`)
  return { success: true }
}

// Fetch which paid tests a student already has access to (uses service role to bypass RLS)
export async function getStudentGrantedTestIds(userId: string): Promise<string[]> {
  const serviceClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data } = await serviceClient
    .from('payments')
    .select('test_set_id')
    .eq('user_id', userId)
    .eq('status', 'completed')
  return (data || []).map((p: any) => p.test_set_id)
}

// Fetch which modules a student already has access to (uses service role to bypass RLS)
export async function getStudentGrantedModuleIds(userId: string): Promise<string[]> {
  const serviceClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data } = await serviceClient
    .from('payments')
    .select('module_id')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .not('module_id', 'is', null)
  return (data || []).map((p: any) => p.module_id)
}

// Admin manually unlocks an entire module for a student (bypasses Ziina payment).
export async function grantModuleAccess(userId: string, moduleId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const serviceClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get module title for notification
  const { data: moduleInfo } = await supabase
    .from('modules')
    .select('name, price')
    .eq('id', moduleId)
    .single()

  if (!moduleInfo) return { error: 'Module not found' }

  // Check if already granted
  const { data: existing } = await serviceClient
    .from('payments')
    .select('id')
    .eq('user_id', userId)
    .eq('module_id', moduleId)
    .eq('status', 'completed')
    .maybeSingle()

  if (existing) return { error: 'Student already has access to this module' }

  // Create completed payment record
  const { error: payErr } = await serviceClient.from('payments').insert({
    user_id: userId,
    module_id: moduleId,
    amount: 0,
    status: 'completed',
    transaction_id: `ADMIN-MOD-GRANT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
  })

  if (payErr) return { error: payErr.message }

  // Notify the student (in-app)
  await serviceClient.from('notifications').insert({
    user_id: userId,
    type: 'payment_success',
    title: 'Module Access Granted',
    message: `An admin has unlocked the entire "${moduleInfo.name}" module for you. All paid tests are now available.`
  })

  // Send email to student
  if (process.env.SMTP_HOST) {
    const { data: student } = await serviceClient
      .from('profiles')
      .select('full_name, email')
      .eq('id', userId)
      .maybeSingle()

    if (student?.email) {
      const studentName = student.full_name || 'Student'
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wings-academy-mock-test-project.vercel.app'

      createMailTransporter().sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: student.email,
        subject: `Access Granted — ${moduleInfo.name}`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /></head>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:40px;">
  <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:8px;text-align:center;">
    <h2 style="color:#333;">Module Access Granted!</h2>
    <p style="font-size:16px;color:#555;">Hi ${studentName},</p>
    <p style="font-size:16px;color:#555;">
      An admin has unlocked <strong>${moduleInfo.name}</strong> for you.
      All paid tests in this module are now available with unlimited attempts.
    </p>
    <a href="${siteUrl}/dashboard/modules"
       style="display:inline-block;margin-top:20px;padding:14px 28px;
       background:#1e3a8a;color:white;text-decoration:none;
       border-radius:6px;font-size:16px;font-weight:bold;">
       Start Practicing
    </a>
    <p style="margin-top:30px;font-size:13px;color:#888;">
      © Wings Academy
    </p>
  </div>
</body>
</html>`.trim(),
      }).catch(err => console.error('Access grant email failed:', err.message))
    }
  }

  revalidatePath(`/admin/users/${userId}`)
  revalidatePath(`/dashboard/modules/${moduleId}`)
  return { success: true }
}

// Admin manually revokes module access from a student.
export async function revokeModuleAccess(userId: string, moduleId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const serviceClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await serviceClient
    .from('payments')
    .delete()
    .eq('user_id', userId)
    .eq('module_id', moduleId)
    .eq('status', 'completed')

  if (error) {
    console.error('Error revoking module access:', error)
    return { error: error.message }
  }

  // Get module title for notification
  const { data: moduleInfo } = await supabase
    .from('modules')
    .select('name')
    .eq('id', moduleId)
    .single()

  // Notify the student
  await serviceClient.from('notifications').insert({
    user_id: userId,
    type: 'admin_action',
    title: 'Module Access Revoked',
    message: `Your access to the "${moduleInfo?.name || 'module'}" module has been revoked by an administrator.`
  })

  revalidatePath(`/admin/users/${userId}`)
  revalidatePath(`/dashboard/modules/${moduleId}`)
  return { success: true }
}

// Admin manually revokes test access from a student.
export async function revokeTestAccess(userId: string, testId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const serviceClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await serviceClient
    .from('payments')
    .delete()
    .eq('user_id', userId)
    .eq('test_set_id', testId)
    .eq('status', 'completed')

  if (error) {
    console.error('Error revoking test access:', error)
    return { error: error.message }
  }

  // Get test title for notification
  const { data: testInfo } = await supabase
    .from('test_sets')
    .select('title, module_id')
    .eq('id', testId)
    .single()

  // Notify the student
  await serviceClient.from('notifications').insert({
    user_id: userId,
    type: 'admin_action',
    title: 'Test Access Revoked',
    message: `Your access to "${testInfo?.title || 'a test'}" has been revoked by an administrator.`
  })

  revalidatePath(`/admin/users/${userId}`)
  if (testInfo?.module_id) {
    revalidatePath(`/dashboard/modules/${testInfo.module_id}`)
  }
  return { success: true }
}

export async function getAllPayments() {

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabaseAdmin
    .from('payments')
    .select(`
      id,
      amount,
      status,
      transaction_id,
      created_at,
      profiles (full_name, email),
      test_sets (title),
      modules (name)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all payments:', error)
    return { error: error.message }
  }

  return { success: true, data: data || [] }
}
