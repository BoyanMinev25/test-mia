import Logger from '@/lib/utils/logger'

export async function POST(req: Request) {
  try {
    // ... existing code ...
  } catch (error) {
    Logger.error('Twilio API error:', error)
    
    return new Response(
      JSON.stringify({
        error: process.env.NODE_ENV === 'development' 
          ? `Twilio error: ${error.message}`
          : 'Failed to process message'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 