/**
 * Cache routes - POST /webhooks/cache/invalidate
 */
import { Router } from 'express'
import { invalidateProductCache } from './cache.controller.js'

const router = Router()

router.post('/cache/invalidate', invalidateProductCache)

export { router as routes }
