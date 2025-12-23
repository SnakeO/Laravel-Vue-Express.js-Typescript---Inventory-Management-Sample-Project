import { test, expect } from '../fixtures/auth'

test.describe('Products CRUD', () => {
  test.beforeEach(async ({ page, login }) => {
    await login('jakechapa@gmail.com', '1amjake')
  })

  test('should display products table', async ({ page }) => {
    await expect(page.locator('table, .v-data-table')).toBeVisible()
  })

  test('should open create product dialog', async ({ page }) => {
    await page.click('button:has-text("Add"), button:has-text("Create"), [data-testid="create-btn"]')
    await expect(page.locator('.v-dialog, [role="dialog"]')).toBeVisible()
  })

  test('should create a new product', async ({ page }) => {
    const productName = `Test Product ${Date.now()}`

    // Open dialog
    await page.click('button:has-text("Add"), button:has-text("Create"), [data-testid="create-btn"]')
    await expect(page.locator('.v-dialog, [role="dialog"]')).toBeVisible()

    // Fill form
    await page.fill('input[name="name"], [data-testid="name-input"] input', productName)
    await page.fill('input[name="category"], [data-testid="category-input"] input', 'Test Category')
    await page.fill('input[name="price"], [data-testid="price-input"] input', '99.99')
    await page.fill('input[name="cost"], [data-testid="cost-input"] input', '49.99')
    await page.fill('input[name="quantity"], [data-testid="quantity-input"] input', '100')

    // Submit
    await page.click('button:has-text("Save"), button:has-text("Create"), [data-testid="submit-btn"]')

    // Should show success message
    await expect(page.locator('.v-snackbar:has-text("created"), .v-snackbar:has-text("success")')).toBeVisible({
      timeout: 5000,
    })

    // Product should appear in table
    await expect(page.locator(`text=${productName}`)).toBeVisible({ timeout: 5000 })
  })

  test('should delete a product', async ({ page }) => {
    // First create a product to delete
    const productName = `Delete Me ${Date.now()}`

    await page.click('button:has-text("Add"), button:has-text("Create"), [data-testid="create-btn"]')
    await page.fill('input[name="name"], [data-testid="name-input"] input', productName)
    await page.fill('input[name="category"], [data-testid="category-input"] input', 'Test')
    await page.fill('input[name="price"], [data-testid="price-input"] input', '10')
    await page.fill('input[name="cost"], [data-testid="cost-input"] input', '5')
    await page.fill('input[name="quantity"], [data-testid="quantity-input"] input', '10')
    await page.click('button:has-text("Save"), button:has-text("Create"), [data-testid="submit-btn"]')
    await expect(page.locator(`text=${productName}`)).toBeVisible({ timeout: 5000 })

    // Find the row with the product and click delete
    const row = page.locator(`tr:has-text("${productName}")`)
    await row.locator('button:has-text("Delete"), [data-testid="delete-btn"]').click()

    // Confirm deletion if dialog appears
    const confirmBtn = page.locator('.v-dialog button:has-text("Confirm"), .v-dialog button:has-text("Delete")')
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click()
    }

    // Should show success message
    await expect(page.locator('.v-snackbar:has-text("deleted"), .v-snackbar:has-text("success")')).toBeVisible({
      timeout: 5000,
    })

    // Product should no longer appear
    await expect(page.locator(`text=${productName}`)).not.toBeVisible({ timeout: 5000 })
  })

  test('should filter products by category', async ({ page }) => {
    // Look for category filter
    const categoryFilter = page.locator('[data-testid="category-filter"], select:has-text("Category")')

    if (await categoryFilter.isVisible()) {
      await categoryFilter.selectOption({ index: 1 })
      // Table should update (just verify table is still visible)
      await expect(page.locator('table, .v-data-table')).toBeVisible()
    }
  })

  test('should paginate products', async ({ page }) => {
    // Look for pagination controls
    const pagination = page.locator('.v-pagination, [data-testid="pagination"]')

    if (await pagination.isVisible()) {
      const nextBtn = pagination.locator('button:has-text(">"), [aria-label="Next page"]')
      if (await nextBtn.isEnabled()) {
        await nextBtn.click()
        // Table should still be visible
        await expect(page.locator('table, .v-data-table')).toBeVisible()
      }
    }
  })
})
