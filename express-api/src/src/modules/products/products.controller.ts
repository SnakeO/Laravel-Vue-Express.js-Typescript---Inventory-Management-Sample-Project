/**
 * Products controller - HTTP request handlers for product endpoints
 */
import type { Request, Response, NextFunction } from 'express'
import * as productService from './products.service.js'
import type { ProductFilters } from './products.types.js'

export const list = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters: ProductFilters = {
      category: req.query.category as string | undefined,
      name: req.query.name as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      per_page: req.query.per_page ? Number(req.query.per_page) : undefined,
    }

    const result = await productService.getProducts(filters)

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
    const product = await productService.getProduct(id)

    res.json({ data: product })
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
    const product = await productService.createProduct(req.body)

    res.status(201).json({ data: product })
  } catch (error) {
    next(error)
  }
}

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10)
    const product = await productService.updateProduct(id, req.body)

    res.json({ data: product })
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
    await productService.deleteProduct(id)

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
