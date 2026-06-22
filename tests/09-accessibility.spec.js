// tests/09-accessibility.spec.js
// TC-ACC-01, TC-ACC-03, TC-ACC-04

const { test, expect } = require('@playwright/test');
const { LoginPage }    = require('../pages/LoginPage');
const { TwoFAPage }    = require('../pages/TwoFAPage');
const { NavBar }       = require('../pages/NavBar');
const { loginAs }      = require('../utils/auth');
const { USERS }        = require('../utils/testData');

test.describe('Accessibility', () => {

  // TC-ACC-01: Login form is fully navigable via keyboard (no mouse needed)
  test('TC-ACC-01 — Login form is navigable by keyboard only', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Tab to email field and type
    await page.keyboard.press('Tab');
    await expect(loginPage.emailInput).toBeFocused();
    await page.keyboard.type(USERS.qa.email);

    // Tab to password field and type
    await page.keyboard.press('Tab');
    await expect(loginPage.passwordInput).toBeFocused();
    await page.keyboard.type(USERS.qa.password);

    // Tab to submit button and press Enter to submit
    await page.keyboard.press('Tab');
    await expect(loginPage.loginBtn).toBeFocused();
    await page.keyboard.press('Enter');

    // Must arrive at the 2FA screen — no mouse used
    const twoFAPage = new TwoFAPage(page);
    await expect(twoFAPage.screen).toBeVisible({ timeout: 8000 });
  });

  // TC-ACC-03: Email, password, and submit button all have descriptive ARIA labels
  test('TC-ACC-03 — All interactive login elements have ARIA labels', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Each element must have either aria-label or aria-labelledby set
    for (const locator of [loginPage.emailInput, loginPage.passwordInput, loginPage.loginBtn]) {
      const ariaLabel      = await locator.getAttribute('aria-label');
      const ariaLabelledBy = await locator.getAttribute('aria-labelledby');

      const hasLabel = (ariaLabel && ariaLabel.trim().length > 0)
                    || (ariaLabelledBy && ariaLabelledBy.trim().length > 0);

      expect(hasLabel, `Element missing ARIA label: ${await locator.getAttribute('data-testid')}`).toBe(true);
    }
  });

  // TC-ACC-04: Navbar tabs are focusable and activatable via keyboard
  test('TC-ACC-04 — Navbar tabs are keyboard navigable', async ({ page }) => {
    await loginAs(page, USERS.qa);

    const nav = new NavBar(page);

    // Focus the Dashboard tab and verify it is the focused element
    await nav.dashboardTab.focus();
    await expect(nav.dashboardTab).toBeFocused();

    // Tab to Transfer tab
    await page.keyboard.press('Tab');
    await expect(nav.transferTab).toBeFocused();

    // Activate Transfer via Enter key — must navigate to /transfer
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/transfer/, { timeout: 8000 });

    // Tab to History tab from Transfer
    await nav.historyTab.focus();
    await expect(nav.historyTab).toBeFocused();

    // Activate History via Space bar — must navigate to /history
    await page.keyboard.press('Space');
    await expect(page).toHaveURL(/\/history/, { timeout: 8000 });
  });

});
