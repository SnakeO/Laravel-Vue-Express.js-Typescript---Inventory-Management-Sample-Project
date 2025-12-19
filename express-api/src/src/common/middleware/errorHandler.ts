/**
 * Global error handler - formats Joi validation errors, Axios errors, and generic errors
 */
import type { Request, Response, NextFunction } from 'express'
import { AxiosError } from 'axios'
import Joi from 'joi'

interface ErrorResponse {
  error: string
  message: string
  details?: unknown
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err.message)

  // Joi validation error
  if (err instanceof Joi.ValidationError) {
    res.status(400).json({
      error: 'Validation Error',
      message: err.details[0]?.message || 'Invalid request data',
      details: err.details,
    } satisfies ErrorResponse)
    return
  }

  // Axios error from Laravel
  if (err instanceof AxiosError) {
    const status = err.response?.status || 500
    const data = err.response?.data as Record<string, unknown> | undefined

    res.status(status).json({
      error: 'API Error',
      message: data?.message as string || err.message,
      details: data?.errors,
    } satisfies ErrorResponse)
    return
  }

  // Generic error
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong',
  } satisfies ErrorResponse)
}
