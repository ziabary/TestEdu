interface WebSocketMessage {
  type: 'message' | 'error' | 'open' | 'close'
  data?: any
}

type ResponseKey = 'جمع' | 'نیرو' | 'حرکت'

interface ChatMessage {
  question: string
  message?: string
}

class MockWebSocket {
  private listeners: Map<string, Function[]> = new Map()
  private rateLimit = {
    lastMessage: 0,
    messages: 0,
    maxMessagesPerSecond: 10
  }

  constructor() {
    // Simulate connection
    setTimeout(() => this.dispatchEvent('open', { type: 'open' }), 1000)
  }

  addEventListener(event: string, listener: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)?.push(listener)
  }

  removeEventListener(event: string, listener: Function) {
    const listeners = this.listeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  send(message: string) {
    const now = Date.now()
    
    // Rate limiting (10 messages per second)
    if (now - this.rateLimit.lastMessage < 1000) {
      this.rateLimit.messages++
      if (this.rateLimit.messages > this.rateLimit.maxMessagesPerSecond) {
        this.dispatchEvent('error', { type: 'error', data: 'Too many messages' })
        return
      }
    } else {
      this.rateLimit.messages = 1
      this.rateLimit.lastMessage = now
    }

    try {
      const data = JSON.parse(message) as ChatMessage
      if (data.message === 'STOP_STREAM') {
        this.dispatchEvent('message', { type: 'message', data: 'STOP_STREAM' })
        return
      }

      // Mock chat response
      const responses: Record<ResponseKey, string> = {
        'جمع': 'برای جمع اعداد صحیح، علامت‌ها را بررسی کن. مثال: $$x + y = z$$',
        'نیرو': 'نیروی گرانش: $$F = m \cdot g$$، \g = 9.8 \, m/s^2\.',
        'حرکت': 'حرکت خطی با سرعت ثابت: $$s = v \cdot t$$'
      }

      const question = data.question?.toLowerCase()
      const response = responses[Object.keys(responses).find(key => 
        question?.includes(key as string)) as ResponseKey || ''] || 'این سؤال خارج از موضوع درسه!'

      // Simulate streaming response
      const stream = () => {
        const words = response.split(' ')
        const interval = setInterval(() => {
          if (words.length === 0) {
            clearInterval(interval)
            this.dispatchEvent('message', { type: 'message', data: 'STREAM_COMPLETED' })
            return
          }
          
          const word = words.shift()
          this.dispatchEvent('message', { type: 'message', data: word })
        }, 500)
      }

      stream()

    } catch (error) {
      this.dispatchEvent('error', { type: 'error', data: 'Invalid message format' })
    }
  }

  close() {
    this.dispatchEvent('close', { type: 'close' })
  }

  private dispatchEvent(event: string, data: WebSocketMessage) {
    const listeners = this.listeners.get(event)
    if (listeners) {
      listeners.forEach(listener => listener(data))
    }
  }

  get readyState() {
    return 1 // OPEN
  }
}

// Override WebSocket globally
(window as any).WebSocket = MockWebSocket

export default MockWebSocket
export { MockWebSocket }
