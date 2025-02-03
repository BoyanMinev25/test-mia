import { NextResponse } from 'next/server'
import twilio from 'twilio'

// Specify that this route uses Node.js runtime
export const runtime = 'nodejs'

// Add logging to debug environment variables
console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID)
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN)
console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER)

// Move client creation inside the POST handler to handle missing credentials
export async function POST(req: Request) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      console.error('Missing credentials:', { accountSid, authToken, twilioPhoneNumber })
      return NextResponse.json(
        { error: 'Missing Twilio credentials. Please check your environment variables.' },
        { status: 500 }
      )
    }

    const client = twilio(accountSid, authToken)
    const { to, message } = await req.json()

    const response = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to
    })

    return NextResponse.json({ success: true, messageId: response.sid })
  } catch (error) {
    console.error('Error sending SMS:', error)
    return NextResponse.json(
      { error: 'Failed to send SMS: ' + (error as Error).message },
      { status: 500 }
    )
  }
} 