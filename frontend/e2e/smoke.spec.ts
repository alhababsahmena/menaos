import { expect, test } from '@playwright/test'

test('home renders MENAOS heading', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'MENAOS' })).toBeVisible()
})
