/**
 * Joi validation middleware - validates request body, query, or params
 */
import type { Request, Response, NextFunction } from 'express'
import type { Schema } from 'joi'

type RequestPart = 'body' | 'query' | 'params'

export const validateRequest = (schema: Schema, part: RequestPart = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[part], {
      abortEarly: false,
      stripUnknown: true,
    })

    if (error) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Request validation failed',
        details: error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      })
      return
    }

    req[part] = value
    next()
  }
}
