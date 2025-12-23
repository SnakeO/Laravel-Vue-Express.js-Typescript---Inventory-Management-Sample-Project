/**
 * Auth controller - HTTP request handlers for auth endpoints
 */
import type { Request, Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '#common/types/auth.js'
import * as authService from './auth.service.js'

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.login(req.body, {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    })

    res.json({ data: result })
  } catch (error) {
    next(error)
  }
}

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body
    const result = await authService.refresh(refreshToken)

    res.json({ data: result })
  } catch (error) {
    next(error)
  }
}

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body

    if (refreshToken) {
      await authService.logout(refreshToken)
    }

    res.json({ message: 'Logged out successfully' })
  } catch (error) {
    next(error)
  }
}

export const logoutAll = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const count = await authService.logoutAll(req.user.sub)

    res.json({
      message: 'All sessions logged out',
      sessionsRevoked: count,
    })
  } catch (error) {
    next(error)
  }
}

export const me = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  res.json({
    data: {
      id: req.user.sub,
      email: req.user.email,
      name: req.user.name,
    },
  })
}
