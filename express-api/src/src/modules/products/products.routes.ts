/**
 * Products routes - GET/POST/PUT/DELETE /products
 */
import { Router } from 'express'
import * as controller from './products.controller.js'
import { validateRequest } from '#common/middleware/validateRequest.js'
import { authenticate } from '#common/middleware/authenticate.js'
import {
  createProductSchema,
  updateProductSchema,
  productFiltersSchema,
} from './products.validation.js'

export const routes = Router()

// Public routes
routes.get('/', validateRequest(productFiltersSchema, 'query'), controller.list)
routes.get('/:id', controller.show)

// Protected routes
routes.post('/', authenticate, validateRequest(createProductSchema), controller.create)
routes.put('/:id', authenticate, validateRequest(updateProductSchema), controller.update)
routes.delete('/:id', authenticate, controller.destroy)
