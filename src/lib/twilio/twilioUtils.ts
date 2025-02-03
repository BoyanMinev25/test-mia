import { Twilio } from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER

if (!accountSid || !authToken) {
  throw new Error('Missing Twilio credentials')
}

export const twilioClient = new Twilio(accountSid, authToken)

export const generateTwiMLResponse = (websocketUrl: string) => {
  return `
    <?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Connect>
        <Stream url="${websocketUrl}">
          <Parameter name="mode" value="speech" />
        </Stream>
      </Connect>
      <Say>Please wait while I connect you to our AI assistant.</Say>
    </Response>
  `.trim()
}

export const sendSMS = async (to: string, message: string) => {
  try {
    const response = await fetch('/api/twilio/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        message,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to send SMS')
    }

    return await response.json()
  } catch (error) {
    console.error('Error sending SMS:', error)
    throw error
  }
} 