/**
 * Express API Gateway - Main entry point
 * Proxies requests to Laravel backend, caches product data in Redis
 */
import express, { type Express } from 'express'
import cors from 'cors'
import { appConfig } from './config/index.js'
import { routes as productRoutes } from './modules/products/index.js'
import { routes as orderRoutes } from './modules/orders/index.js'
import { routes as webhookRoutes } from './modules/cache/index.js'
import { errorHandler } from './common/middleware/errorHandler.js'

const app: Express = express()

// Middleware
app.use(express.json())
app.use(cors())

// Health check
app.get('/', (_req, res) => {
  res.json({
    message: 'Express API Gateway is running!',
    timestamp: new Date().toISOString(),
    environment: appConfig.env,
  })
})

app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
  })
})

// Mount routes
app.use('/products', productRoutes)
app.use('/orders', orderRoutes)
app.use('/webhooks', webhookRoutes)

// Error handling middleware
app.use(errorHandler)

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'Route not found',
  })
})

// Start server
const startServer = (): void => {
  app.listen(appConfig.port, () => {
    console.log(`Express API Gateway running on port ${appConfig.port}`)
    console.log(`Environment: ${appConfig.env}`)
  })
}

startServer()

export default app
