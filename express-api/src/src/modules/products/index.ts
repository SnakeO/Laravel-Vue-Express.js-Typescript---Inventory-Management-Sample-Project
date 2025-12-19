export { routes } from './products.routes.js'
export type { Product, ProductWithoutCost, ProductFilters } from './products.types.js'
export { stripCost, stripCostFromList } from './products.types.js'
export { invalidateAllProductCache } from './products.service.js'
