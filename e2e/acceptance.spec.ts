import AxeBuilder from '@axe-core/playwright'
import {expect, test} from '@playwright/test'

test.describe('prefs & mobile CTA', () => {
  test('theme toggle changes appearance in one click from system', async ({page}) => {
    await page.goto('/')
    const toggle = page.locator('[data-theme-toggle]').first()
    await expect(toggle).toBeVisible()

    await page.evaluate(() => localStorage.setItem('jsone-theme', 'system'))
    await page.emulateMedia({colorScheme: 'light'})
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme-pref', 'system')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

    // Skip redundant system→light; go straight to dark
    await toggle.click()
    await expect(page.locator('html')).toHaveAttribute('data-theme-pref', 'dark')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    await toggle.click()
    await expect(page.locator('html')).toHaveAttribute('data-theme-pref', 'system')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  })

  test('font scale toggles to large', async ({page}) => {
    await page.goto('/')
    await page.locator('[data-font-size-toggle] [data-font-size="lg"]').first().click()
    await expect(page.locator('html')).toHaveAttribute('data-font-scale', 'lg')
  })

  test('mobile CTA bar is visible on small viewports', async ({page}) => {
    await page.setViewportSize({width: 390, height: 844})
    await page.goto('/')
    const bar = page.locator('[data-mobile-cta]')
    await expect(bar).toBeVisible()
    await expect(bar.getByRole('link', {name: /call/i})).toBeVisible()
    await expect(bar.getByRole('link', {name: /whatsapp/i})).toBeVisible()
    await expect(bar.getByRole('link', {name: /contact/i})).toBeVisible()
  })
})

test.describe('static pages & empty states', () => {
  test('404 page offers a home link', async ({page}) => {
    // Astro preview serves the dedicated 404 document at /404.html
    await page.goto('/404.html')
    await expect(page.locator('#main-content')).toBeVisible()
    await expect(page.getByRole('heading', {level: 1})).toBeVisible()
    await expect(page.getByRole('link', {name: /back to home/i})).toBeVisible()
  })

  test('privacy and terms pages load', async ({page}) => {
    await page.goto('/privacy/')
    await expect(page.locator('#main-content')).toBeVisible()
    await expect(page.getByRole('heading', {level: 1})).toBeVisible()

    await page.goto('/terms/')
    await expect(page.locator('#main-content')).toBeVisible()
    await expect(page.getByRole('heading', {level: 1})).toBeVisible()
  })

  test('news index shows list or empty state', async ({page}) => {
    await page.goto('/news/')
    await expect(page.locator('#main-content')).toBeVisible()
    const empty = page.locator('.empty-state')
    const cards = page.locator('#main-content a[href*="/news/"]')
    await expect(empty.or(cards.first())).toBeVisible()
  })
})

test.describe('contact validation', () => {
  test('empty submit marks required fields invalid', async ({page}) => {
    await page.goto('/contact/')
    const form = page.locator('[data-contact-form]')
    // Submit may be disabled without Turnstile site key — fire the bound submit handler.
    await form.evaluate((el) => {
      el.dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}))
    })
    await expect(form.locator('#contact-name')).toHaveAttribute('aria-invalid', 'true')
    await expect(form.locator('#contact-email')).toHaveAttribute('aria-invalid', 'true')
    await expect(form.locator('#contact-message')).toHaveAttribute('aria-invalid', 'true')
  })
})

test.describe('a11y extras', () => {
  for (const path of ['/privacy/', '/terms/', '/news/'] as const) {
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
