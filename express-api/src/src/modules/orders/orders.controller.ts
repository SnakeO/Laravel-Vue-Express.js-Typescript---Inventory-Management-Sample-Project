/**
 * Orders controller - HTTP request handlers for order endpoints
 */
import type { Request, Response, NextFunction } from 'express'
import * as orderService from './orders.service.js'
import type { OrderFilters } from './orders.types.js'

export const list = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters: OrderFilters = {
      page: req.query.page ? Number(req.query.page) : undefined,
      per_page: req.query.per_page ? Number(req.query.per_page) : undefined,
    }

    const result = await orderService.getOrders(filters)

    res.json(result)
  } catch (error) {
    next(error)
  }
}

export const show = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10)
    const order = await orderService.getOrder(id)

    res.json({ data: order })
  } catch (error) {
    next(error)
  }
}

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await orderService.createOrder(req.body)

    res.status(201).json({ data: order })
  } catch (error) {
    next(error)
  }
}

export const destroy = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10)
    await orderService.deleteOrder(id)

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
