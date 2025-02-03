import { OpenAIStream } from '@/lib/openai/stream'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { transcription, date, time } = await req.json()

    const prompt = `
      Based on this call transcription: "${transcription}"
      
      Generate a professional and friendly SMS confirmation message for an appointment scheduled for ${date} at ${time}.
      The message should:
      1. Be concise and clear
      2. Include the date and time
      3. Reference the key points from the conversation if relevant
      4. Be friendly but professional
      5. Not exceed 160 characters
    `

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional assistant helping to generate SMS confirmation messages for appointments.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      }),
    })

    const data = await response.json()
    return NextResponse.json({ suggestion: data.choices[0].message.content.trim() })
  } catch (error) {
    console.error('Error generating message suggestion:', error)
    return NextResponse.json(
      { error: 'Failed to generate message suggestion' },
      { status: 500 }
    )
  }
} 