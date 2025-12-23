/**
 * Auth module types
 */
export interface LoginRequest {
  email: string
  password: string
}

export interface RefreshRequest {
  refreshToken: string
}

export interface LoginResponse {
  user: {
    id: number
    name: string
    email: string
  }
  tokens: {
    accessToken: string
    refreshToken: string
    expiresIn: number
  }
}

export interface RefreshResponse {
  accessToken: string
  expiresIn: number
}
