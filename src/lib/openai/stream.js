import { createParser } from 'eventsource-parser'

export class OpenAIStream {
  constructor(options) {
    this.options = options
    this.listeners = {}
  }

  on(event, callback) {
    this.listeners[event] = callback
  }

  async start() {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify(this.options),
      })

      const parser = createParser((event) => {
        if (event.type === 'event' && event.data !== '[DONE]') {
          const data = JSON.parse(event.data)
          if (this.listeners['data']) {
            this.listeners['data'](data.choices[0].text)
          }
        }
      })

      const decoder = new TextDecoder()

      for await (const chunk of response.body) {
        parser.feed(decoder.decode(chunk))
      }

      if (this.listeners['end']) {
        this.listeners['end']()
      }
    } catch (error) {
      console.error('Stream error:', error)
      throw error
    }
  }
}
