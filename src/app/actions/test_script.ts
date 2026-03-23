import { getTestData } from './dashboard'

async function check() {
  const data = await getTestData('b642791f-5ce8-4d6f-8476-08a92b840e68')
  console.log("TEST ID: b642791f-5ce8-4d6f-8476-08a92b840e68")
  
  if (!data) {
    console.log("Error: Test data not found or not authenticated.")
    return
  }
  
  if ("locked" in data && data.locked) {
    console.log(`Test is locked. User is in a lockout period for ${data.lockoutMinutes} more minutes.`)
    return
  }

  // At this point, we know data is the successful test data object
  // Use type casting or careful access if the TS union still complains
  const testData = data as any 
  console.log("Target questions according to test data:", testData.target_questions)
  console.log("Returned questions count:", testData.questions?.length)
  console.log("First question options:", testData.questions?.[0])
}

check().catch(console.error)
