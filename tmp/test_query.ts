import { createClient } from '../src/utils/supabase/server'

async function test() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('test_sets')
    .select('id, title, test_questions(count)')
    .limit(1)
  
  console.log(JSON.stringify(data, null, 2))
  if (error) console.error(error)
}

test()
