/**
 * Joi validation schemas for order endpoints
 */
import Joi from 'joi'

export const createOrderSchema = Joi.object({
  product_id: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().min(1).required(),
})
