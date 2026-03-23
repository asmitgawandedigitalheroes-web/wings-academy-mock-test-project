const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kxwxaowhwmoleakdvnlg.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIwNTM5NiwiZXhwIjoyMDg4NzgxMzk2fQ.Sx2RcPqbjOfPhDuXOubLAWMPPZzuugxv0C4lH06tj3s'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function testIt() {
    const testId = '16650295-bbfc-41d6-bdbd-159f0e427dd7' // Module 1 - Full Test 1 (32 q's)
    
    // Simulate what getTestData does
    const { data: questionLinks, error: linkError } = await supabase
        .from('test_questions')
        .select(`
        question_id,
        sort_order,
        questions(*)
        `)
        .eq('test_set_id', testId)
        .order('sort_order', { ascending: true })

    console.log("Returned rows from DB join:", questionLinks?.length)
    if (questionLinks && questionLinks.length > 0) {
       console.log("First question questions(*) format:", Array.isArray(questionLinks[0].questions) ? 'Array' : typeof questionLinks[0].questions)
       console.log("First question raw options:", questionLinks[0].questions?.options)
    }
}
testIt()
