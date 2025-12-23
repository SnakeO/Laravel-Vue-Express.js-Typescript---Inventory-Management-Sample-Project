/**
 * Orders routes - GET/POST/DELETE /orders
 */
import { Router } from 'express'
import * as controller from './orders.controller.js'
import { validateRequest } from '#common/middleware/validateRequest.js'
import { authenticate } from '#common/middleware/authenticate.js'
import { createOrderSchema, orderFiltersSchema } from './orders.validation.js'

export const routes = Router()

// Public routes
routes.get('/', validateRequest(orderFiltersSchema, 'query'), controller.list)
routes.get('/:id', controller.show)

// Protected routes
routes.post('/', authenticate, validateRequest(createOrderSchema), controller.create)
routes.delete('/:id', authenticate, controller.destroy)
