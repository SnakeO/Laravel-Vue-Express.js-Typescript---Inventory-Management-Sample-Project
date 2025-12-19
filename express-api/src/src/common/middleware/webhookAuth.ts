/**
 * Webhook authentication middleware - validates shared secret header
 */
import type { Request, Response, NextFunction } from 'express'
import { webhookConfig } from '#config/index.js'

export const webhookAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const secret = req.headers['x-webhook-secret']

  if (secret !== webhookConfig.secret) {
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid webhook secret' })
    return
  }

  next()
}
