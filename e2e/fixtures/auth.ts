import { test as base, expect } from '@playwright/test'

/**
 * Auth fixture - provides login helper and authenticated page
 */
export const test = base.extend<{
  login: (email: string, password: string) => Promise<void>
}>({
  login: async ({ page }, use) => {
    const loginFn = async (email: string, password: string) => {
      await page.goto('/login')
      await page.fill('input[type="email"]', email)
      await page.fill('input[type="password"]', password)
      await page.click('button[type="submit"]')
      await page.waitForURL('/products')
    }
    await use(loginFn)
  },
})

export { expect }
