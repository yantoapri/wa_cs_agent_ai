export default defineEventHandler(async (event) => {
  try {
    console.log('[TEST-EMAIL] 🧪 === EMAIL TESTER STARTED ===')
    console.log('[TEST-EMAIL] 📍 Testing email to: apryant5@gmail.com')
    console.log('[TEST-EMAIL] 🕐 Timestamp:', new Date().toISOString())
    
    // Data test email
    const testData = {
      userEmail: 'apryant5@gmail.com',
      userName: 'Apryant (Test User)',
      invoiceNumber: `TEST-${Date.now()}`,
      planName: 'Premium Test Plan',
      amount: 150000,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
    
    console.log('[TEST-EMAIL] 📋 Test data:', testData)
    
    // Call the actual email API
    console.log('[TEST-EMAIL] 📞 Calling send-approval-email API...')
    
    const emailResponse = await $fetch('/api/send-approval-email', {
      method: 'POST',
      body: testData
    })
    
    console.log('[TEST-EMAIL] ✅ Email API response:', emailResponse)
    
    return {
      success: true,
      message: 'Test email berhasil dikirim ke apryant5@gmail.com',
      testData: testData,
      emailResponse: emailResponse,
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    console.error('[TEST-EMAIL] ❌ Test email failed:', error.message)
    console.error('[TEST-EMAIL] Error details:', {
      name: error.name,
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack
    })
    
    return {
      success: false,
      error: error.message,
      details: {
        name: error.name,
        statusCode: error.statusCode,
        statusMessage: error.statusMessage
      },
      timestamp: new Date().toISOString()
    }
  }
})
