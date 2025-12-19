/**
 * Cache routes - POST /webhooks/cache/invalidate
 */
import { Router } from 'express'
import { invalidateProductCache } from './cache.controller.js'
import { webhookAuth } from '#common/middleware/webhookAuth.js'

const router = Router()

router.post('/cache/invalidate', webhookAuth, invalidateProductCache)

export { router as routes }
