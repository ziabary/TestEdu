import express, { Express, Request, Response, NextFunction, RequestHandler } from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import swaggerRouter from './swagger'
import { WebSocketServer, WebSocket, MessageEvent } from 'ws'
import { v4 as uuidv4 } from 'uuid'
import jwt from 'jsonwebtoken'
import http from 'http'
import cookieParser from 'cookie-parser'
import moment from 'moment-timezone'
import { securityHeaders, corsConfig, apiLimiter, wsRateLimit } from './middleware/security'
import { avvalaiService } from './services/avvalai'
import axios from 'axios'

process.env.TZ = 'Asia/Tehran'

const app: Express = express()
const server = http.createServer(app)
const prisma = new PrismaClient()
const port = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Apply security middleware
app.use(securityHeaders)
app.use(corsConfig)
app.use(apiLimiter)
app.use(cookieParser())
app.use(express.json())

// Create WebSocket server
const wss = new WebSocketServer({ noServer: true })

interface AuthenticatedRequest extends Request {
  user?: { usrID: number; usrPhone: string }
}

const verifyJWT = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as { usrID: number; usrPhone: string }
  } catch {
    return null
  }
}

const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token
  if (!token) return res.status(401).json({ error: 'Authentication required' })

  const user = verifyJWT(token)
  if (!user) return res.status(401).json({ error: 'Invalid token' })

  req.user = user
  next()
}

const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token
  if (!token) return res.status(401).json({ error: 'Authentication required' })

  const user = verifyJWT(token)
  if (!user) return res.status(401).json({ error: 'Invalid token' })

  const dbUser = await prisma.tblUser.findUnique({ where: { usrID: user.usrID } })
  if (!dbUser || dbUser.usrGrade !== 0) return res.status(403).json({ error: 'Admin access required' })

  req.user = user
  next()
}

// WebSocket Setup
server.on('upgrade', (req, socket, head) => {
  const url = new URL(req.url || '', `http://${req.headers.host}`)
  const sessionId = url.searchParams.get('sessionId')
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req, sessionId)
  })
})

interface ConnectionState {
  sessionId: string
  userId: number
  lastMessageTime: number
  messages: number
}
const connectionStates: Map<WebSocket, ConnectionState> = new Map()

wss.on('connection', (ws: WebSocket, req: http.IncomingMessage, sessionId?: string) => {
  const cookies = req.headers.cookie?.split('; ').reduce((acc, c) => {
    const [key, value] = c.split('=')
    acc[key] = value
    return acc
  }, {} as Record<string, string>)

  const token = cookies?.token
  const user = token ? verifyJWT(token) : null
  if (!user) {
    ws.send('E:Authentication required')
    ws.close()
    return
  }

  if (!sessionId) {
    sessionId = uuidv4()
    prisma.tblSession.create({
      data: {
        sesID: sessionId,
        sesUserID: user.usrID,
        sesCreatedDateTime: new Date()
      }
    })
    ws.send(JSON.stringify({ setCookie: `sessionId=${sessionId}` }))
  }

  const state: ConnectionState = {
    sessionId,
    userId: user.usrID,
    lastMessageTime: Date.now(),
    messages: 0
  }
  connectionStates.set(ws, state)

  ws.on('message', async (message: Buffer) => {
    // Use the WebSocket rate limiting from security middleware
    if (!wsRateLimit(ws, req)) {
      return
    }

    try {
      const currentState = connectionStates.get(ws)
      if (!currentState) return

      // Update message tracking
      const now = Date.now()
      if (now - currentState.lastMessageTime < 1000) {
        currentState.messages++
        if (currentState.messages > 10) {
          ws.send('E:Too many messages')
          ws.close()
          return
        }
      } else {
        currentState.messages = 1
        currentState.lastMessageTime = now
      }

      const data = JSON.parse(message.toString())
      const { question, subject, chapter } = data

      if (!question || !subject || !chapter) {
        ws.send('E:Invalid request')
        return
      }

      const userData = await prisma.tblUser.findUnique({
        where: { usrID: currentState.userId },
        select: { usrQuestions: true }
      })

      if (!userData || userData.usrQuestions <= 0) {
        ws.send('E:خرید بسته')
        return
      }

      // Process chat message through avvalai
      const response = await avvalaiService.sendMessage(
        question,
        subject,
        chapter,
        currentState.userId
      )

      // Send response to client
      ws.send(`M:${response}`)

      // Update user's question count
      await prisma.tblUser.update({
        where: { usrID: currentState.userId },
        data: { usrQuestions: { decrement: 1 } }
      })

    } catch (error) {
      console.error('WebSocket error:', error)
      ws.send('E:Error processing message')
    }
  })

  ws.on('close', () => {
    connectionStates.delete(ws)
  })
})

async function generateConversationTitle(sessionId: string, conversation: { chtQuestion: string; chtResponse: string }[]): Promise<string> {
  const prompt = [
    'برای مکالمه زیر یک عنوان کوتاه (حداکثر ۵۰ کاراکتر) به فارسی رسمی بساز:',
    conversation.map(c => `User: ${c.chtQuestion}\nAssistant: ${c.chtResponse}`).join('\n')
  ].join('\n')

  try {
    const response = await axios.post(
      'https://api.x.ai/v1/chat/completions',
      {
        model: 'grok-3',
        messages: [
          { role: 'system', content: 'You are a title generator.' },
          { role: 'user', content: prompt }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROK_API_KEY}`
        }
      }
    )
    return response.data.choices[0]?.message?.content.slice(0, 50) || 'مکالمه بدون عنوان'
  } catch {
    return 'مکالمه بدون عنوان'
  }
}

app.use(cors())
app.use(express.json())
app.use(cookieParser())

// Swagger documentation
app.use('/', swaggerRouter)

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Phone number required
 */
app.post('/auth/login', async (req: Request, res: Response) => {
  const { phone } = req.body
  if (!phone) return res.status(400).json({ error: 'Phone number required' })

  let user = await prisma.tblUser.findUnique({ where: { usrPhone: phone } })
  if (!user) {
    user = await prisma.tblUser.create({
      data: {
        usrPhone: phone,
        usrName: '',
        usrGrade: 7,
        usrQuestions: 10,
        usrCreatedBy_usrID: 1
      }
    })
  }

  const token = jwt.sign({ usrID: user.usrID, usrPhone: phone }, JWT_SECRET, { expiresIn: '1d' })
  res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' })
  res.json({ message: 'Logged in successfully' })
})

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: User logout
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
app.post('/auth/logout', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  res.clearCookie('token')
  await prisma.tblActionLogs.create({
    data: {
      atlBy_usrID: req.user!.usrID,
      atlType: 'logout',
      atlDescription: { action: 'user logged out' }
    }
  })
  res.json({ message: 'Logged out successfully' })
})

/**
 * @openapi
 * /auth/verify:
 *   get:
 *     summary: Verify JWT token
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 */
app.get('/auth/verify', (req: Request, res: Response) => {
  res.json({ message: 'Token is valid' })
})

// User routes
/**
 * @openapi
 * /user/profile:
 *   get:
 *     summary: Get user profile
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *   patch:
 *     summary: Update user profile
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
app.get('/user/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const user = await prisma.tblUser.findUnique({
    where: { usrID: req.user!.usrID },
    select: { usrName: true, usrEmail: true, usrAvatar: true, usrGrade: true, usrQuestions: true }
  })
  res.json(user)
})

app.patch('/user/profile', (async (req: Request, res: Response) => {
  const { userId } = req.query
  const { name, email, avatar } = req.body
  
  try {
    const user = await prisma.tblUser.update({
      where: { usrID: Number(userId) },
      data: {
        usrName: name,
        usrEmail: email,
        usrAvatar: avatar
      }
    })
    
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}) as RequestHandler)

// Progress routes
/**
 * @openapi
 * /user/progress:
 *   get:
 *     summary: Get user progress
 *     tags:
 *       - Progress
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Progress retrieved successfully
 *   post:
 *     summary: Update user progress
 *     tags:
 *       - Progress
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject:
 *                 type: string
 *               chapter:
 *                 type: string
 *               completion:
 *                 type: number
 *               lastActivity:
 *                 type: string
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Progress updated successfully
 */
app.get('/user/progress', (async (req: Request, res: Response) => {
  const { userId } = req.query
  
  try {
    const progress = await prisma.tblProgress.findMany({
      where: { prgUserID: Number(userId) }
    })
    
    res.json(progress)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}) as RequestHandler)

app.post('/user/progress', (async (req: Request, res: Response) => {
  const { userId } = req.query
  const { subject, chapter, completion, lastActivity, data } = req.body
  
  try {
    const progress = await prisma.tblProgress.upsert({
      where: {
        prgUserID_prgSubject_prgChapter: {
          prgUserID: Number(userId),
          prgSubject: subject,
          prgChapter: chapter
        }
      },
      update: {
        prgCompletion: completion,
        prgLastActivity: lastActivity,
        prgData: data,
        prgUpdatedBy_usrID: Number(userId)
      },
      create: {
        prgUserID: Number(userId),
        prgSubject: subject,
        prgChapter: chapter,
        prgCompletion: completion,
        prgLastActivity: lastActivity,
        prgData: data,
        prgCreatedBy_usrID: Number(userId),
        prgUpdatedBy_usrID: Number(userId)
      }
    })
    
    res.json(progress)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}) as RequestHandler)

/**
 * @openapi
 * /chat:
 *   post:
 *     summary: Create chat
 *     tags:
 *       - Chat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *               subject:
 *                 type: string
 *               chapter:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chat created successfully
 *       403:
 *         description: No questions remaining
 *       404:
 *         description: User not found
 */
app.post('/chat', (async (req: Request, res: Response) => {
  const { userId } = req.query
  const { question, subject, chapter } = req.body
  
  try {
    const user = await prisma.tblUser.findUnique({
      where: { usrID: Number(userId) }
    })
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    if (user.usrQuestions <= 0) {
      return res.status(403).json({ error: 'No questions remaining' })
    }
    
    const sessionId = uuidv4()
    await prisma.tblSession.create({
      data: {
        sesID: sessionId,
        sesUserID: user.usrID,
        sesCreatedDateTime: new Date()
      }
    })

    const chat = await prisma.tblChat.create({
      data: {
        chtUserID: Number(userId),
        chtSessionID: sessionId,
        chtQuestion: question,
        chtSubject: subject,
        chtChapter: chapter,
        chtResponse: "این یک پاسخ موقت است. در نسخه نهایی، پاسخ‌ها توسط هوش مصنوعی گروک تولید خواهند شد.",
        chtCost: 1,
        chtCreatedBy_usrID: Number(userId)
      }
    })
    
    await prisma.tblUser.update({
      where: { usrID: Number(userId) },
      data: {
        usrQuestions: user.usrQuestions - 1
      }
    })
    
    res.json(chat)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}) as RequestHandler)

/**
 * @openapi
 * /chat/history:
 *   get:
 *     summary: Get chat history
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         schema:
 *           type: string
 *         required: true
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Chat history retrieved successfully
 */
app.get('/chat/history', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { sessionId } = req.query
  if (!sessionId) return res.status(400).json({ error: 'Session ID required' })

  const chats = await prisma.tblChat.findMany({
    where: { chtSessionID: sessionId as string, chtUserID: req.user!.usrID },
    orderBy: { chtCreatedDateTime: 'asc' }
  })
  res.json(chats)
})

// Content routes
/**
 * @openapi
 * /content/{subject}/{chapter}/{type}:
 *   get:
 *     summary: Get content
 *     tags:
 *       - Content
 *     parameters:
 *       - in: path
 *         name: subject
 *         schema:
 *           type: string
 *         required: true
 *       - in: path
 *         name: chapter
 *         schema:
 *           type: string
 *         required: true
 *       - in: path
 *         name: type
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Content retrieved successfully
 *       404:
 *         description: Content not found
 */
app.get('/content/:subject/:chapter/:type', (async (req: Request, res: Response) => {
  const { subject, chapter, type } = req.params
  
  try {
    const content = await prisma.tblContent.findUnique({
      where: {
        cntSubject_cntChapter_cntType: {
          cntSubject: subject,
          cntChapter: chapter,
          cntType: type
        }
      }
    })
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' })
    }
    
    res.json(content)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}) as RequestHandler)

// Account routes
/**
 * @openapi
 * /account:
 *   get:
 *     summary: Get account details
 *     tags:
 *       - Account
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account details retrieved successfully
 *       404:
 *         description: Account not found
 */
app.get('/account', (async (req: Request, res: Response) => {
  const { userId } = req.query
  
  try {
    const account = await prisma.tblAccount.findFirst({
      where: { accUserID: Number(userId) }
    })
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' })
    }
    
    res.json(account)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}) as RequestHandler)

/**
 * @openapi
 * /account/invoice:
 *   post:
 *     summary: Create invoice
 *     tags:
 *       - Account
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               package:
 *                 type: string
 *               questions:
 *                 type: integer
 *               price:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Invoice created successfully
 */
app.post('/account/invoice', (async (req: Request, res: Response) => {
  const { userId } = req.query
  const { package: pkg, questions, price } = req.body
  
  try {
    const account = await prisma.tblAccount.findFirst({
      where: { accUserID: Number(userId) }
    })
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' })
    }
    
    const invoice = await prisma.tblInvoice.create({
      data: {
        invAccountID: account.accID,
        invPackage: pkg,
        invQuestions: questions,
        invPrice: price,
        invStatus: 'pending',
        invCreatedBy_usrID: Number(userId),
        invUpdatedBy_usrID: Number(userId)
      }
    })
    
    res.json(invoice)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}) as RequestHandler)

/**
 * @openapi
 * /account/payment:
 *   post:
 *     summary: Process payment
 *     tags:
 *       - Account
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               invoiceId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Payment processed successfully
 */
app.post('/account/payment', (async (req: Request, res: Response) => {
  const { userId } = req.query
  const { invoiceId } = req.body
  
  try {
    const invoice = await prisma.tblInvoice.findUnique({
      where: { invID: invoiceId }
    })
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' })
    }
    
    const account = await prisma.tblAccount.findUnique({
      where: { accID: invoice.invAccountID }
    })
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' })
    }
    
    if (account.accUserID !== Number(userId)) {
      return res.status(403).json({ error: 'Unauthorized' })
    }
    
    await prisma.$transaction([
      prisma.tblInvoice.update({
        where: { invID: invoiceId },
        data: { invStatus: 'paid' }
      }),
      prisma.tblAccount.update({
        where: { accID: invoice.invAccountID },
        data: {
          accBalance: account.accBalance + invoice.invQuestions,
          accTotalSpent: account.accTotalSpent + invoice.invPrice
        }
      }),
      prisma.tblUser.update({
        where: { usrID: Number(userId) },
        data: {
          usrQuestions: { increment: invoice.invQuestions }
        }
      })
    ])
    
    res.json({ message: 'Payment processed successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}) as RequestHandler)

// Guest routes
/**
 * @openapi
 * /guest/activity:
 *   post:
 *     summary: Log guest activity
 *     tags:
 *       - Guest
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               page:
 *                 type: string
 *               action:
 *                 type: string
 *     responses:
 *       200:
 *         description: Activity logged successfully
 */
app.post('/guest/activity', (async (req: Request, res: Response) => {
  const { page, action } = req.body
  
  try {
    await prisma.tblActionLogs.create({
      data: {
        atlBy_usrID: 1,
        atlType: 'guest_activity',
        atlDescription: {
          page,
          action
        }
      }
    })
    
    res.json({ message: 'Activity logged successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}) as RequestHandler)

// Admin routes
/**
 * @openapi
 * /admin/users:
 *   get:
 *     summary: List users (admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     description: Requires admin role (usrGrade = 0)
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
app.get('/admin/users', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const users = await prisma.tblUser.findMany({
    select: { usrID: true, usrName: true, usrPhone: true, usrGrade: true, usrQuestions: true }
  })
  res.json(users)
})

/**
 * @openapi
 * /admin/accounts:
 *   get:
 *     summary: List accounts (admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     description: Requires admin role (usrGrade = 0)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *     responses:
 *       200:
 *         description: Accounts retrieved successfully
 */
app.get('/admin/accounts', (async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query
  
  try {
    const accounts = await prisma.tblAccount.findMany({
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { accCreatedDateTime: 'desc' }
    })
    
    res.json(accounts)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}) as RequestHandler)

/**
 * @openapi
 * /admin/account/{accID}:
 *   patch:
 *     summary: Update account balance (admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     description: Requires admin role (usrGrade = 0)
 *     parameters:
 *       - in: path
 *         name: accID
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               balanceChange:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Account updated successfully
 */
app.patch('/admin/account/:accID', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { accID } = req.params
  const { balanceChange } = req.body
  const account = await prisma.tblAccount.update({
    where: { accID: parseInt(accID) },
    data: { accBalance: { increment: parseInt(balanceChange) } }
  })
  await prisma.tblUser.update({
    where: { usrID: account.accUserID },
    data: { usrQuestions: { increment: parseInt(balanceChange) }, usrUpdatedBy_usrID: req.user!.usrID }
  })
  res.json(account)
})

/**
 * @openapi
 * /admin/chats:
 *   get:
 *     summary: List chats (admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     description: Requires admin role (usrGrade = 0)
 *     parameters:
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         required: false
 *     responses:
 *       200:
 *         description: Chats retrieved successfully
 */
app.get('/admin/chats', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { subject, userId } = req.query
  const chats = await prisma.tblChat.findMany({
    where: {
      chtSubject: subject as string,
      chtUserID: userId ? parseInt(userId as string) : undefined
    },
    orderBy: { chtCreatedDateTime: 'desc' },
    include: { user: { select: { usrName: true } } }
  })
  res.json(chats)
})

/**
 * @openapi
 * /admin/stats:
 *   get:
 *     summary: Get site statistics (admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     description: Requires admin role (usrGrade = 0)
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
app.get('/admin/stats', (async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      totalAccounts,
      totalChats,
      totalInvoices,
      totalRevenue
    ] = await Promise.all([
      prisma.tblUser.count(),
      prisma.tblAccount.count(),
      prisma.tblChat.count(),
      prisma.tblInvoice.count(),
      prisma.tblInvoice.aggregate({
        where: { invStatus: 'paid' },
        _sum: { invPrice: true }
      })
    ])
    
    res.json({
      totalUsers,
      totalAccounts,
      totalChats,
      totalInvoices,
      totalRevenue: totalRevenue._sum.invPrice || 0
    })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}) as RequestHandler)

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
}) 