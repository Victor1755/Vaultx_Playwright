// tests/07-navigation.spec.js
// TC-07-01, TC-07-03, TC-07-05, TC-07-06, TC-07-07, TC-07-08

const { test, expect } = require('@playwright/test');
const { NavBar }       = require('../pages/NavBar');
const { LoginPage }    = require('../pages/LoginPage');
const { loginAs }      = require('../utils/auth');
const { USERS }        = require('../utils/testData');

test.describe('Navigation & Security', () => {

  // ─── Authenticated nav tests ───────────────────────────────────────────────

  test.describe('Authenticated user', () => {

    test.beforeEach(async ({ page }) => {
      await loginAs(page, USERS.qa);
    });

    // TC-07-01: Navbar shows all three tabs when authenticated
    test('TC-07-01 — Navbar shows Dashboard, Transfer, History tabs', async ({ page }) => {
      const nav = new NavBar(page);

      await expect(nav.bar).toBeVisible();
      await expect(nav.dashboardTab).toBeVisible();
      await expect(nav.transferTab).toBeVisible();
      await expect(nav.historyTab).toBeVisible();
    });

    // TC-07-03: Navbar is NOT rendered on the /login screen
    test('TC-07-03 — Navbar is hidden on /login', async ({ page }) => {
      // Log out first to reach the login screen
      const nav = new NavBar(page);
      await nav.logout();

      await expect(page).toHaveURL(/\/login/);
      await expect(nav.bar).not.toBeVisible();
    });

    // TC-07-05: Logout clears session and redirects to /login
    test('TC-07-05 — Logout clears session and redirects to /login', async ({ page }) => {
      const nav = new NavBar(page);
      await nav.logout();

      // Must land on /login
      await expect(page).toHaveURL(/\/login/, { timeout: 8000 });

      // Attempting /dashboard without a session must redirect back to /login
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/login/);
    });

  });

  // ─── Unauthenticated route-guard tests ─────────────────────────────────────
  // These run WITHOUT logging in to verify each protected route redirects.

  test.describe('Unauthenticated user (route guards)', () => {

    // TC-07-06: /dashboard redirects unauthenticated user
    test('TC-07-06 — /dashboard redirects unauthenticated user to /login', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
    });

    // TC-07-07: /history redirects unauthenticated user
    test('TC-07-07 — /history redirects unauthenticated user to /login', async ({ page }) => {
      await page.goto('/history');
      await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
    });

    // TC-07-08: /transfer redirects unauthenticated user
    test('TC-07-08 — /transfer redirects unauthenticated user to /login', async ({ page }) => {
      await page.goto('/transfer');
      await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
    });

  });

});
