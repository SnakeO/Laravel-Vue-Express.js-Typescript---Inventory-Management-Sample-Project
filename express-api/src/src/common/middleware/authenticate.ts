/**
 * JWT authentication middleware - validates access tokens from Authorization header
 */
import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '#common/types/auth.js'
import { verifyAccessToken } from '#common/services/jwt.js'
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'No authorization header provided',
    })
    return
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid authorization header format. Use: Bearer <token>',
    })
    return
  }

  const token = parts[1]

  try {
    const payload = verifyAccessToken(token)
    req.user = payload
    next()
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Access token has expired',
        code: 'TOKEN_EXPIRED',
      })
      return
    }

    if (error instanceof JsonWebTokenError) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid access token',
        code: 'INVALID_TOKEN',
      })
      return
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Token verification failed',
    })
  }
}
