/**
 * Auth service - handles login, refresh, logout, and token management
 */
import { v4 as uuidv4 } from 'uuid'
import { redis } from '#common/services/redis.js'
import { laravelClient } from '#common/services/laravel.js'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '#common/services/jwt.js'
import { authConfig } from '#config/index.js'
import type { User, RefreshTokenData, AuthTokens } from '#common/types/auth.js'
import type { LoginRequest, LoginResponse, RefreshResponse } from './auth.types.js'

const REFRESH_PREFIX = authConfig.redis.refreshTokenPrefix
const REFRESH_TTL = authConfig.redis.refreshTokenTtl

const buildRefreshKey = (userId: number, jti: string): string => {
  return `${REFRESH_PREFIX}${userId}:${jti}`
}

const parseExpiration = (exp: string): number => {
  const match = exp.match(/^(\d+)([smhd])$/)
  if (!match) return 900

  const value = parseInt(match[1], 10)
  const unit = match[2]

  switch (unit) {
    case 's': return value
    case 'm': return value * 60
    case 'h': return value * 60 * 60
    case 'd': return value * 60 * 60 * 24
    default: return 900
  }
}

const createTokens = async (
  user: User,
  metadata: { userAgent?: string; ip?: string }
): Promise<AuthTokens> => {
  const jti = uuidv4()

  const accessToken = generateAccessToken({
    sub: user.id,
    email: user.email,
    name: user.name,
  })

  const refreshToken = generateRefreshToken({
    sub: user.id,
    jti,
  })

  const refreshData: RefreshTokenData = {
    userId: user.id,
    email: user.email,
    name: user.name,
    createdAt: new Date().toISOString(),
    userAgent: metadata.userAgent,
    ip: metadata.ip,
  }

  const key = buildRefreshKey(user.id, jti)
  await redis.set(key, JSON.stringify(refreshData), 'EX', REFRESH_TTL)

  const expiresIn = parseExpiration(authConfig.jwt.accessExpiresIn)

  return { accessToken, refreshToken, expiresIn }
}

export const login = async (
  credentials: LoginRequest,
  metadata: { userAgent?: string; ip?: string }
): Promise<LoginResponse> => {
  const response = await laravelClient.post<{ data: User }>('/auth/validate', {
    email: credentials.email,
    password: credentials.password,
  })

  const user = response.data.data
  const tokens = await createTokens(user, metadata)

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    tokens,
  }
}

export const refresh = async (refreshToken: string): Promise<RefreshResponse> => {
  const payload = verifyRefreshToken(refreshToken)
  const key = buildRefreshKey(payload.sub, payload.jti)
  const storedData = await redis.get(key)

  if (!storedData) {
    throw new Error('Refresh token has been revoked or expired')
  }

  const refreshData: RefreshTokenData = JSON.parse(storedData)

  const accessToken = generateAccessToken({
    sub: refreshData.userId,
    email: refreshData.email,
    name: refreshData.name,
  })

  const expiresIn = parseExpiration(authConfig.jwt.accessExpiresIn)

  return { accessToken, expiresIn }
}

export const logout = async (refreshToken: string): Promise<void> => {
  const payload = verifyRefreshToken(refreshToken)
  const key = buildRefreshKey(payload.sub, payload.jti)
  await redis.del(key)
}

export const logoutAll = async (userId: number): Promise<number> => {
  const pattern = `${REFRESH_PREFIX}${userId}:*`
  const keys = await redis.keys(pattern)

  if (keys.length > 0) {
    await redis.del(...keys)
  }

  return keys.length
}
