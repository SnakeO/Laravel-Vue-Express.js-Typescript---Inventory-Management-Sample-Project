/**
 * Joi validation middleware - validates request body, query, or params
 *
 * Usage:
 *   router.post('/products', validateRequest(createProductSchema), handler)
 *   router.get('/products', validateRequest(querySchema, 'query'), handler)
 */
import type { Request, Response, NextFunction } from 'express'
import type { Schema } from 'joi'

// Which part of the request to validate
type RequestPart = 'body' | 'query' | 'params'

/**
 * Creates an Express middleware that validates a request part against a Joi schema.
 *
 * @param schema - Joi schema to validate against
 * @param part - Which part of the request to validate ('body', 'query', or 'params')
 * @returns Express middleware function
 */
export const validateRequest = (schema: Schema, part: RequestPart = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Validate the request part against the schema
    // - abortEarly: collect ALL errors, not just the first
    // - stripUnknown: remove fields not defined in schema
    const { error, value } = schema.validate(req[part], {
      abortEarly: false,
      stripUnknown: true,
    })

    // If validation failed, return 400 with detailed error info
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

    // Replace request data with validated/sanitized value
    // Note: req.query and req.params are read-only getters in Express,
    // so we must mutate the existing object rather than reassign
    if (part === 'body') {
      req.body = value
    } else {
      Object.keys(req[part]).forEach((key) => delete req[part][key])
      Object.assign(req[part], value)
    }

    next()
  }
}
