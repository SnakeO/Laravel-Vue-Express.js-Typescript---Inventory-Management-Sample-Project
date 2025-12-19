/**
 * Products routes - GET/POST/PUT/DELETE /products
 */
import { Router } from 'express'
import * as controller from './products.controller.js'
import { validateRequest } from '#common/middleware/validateRequest.js'
import {
  createProductSchema,
  updateProductSchema,
  productFiltersSchema,
} from './products.validation.js'

export const routes = Router()

routes.get('/', validateRequest(productFiltersSchema, 'query'), controller.list)
routes.get('/:id', controller.show)
routes.post('/', validateRequest(createProductSchema), controller.create)
routes.put('/:id', validateRequest(updateProductSchema), controller.update)
routes.delete('/:id', controller.destroy)
