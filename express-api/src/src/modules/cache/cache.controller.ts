/**
 * Cache controller - webhook endpoint for Laravel to trigger cache invalidation
 */
import type { Request, Response, NextFunction } from 'express'
import { invalidateAllProductCache } from '#modules/products/index.js'

export const invalidateProductCache = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await invalidateAllProductCache()
    res.status(200).json({ message: 'Product cache invalidated' })
  } catch (error) {
    next(error)
  }
}
