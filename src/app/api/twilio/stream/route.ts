import { OpenAIStream } from '../../../../lib/openai/stream.js'
import { db } from '@/lib/firebase/firebase'
import { addDoc, collection } from 'firebase/firestore'

export const runtime = 'edge'

const systemPrompt = `You are an AI assistant for Bart's Automotive. 
Your role is to handle incoming calls professionally and collect the following information:
- Customer's name
- Best time for a callback
- Any specific issues or notes about their vehicle

Be polite, professional, and efficient in gathering this information.`

export async function POST(req: Request) {
  if (!req.body) {
    return new Response('No body received', { status: 400 })
  }

  try {
    const stream = new OpenAIStream({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
      ],
      stream: true,
    })

    // Create a TransformStream to handle the data
    const { readable, writable } = new TransformStream()
    
    // Pipe the OpenAI stream data through the transform stream
    stream.on('data', async (data: string | Record<string, any>) => {
      const writer = writable.getWriter()
      const { text, callSid, from } = typeof data === 'string' ? JSON.parse(data) : data
      
      // Store call data in Firebase
      await addDoc(collection(db, 'calls'), {
        callSid,
        from,
        timestamp: new Date(),
        transcription: text,
        status: 'in-progress'
      })

      // Write the data to the transform stream
      await writer.write(new TextEncoder().encode(JSON.stringify({ text, callSid, from }) + '\n'))
      writer.releaseLock()
    })

    // Handle stream end
    stream.on('end', () => {
      const writer = writable.getWriter()
      writer.close()
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Error processing stream:', error)
    return new Response('Error processing stream', { status: 500 })
  }
} 