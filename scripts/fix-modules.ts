import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function run() {
  console.log('--- Updating Modules ---')

  // 2. Fix Module 5 Typo
  console.log('Fixing Module 5 Typo...')
  const { error: updateError } = await supabase
    .from('modules')
    .update({ name: 'Electronic Instrument Systems' })
    .ilike('name', '%Elnic%')

  if (updateError) console.error('Error updating Module 5:', updateError)
  else console.log('Successfully updated Module 5 name.')

  console.log('--- Done ---')
}

run()
