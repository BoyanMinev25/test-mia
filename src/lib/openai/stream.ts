import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser';

interface OpenAIStreamOptions {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  max_tokens?: number;
}

type StreamEvent = 'data' | 'end';

export class OpenAIStream {
  private options: OpenAIStreamOptions;
  private listeners: {
    data: (chunk: string) => void;
    end: () => void;
  };

  constructor(options: OpenAIStreamOptions) {
    this.options = options;
    this.listeners = { data: () => {}, end: () => {} };
  }

  on(event: 'data', callback: (chunk: string) => void): void;
  on(event: 'end', callback: () => void): void;
  on(event: StreamEvent, callback: any): void {
    this.listeners[event] = callback;
  }

  async start(): Promise<void> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify(this.options),
      });

      const decoder = new TextDecoder();
      
      if (!response.body) {
        throw new Error('No response body');
      }

      const parser = createParser((event: ParsedEvent | ReconnectInterval) => {
        if ('data' in event && event.type === 'event' && event.data !== '[DONE]') {
          try {
            const data = JSON.parse(event.data);
            this.listeners.data(data.choices[0].delta?.content || '');
          } catch (error) {
            console.error('Parsing error:', error);
          }
        }
      });

      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        parser.feed(decoder.decode(value));
      }

      this.listeners.end();
    } catch (error) {
      console.error('Stream error:', error);
      this.listeners.end();
      throw new Error(`Stream failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 