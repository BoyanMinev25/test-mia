import { NextResponse } from 'next/server'
import { generateTwiMLResponse } from '@/lib/twilio/twilioUtils'

// Specify that this route uses Node.js runtime
export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL
    if (!websocketUrl) {
      console.error('Missing required NEXT_PUBLIC_WEBSOCKET_URL environment variable')
      // Return a TwiML response that says the service is unavailable
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '<Response>' +
        '<Say>Sorry, this service is currently unavailable. Please try again later.</Say>' +
        '<Hangup/>' +
        '</Response>',
        {
          headers: {
            'Content-Type': 'text/xml',
          },
        }
      )
    }
    
    const twimlResponse = generateTwiMLResponse(websocketUrl)
    
    return new NextResponse(twimlResponse, {
      headers: {
        'Content-Type': 'text/xml',
      },
    })
  } catch (error) {
    console.error('Error handling Twilio webhook:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 