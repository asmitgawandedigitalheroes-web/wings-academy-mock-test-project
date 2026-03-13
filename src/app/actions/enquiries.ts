'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitEnquiry(formData: FormData) {
  const firstName = formData.get('first-name') as string
  const lastName = formData.get('last-name') as string
  const email = formData.get('email') as string
  const message = formData.get('message') as string

  if (!firstName || !lastName || !email || !message) {
    return { error: 'All fields are required' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('enquiries')
    .insert([{
      first_name: firstName,
      last_name: lastName,
      email: email,
      message: message
    }])

  if (error) {
    console.error('Error submitting enquiry:', error)
    return { error: 'Failed to submit enquiry. Please try again later.' }
  }

  return { success: true }
}

export async function getEnquiries() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('enquiries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching enquiries:', error)
    return { error: 'Failed to fetch enquiries' }
  }

  return { data }
}

export async function updateEnquiryStatus(id: string, status: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('enquiries')
    .update({ status })
    .eq('id', id)

  if (error) {
    console.error('Error updating enquiry status:', error)
    return { error: 'Failed to update enquiry status' }
  }

  revalidatePath('/admin/enquiries')
  return { success: true }
}

export async function deleteEnquiry(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('enquiries')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting enquiry:', error)
    return { error: 'Failed to delete enquiry' }
  }

  revalidatePath('/admin/enquiries')
  return { success: true }
}
