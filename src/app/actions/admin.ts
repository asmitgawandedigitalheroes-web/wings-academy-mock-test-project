'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function addSubject(formData: { name: string, categoryId: string }) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('subjects')
    .insert([{
      name: formData.name,
      category_id: formData.categoryId
    }])

  if (error) {
    console.error('Error adding subject:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/questions')
  return { success: true }
}

export async function toggleSubjectStatus(subjectId: string, currentStatus: 'enabled' | 'disabled') {
  const supabase = await createClient()
  const newStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled'
  
  const { error } = await supabase
    .from('subjects')
    .update({ status: newStatus })
    .eq('id', subjectId)

  if (error) {
    console.error('Error toggling subject status:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/questions')
  revalidatePath('/admin/subjects')
  revalidatePath(`/admin/subjects/${subjectId}`)
  return { success: true }
}

export async function addQuestion(formData: {
  subjectId: string,
  question_text: string,
  options: string[],
  correct_option_index: number,
  explanation?: string
}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('questions')
    .insert([{
      subject_id: formData.subjectId,
      question_text: formData.question_text,
      options: formData.options,
      correct_option_index: formData.correct_option_index,
      explanation: formData.explanation
    }])

  if (error) {
    console.error('Error adding question:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/questions')
  return { success: true }
}

export async function getStats() {
  const supabase = await createClient()

  const [subjectsCount, questionsCount] = await Promise.all([
    supabase.from('subjects').select('*', { count: 'exact', head: true }),
    supabase.from('questions').select('*', { count: 'exact', head: true })
  ])

  return {
    subjects: subjectsCount.count || 0,
    questions: questionsCount.count || 0
  }
}

export async function getCategories() {
    const supabase = await createClient()
    const { data } = await supabase.from('categories').select('*').order('name')
    return data || []
}

export async function getSubjectsWithCategories() {
    const supabase = await createClient()
    const { data } = await supabase
        .from('subjects')
        .select('id, name, status, categories(id, name)')
        .order('name')
    return (data || []) as any[]
}
export async function getTestsBySubject(subjectId: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('test_sets')
        .select('*, question_count:test_questions(count)')
        .eq('subject_id', subjectId)
        .order('created_at', { ascending: false })
    
    // Transform the data to pull the count out of the array/object
    const testsWithCounts = (data || []).map(test => ({
        ...test,
        question_count: test.question_count && test.question_count[0] ? (test.question_count[0] as any).count : 0
    }))

    return testsWithCounts
}

export async function addTest(formData: { 
  title: string, 
  subjectId: string, 
  duration: number, 
  description?: string,
  passPercentage?: number,
  targetQuestions?: number,
  attemptsAllowed?: number,
  testType?: 'short' | 'full',
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
      subject_id: formData.subjectId,
      time_limit_minutes: formData.duration,
      pass_percentage: formData.passPercentage || 40,
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

  revalidatePath(`/admin/subjects/${formData.subjectId}`)
  return { success: true }
}

export async function updateTestSettings(testId: string, subjectId: string, data: {
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

    revalidatePath(`/admin/subjects/${subjectId}`)
    revalidatePath(`/admin/tests/${testId}`)
    revalidatePath(`/admin/tests/${testId}/settings`)
    return { success: true }
}

export async function toggleTestStatus(testId: string, subjectId: string, currentStatus: 'published' | 'draft') {
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

  revalidatePath(`/admin/subjects/${subjectId}`)
  revalidatePath('/admin/tests')
  revalidatePath(`/admin/tests/${testId}`)
  return { success: true }
}

export async function toggleTestPaid(testId: string, subjectId: string, currentPaid: boolean, price: number = 0) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('test_sets')
    .update({ is_paid: !currentPaid, price: !currentPaid ? price : 0 })
    .eq('id', testId)

  if (error) {
    console.error('Error toggling paid status:', error)
    return { error: error.message }
  }

  revalidatePath(`/admin/subjects/${subjectId}`)
  return { success: true }
}

export async function deleteTestSet(testId: string, subjectId: string) {
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

  revalidatePath(`/admin/subjects/${subjectId}`)
  return { success: true }
}

export async function getSubjectDetails(subjectId: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('subjects')
        .select('*, categories(name)')
        .eq('id', subjectId)
        .single()
    return data
}
export async function addQuestionToTest(formData: {
  testSetId: string,
  subjectId: string,
  question_text: string,
  question_type: 'single' | 'multiple',
  options: string[],
  correct_options: number[],
  difficulty_level?: 'easy' | 'medium' | 'hard',
  explanation?: string,
  marks?: number,
  image_url?: string | null
}) {
  const supabase = await createClient()

  // 1. Create the question
  const { data: questionData, error: questionError } = await supabase
    .from('questions')
    .insert([{
      subject_id: formData.subjectId,
      question_text: formData.question_text,
      question_type: formData.question_type,
      options: formData.options,
      correct_options: formData.correct_options,
      difficulty_level: formData.difficulty_level || 'medium',
      correct_option_index: formData.question_type === 'single' ? formData.correct_options[0] : null,
      explanation: formData.explanation,
      marks: formData.marks ?? 1,
      image_url: formData.image_url || null
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
        .select('*, subjects(id, name, categories(name))')
        .eq('id', testId)
        .single()
    return data
}

export async function updateQuestion(questionId: string, testSetId: string, formData: {
  question_text: string,
  question_type: 'single' | 'multiple',
  options: string[],
  correct_options: number[],
  difficulty_level?: 'easy' | 'medium' | 'hard',
  explanation?: string,
  marks?: number,
  image_url?: string | null
}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('questions')
    .update({
      question_text: formData.question_text,
      question_type: formData.question_type,
      options: formData.options,
      correct_options: formData.correct_options,
      difficulty_level: formData.difficulty_level,
      correct_option_index: formData.question_type === 'single' ? formData.correct_options[0] : null,
      explanation: formData.explanation,
      marks: formData.marks ?? 1,
      image_url: formData.image_url || null
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

export async function getCourseSubjects(courseId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('course_subjects')
    .select('*, subjects(*, categories(*))')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })
  
  return data || []
}

export async function addSubjectToCourse(courseId: string, subjectId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('course_subjects')
    .insert([{ course_id: courseId, subject_id: subjectId }])
  
  if (error) {
    console.error('Error adding subject to course:', error)
    return { error: error.message }
  }
  revalidatePath(`/admin/courses/${courseId}`)
  return { success: true }
}

export async function removeSubjectFromCourse(courseId: string, subjectId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('course_subjects')
    .delete()
    .match({ course_id: courseId, subject_id: subjectId })

  if (error) {
    console.error('Error removing subject:', error)
    return { error: error.message }
  }
  revalidatePath(`/admin/courses/${courseId}`)
  return { success: true }
}

export async function bulkUploadQuestions(testSetId: string, subjectId: string, questions: any[]) {
  const supabase = await createClient()
  
  if (!questions || questions.length === 0) return { error: 'No questions provided' }

  let successCount = 0
  let errorCount = 0
  let lastError = null

  for (const q of questions) {
    try {
      // Robust field mapping
      const qText = q.question_text || q.Question || q.question;
      const qType = q.question_type || q.Type || q.type;
      
      // Map options A-E, being careful about case sensitivity
      const rawOptions = [
        q.option_a || q.OptionA || q.A,
        q.option_b || q.OptionB || q.B,
        q.option_c || q.OptionC || q.C,
        q.option_d || q.OptionD || q.D,
        q.option_e || q.OptionE || q.E
      ];
      const options = rawOptions.filter(o => o !== undefined && o !== null && String(o).trim() !== '');

      const correctStr = String(q.correct_answer || q.CorrectAnswer || q.correct_options || '');
      const difficulty = (String(q.difficulty || q.Difficulty || 'medium')).toLowerCase() as 'easy' | 'medium' | 'hard';
      const expl = q.explanation || q.Explanation;
      const marks = parseInt(String(q.marks || q.Marks || '1')) || 1;

      if (!qText || options.length < 2) {
        console.error('Invalid question data (missing text or options):', q)
        errorCount++
        continue
      }
      
      // Friendly type mapping
      let type: 'single' | 'multiple' = 'single';
      const qTypeLower = String(qType || '').toLowerCase();
      if (qTypeLower.includes('multiple') || qTypeLower === 'multiple choice') {
        type = 'multiple';
      }

      // Parse correct options (A, B, C or numbers)
      const correctParts = correctStr.split(/[|,]/).map(p => p.trim().toUpperCase()).filter(p => p !== '')
      
      const correctOptionsIndices = correctParts.map(part => {
        if (/^[A-E]$/.test(part)) {
          return part.charCodeAt(0) - 65;
        }
        const num = parseInt(part);
        return !isNaN(num) ? num : -1;
      }).filter(idx => idx >= 0 && idx < options.length);

      if (correctOptionsIndices.length === 0) {
        console.error('No valid correct options detected for:', qText, 'Correct string was:', correctStr)
        errorCount++
        continue
      }

      // Auto-promote to multiple if more than one correct index is provided
      const finalType = correctOptionsIndices.length > 1 ? 'multiple' : type;

      const { data: qData, error: qError } = await supabase
        .from('questions')
        .insert([{
          subject_id: subjectId,
          question_text: qText,
          question_type: finalType,
          options: options,
          correct_options: correctOptionsIndices,
          correct_option_index: finalType === 'single' ? correctOptionsIndices[0] : null,
          difficulty_level: ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium',
          explanation: expl || null,
          marks: marks
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

  revalidatePath(`/admin/tests/${testSetId}`)
  return { success: true, successCount, errorCount, lastError }
}

export async function updateUserStatus(userId: string, status: 'active' | 'suspended') {
  const supabase = await createClient()
  const { error } = await supabase
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
  const supabase = await createClient()
  const { error } = await supabase
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
  const supabase = await createClient()
  
  // Note: auth.users deletion usually requires admin privileges or service role
  // Here we only delete the profile; in a real app, we might want to disable auth too.
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)

  if (error) {
    console.error('Error deleting profile:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function getAllTests() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('test_sets')
    .select(`
      *,
      subjects (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false })
  
  return data || []
}
export async function updateSubjectSettings(subjectId: string, data: {
  name: string,
  code?: string,
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
    .from('subjects')
    .update({
      name: data.name,
      code: data.code,
      description: data.description,
      status: data.status === 'hidden' ? 'disabled' : data.status, // Internal status mapping
      free_tests_limit: data.free_tests_limit,
      paid_tests_limit: data.paid_tests_limit,
      enable_purchase: data.enable_purchase,
      price: data.price,
      icon_url: data.icon_url,
      image_url: data.image_url
    })
    .eq('id', subjectId)

  if (error) {
    console.error('Error updating subject settings:', error)
    return { error: error.message }
  }

  revalidatePath(`/admin/subjects/${subjectId}`)
  revalidatePath('/admin/subjects')
  revalidatePath('/admin/questions')
  return { success: true }
}

export async function uploadSubjectAsset(file: File, path: string) {
  const supabase = await createClient()
  
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random()}.${fileExt}`
  const filePath = `${path}/${fileName}`

  const { error: uploadError, data } = await supabase.storage
    .from('subject-assets')
    .upload(filePath, file)

  if (uploadError) {
    console.error('Error uploading asset:', uploadError)
    return { error: uploadError.message }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('subject-assets')
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

export async function deleteSubject(subjectId: string) {
  const supabase = await createClient()

  // 1. Get all tests for this subject
  const { data: tests } = await supabase
    .from('test_sets')
    .select('id')
    .eq('subject_id', subjectId)

  const testIds = (tests || []).map(t => t.id)

  if (testIds.length > 0) {
    // 2. Delete test_questions links
    await supabase.from('test_questions').delete().in('test_set_id', testIds)
    // 3. Delete test_sets
    await supabase.from('test_sets').delete().in('id', testIds)
  }

  // 4. Delete questions
  await supabase.from('questions').delete().eq('subject_id', subjectId)

  // 5. Delete subject
  const { error } = await supabase
    .from('subjects')
    .delete()
    .eq('id', subjectId)

  if (error) {
    console.error('Error deleting subject:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/questions')
  revalidatePath('/admin/subjects')
  return { success: true }
}

export async function deleteCourse(courseId: string) {
  const supabase = await createClient()

  // 1. Delete course_subjects links
  await supabase.from('course_subjects').delete().eq('course_id', courseId)
  
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
  default_test_price: number
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

  const { error } = await supabase.auth.updateUser(updatePayload)

  if (error) {
    console.error('Error updating admin credentials:', error)
    return { error: error.message }
  }

  return { success: true }
}

export async function globalSearch(query: string) {
  const supabase = await createClient()

  if (!query || query.trim() === '') {
    return { users: [], subjects: [], tests: [] }
  }

  const searchTerm = `%${query.trim()}%`

  // Use Promise.all to fetch concurrently
  const [
    { data: users },
    { data: subjects },
    { data: tests }
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .or(`email.ilike.${searchTerm},full_name.ilike.${searchTerm}`)
      .limit(5),
    supabase
      .from('subjects')
      .select('id, name, description')
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(5),
    supabase
      .from('test_sets')
      .select('id, title, subject_id')
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(5)
  ])

  return {
    users: users || [],
    subjects: subjects || [],
    tests: tests || []
  }
}

export async function createUser(formData: { name: string, email: string, password: string }) {
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
