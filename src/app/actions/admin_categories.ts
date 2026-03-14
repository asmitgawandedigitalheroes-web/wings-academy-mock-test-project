'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addCategory(name: string, description?: string, icon_url?: string, status: string = 'Active') {
  const supabase = await createClient()

  const dbStatus = status === 'Inactive' ? 'disabled' : 'enabled'

  const { data, error } = await supabase
    .from('categories')
    .insert([{ name, description, icon_url, status: dbStatus }])
    .select()
    .single()

  if (error) {
    console.error('Error adding category:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/categories')
  return { success: true, data }
}

export async function updateCategory(id: string, name: string, description?: string, icon_url?: string, status?: string) {
  const supabase = await createClient()

  const dbStatus = status === 'Inactive' ? 'disabled' : (status === 'Active' ? 'enabled' : status)

  const { data, error } = await supabase
    .from('categories')
    .update({ name, description, icon_url, status: dbStatus })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating category:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/categories')
  revalidatePath('/admin/modules')
  return { success: true, data }
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()

  // First check if any modules are using this category
  const { data: modules, error: checkError } = await supabase
    .from('modules')
    .select('id')
    .eq('category_id', id)
    .limit(1)

  if (checkError) {
    console.error('Error checking category usage:', checkError)
    return { error: checkError.message }
  }

  if (modules && modules.length > 0) {
    return { error: 'This category is being used by one or more modules and cannot be deleted.' }
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting category:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/categories')
  return { success: true }
}
