// tests/01-login.spec.js
// TC-01-01, TC-01-02, TC-01-03, TC-01-09

const { test, expect } = require('@playwright/test');
const { LoginPage }    = require('../pages/LoginPage');
const { TwoFAPage }    = require('../pages/TwoFAPage');
const { USERS }        = require('../utils/testData');

test.describe('Login & Authentication', () => {

  // TC-01-01: Login page renders all elements
  test('TC-01-01 — Login page renders all required elements', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // The root screen must be present
    await expect(loginPage.screen).toBeVisible();

    // Each interactive element must be visible and enabled
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginBtn).toBeVisible();
    await expect(loginPage.loginBtn).toBeEnabled();
  });

  // TC-01-02: Valid credentials redirect to 2FA
  test('TC-01-02 — Valid credentials navigate to 2FA screen', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const twoFAPage = new TwoFAPage(page);

    await loginPage.goto();
    await loginPage.login(USERS.qa.email, USERS.qa.password);

    // Must land on the 2FA screen — not the dashboard
    await expect(twoFAPage.screen).toBeVisible({ timeout: 8000 });
    await expect(page).not.toHaveURL(/\/dashboard/);
  });

  // TC-01-03: Invalid credentials show error, no redirect
  test('TC-01-03 — Invalid credentials show error message', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(USERS.invalid.email, USERS.invalid.password);

    // Error paragraph must be visible
    await expect(loginPage.errorMsg).toBeVisible();

    // Must stay on /login — no redirect to 2FA or dashboard
    await expect(page).toHaveURL(/\/login/);
  });

  // TC-01-09: Authenticated user is redirected away from /login
  test('TC-01-09 — Authenticated user is redirected from /login to /dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const twoFAPage = new TwoFAPage(page);

    // Perform a full login first to get an authenticated session
    await loginPage.goto();
    await loginPage.login(USERS.qa.email, USERS.qa.password);
    await twoFAPage.screen.waitFor({ state: 'visible' });
    await twoFAPage.loginWithOTP(USERS.qa.otp);
    await page.waitForURL(/\/dashboard/);

    // Now visit /login again — the app should redirect back to /dashboard
    await page.goto('/login');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 8000 });
  });

});
