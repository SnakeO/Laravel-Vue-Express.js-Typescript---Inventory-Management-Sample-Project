/**
 * Auth routes - /auth/*
 */
import { Router } from 'express'
import * as controller from './auth.controller.js'
import { validateRequest } from '#common/middleware/validateRequest.js'
import { authenticate } from '#common/middleware/authenticate.js'
import { loginSchema, refreshSchema, logoutSchema } from './auth.validation.js'

export const routes = Router()

// Public routes
routes.post('/login', validateRequest(loginSchema), controller.login)
routes.post('/refresh', validateRequest(refreshSchema), controller.refresh)
routes.post('/logout', validateRequest(logoutSchema), controller.logout)

// Protected routes
routes.get('/me', authenticate, controller.me)
routes.post('/logout-all', authenticate, controller.logoutAll)
