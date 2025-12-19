/**
 * Orders routes - GET/POST/DELETE /orders
 */
import { Router } from 'express'
import * as controller from './orders.controller.js'
import { validateRequest } from '#common/middleware/validateRequest.js'
import { createOrderSchema } from './orders.validation.js'

export const routes = Router()

routes.get('/', controller.list)
routes.get('/:id', controller.show)
routes.post('/', validateRequest(createOrderSchema), controller.create)
routes.delete('/:id', controller.destroy)
