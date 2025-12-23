import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('should display login form', async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should show error on invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Should show error message (snackbar)
    await expect(page.locator('.v-snackbar')).toBeVisible({ timeout: 5000 })
  })

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'jakechapa@gmail.com')
    await page.fill('input[type="password"]', '1amjake')
    await page.click('button[type="submit"]')

    // Should redirect to products page
    await expect(page).toHaveURL('/products', { timeout: 10000 })
  })

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.fill('input[type="email"]', 'jakechapa@gmail.com')
    await page.fill('input[type="password"]', '1amjake')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/products', { timeout: 10000 })

    // Click logout button in navigation
    await page.click('[data-testid="logout-btn"], button:has-text("Logout")')

    // Should redirect to login
    await expect(page).toHaveURL('/login', { timeout: 5000 })
  })

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access protected page directly
    await page.goto('/products')

    // Should redirect to login
    await expect(page).toHaveURL('/login', { timeout: 5000 })
  })
})
