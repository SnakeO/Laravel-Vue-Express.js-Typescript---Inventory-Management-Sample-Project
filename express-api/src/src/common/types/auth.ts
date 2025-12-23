/**
 * TypeScript interfaces for authentication
 */
import type { Request } from 'express'

export interface User {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface AccessTokenPayload {
  sub: number
  email: string
  name: string
}

export interface RefreshTokenPayload {
  sub: number
  jti: string
}

export interface RefreshTokenData {
  userId: number
  email: string
  name: string
  createdAt: string
  userAgent?: string
  ip?: string
}

export interface AuthenticatedRequest extends Request {
  user: AccessTokenPayload
}
