import express from 'express'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'

const router = express.Router()

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Targoman Education API',
      version: '1.0.0',
      description: 'API documentation for Targoman Education platform'
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/server.ts']
})

// Fix: Use type assertions with unknown as intermediate type
router.use('/api-docs', swaggerUi.serve as unknown as express.RequestHandler)
router.get('/api-docs', swaggerUi.setup(swaggerSpec) as unknown as express.RequestHandler)

export default router 