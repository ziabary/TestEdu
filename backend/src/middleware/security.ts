import rateLimit from 'express-rate-limit'
import cors from 'cors'
import helmet from 'helmet'
import expressSanitizer from 'express-sanitizer'
import { Request, Response, NextFunction } from 'express'
import { WebSocket } from 'ws'

// Rate limiting
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})

// CORS configuration
export const corsConfig = cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
})

// Security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'ws:'],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
      blockAllMixedContent: []
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false
})

// Request validation
export const sanitizeRequest = expressSanitizer()

// Input validation middleware
export const validateInput = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = schema.validate(req.body)
      if (error) {
        return res.status(400).json({ error: error.details[0].message })
      }
      next()
    } catch (error) {
      res.status(400).json({ error: 'Invalid input data' })
    }
  }
}

// WebSocket rate limiting
export interface WebSocketState {
  lastMessage: number
  messages: number
}

const wsRateLimits = new Map<string, WebSocketState>()

export const wsRateLimit = (ws: WebSocket, req: any): boolean => {
  const ip = req.connection.remoteAddress
  const now = Date.now()
  const connectionId = `${ip}-${Date.now()}`
  
  if (!wsRateLimits.has(connectionId)) {
    wsRateLimits.set(connectionId, {
      lastMessage: now,
      messages: 0
    })
  }

  const state = wsRateLimits.get(connectionId)
  if (!state) return true

  if (now - state.lastMessage < 1000) {
    state.messages++
    if (state.messages > 10) {
      ws.send('E:Too many messages')
      ws.close()
      return false
    }
  } else {
    state.messages = 1
    state.lastMessage = now
  }
  return true
}
