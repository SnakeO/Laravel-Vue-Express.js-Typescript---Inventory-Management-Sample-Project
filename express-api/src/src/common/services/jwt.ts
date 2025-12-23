/**
 * JWT utility service for token generation and verification
 */
import jwt from 'jsonwebtoken'
import { authConfig } from '#config/index.js'
import type { AccessTokenPayload, RefreshTokenPayload } from '#common/types/auth.js'

export const generateAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, authConfig.jwt.accessSecret, {
    expiresIn: authConfig.jwt.accessExpiresIn,
  })
}

export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  const { jti, ...rest } = payload
  return jwt.sign(rest, authConfig.jwt.refreshSecret, {
    expiresIn: authConfig.jwt.refreshExpiresIn,
    jwtid: jti,
  })
}

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, authConfig.jwt.accessSecret) as AccessTokenPayload
}

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, authConfig.jwt.refreshSecret) as RefreshTokenPayload
}
