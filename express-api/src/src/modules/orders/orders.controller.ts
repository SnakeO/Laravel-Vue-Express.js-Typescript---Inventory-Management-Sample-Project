/**
 * Orders controller - HTTP request handlers for order endpoints
 */
import type { Request, Response, NextFunction } from 'express'
import * as orderService from './orders.service.js'

export const list = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orders = await orderService.getOrders()

    res.json({ data: orders })
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
