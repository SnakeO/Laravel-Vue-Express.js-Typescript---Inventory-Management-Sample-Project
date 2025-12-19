/**
 * Joi validation schemas for product endpoints
 */
import Joi from 'joi'

export const createProductSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().allow(null, '').optional(),
  category: Joi.string().min(1).max(100).required(),
  price: Joi.number().positive().precision(2).required(),
  cost: Joi.number().positive().precision(2).required(),
  quantity: Joi.number().integer().min(0).required(),
})

export const updateProductSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  description: Joi.string().allow(null, '').optional(),
  category: Joi.string().min(1).max(100).optional(),
  price: Joi.number().positive().precision(2).optional(),
  cost: Joi.number().positive().precision(2).optional(),
  quantity: Joi.number().integer().min(0).optional(),
}).min(1)

export const productFiltersSchema = Joi.object({
  category: Joi.string().max(100).optional(),
  name: Joi.string().max(255).optional(),
})
