import AxeBuilder from '@axe-core/playwright'
import {expect, test} from '@playwright/test'

test.describe('smoke', () => {
  test('home renders brand chrome and main landmark', async ({page}) => {
    await page.goto('/')
    await expect(page.locator('a.skip-link')).toBeAttached()
    await expect(page.locator('#main-content')).toBeVisible()
    await expect(page.getByRole('banner')).toBeVisible()
    await expect(page.getByRole('contentinfo')).toBeVisible()
    await expect(page.locator('img[alt*="JS One"], [aria-label*="JS One"]').first()).toBeVisible()
  })

  test('solutions page loads', async ({page}) => {
    await page.goto('/solutions/')
    await expect(page.locator('#main-content')).toBeVisible()
    await expect(page).toHaveTitle(/solution|JS One/i)
  })

  test('contact page exposes the form', async ({page}) => {
    await page.goto('/contact/?email=test%40example.com')
    await expect(page.locator('[data-contact-form]')).toBeVisible()
    await expect(page.locator('[data-contact-form] input[name="name"]')).toBeVisible()
    await expect(page.locator('[data-contact-form] input[name="email"]')).toHaveValue(
      'test@example.com',
    )
    await expect(page.locator('[data-contact-form] textarea[name="message"]')).toBeVisible()
    await expect(page.locator('#contact-name-error')).toBeAttached()
  })
})

test.describe('a11y', () => {
  for (const path of ['/', '/solutions/', '/contact/'] as const) {
    test(`${path} has no critical/serious axe violations`, async ({page}) => {
      await page.goto(path)
      const results = await new AxeBuilder({page})
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      const serious = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
      )

      expect(
        serious,
        serious.map((v) => `${v.id}: ${v.help}`).join('\n') || 'axe clean',
      ).toEqual([])
    })
  }
})
