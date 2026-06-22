// tests/10-cross-browser.spec.js
// TC-CB-01 (Chrome), TC-CB-02 (Firefox), TC-CB-03 (Safari), TC-CB-04 (Edge)
// TC-CB-09 (WS wallet update — Chrome), TC-CB-10 (WS wallet update — Firefox)
//
// HOW CROSS-BROWSER WORKS HERE:
// Playwright's `projects` array in playwright.config.js maps each browser
// (chromium, firefox, webkit, edge) to the same test file. Every test in this
// file therefore runs automatically on all four browsers — there is no need
// to duplicate test logic per browser. The project name (Chrome / Firefox /
// Safari / Edge) appears in the HTML report beside each result.

const { test, expect } = require('@playwright/test');
const { LoginPage }     = require('../pages/LoginPage');
const { TwoFAPage }     = require('../pages/TwoFAPage');
const { DashboardPage } = require('../pages/DashboardPage');
const { NavBar }        = require('../pages/NavBar');
const { ApiClient }     = require('../pages/ApiClient');
const { loginAs }       = require('../utils/auth');
const { USERS, PORTFOLIO } = require('../utils/testData');

// ─── TC-CB-01/02/03/04: Full Login + 2FA flow across all browsers ────────────
// The test name is intentionally generic. The browser name from the Playwright
// project (chromium / firefox / webkit / edge) is appended automatically in
// the HTML report, satisfying TC-CB-01 through TC-CB-04 in a single spec.

test.describe('Cross-Browser — Login + 2FA Flow', () => {

  test('Full login + 2FA flow succeeds on this browser', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const twoFAPage = new TwoFAPage(page);

    // Step 1 — Navigate to /login
    await loginPage.goto();
    await expect(loginPage.screen).toBeVisible();

    // Step 2 — Submit valid credentials
    await loginPage.login(USERS.qa.email, USERS.qa.password);

    // Step 3 — 2FA screen must appear
    await expect(twoFAPage.screen).toBeVisible({ timeout: 8000 });

    // Step 4 — Enter correct OTP
    await twoFAPage.loginWithOTP(USERS.qa.otp);

    // Step 5 — Land on /dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Step 6 — Portfolio total renders correctly
    const dash = new DashboardPage(page);
    await expect(dash.totalBalanceUSD).toHaveText(PORTFOLIO.totalUSD);

    // Step 7 — Navbar is visible with all three tabs
    const nav = new NavBar(page);
    await expect(nav.dashboardTab).toBeVisible();
    await expect(nav.transferTab).toBeVisible();
    await expect(nav.historyTab).toBeVisible();
  });

});

// ─── TC-CB-09/10: Real-time wallet update via WebSocket ──────────────────────
// Runs on all browsers in the projects config; the report will show results
// per browser (chromium → Chrome, firefox → Firefox, webkit → Safari, edge → Edge).

test.describe('Cross-Browser — Real-time Wallet Update', () => {

  test('Dashboard updates wallet balance via WebSocket without page refresh', async ({ page, request }) => {
    await loginAs(page, USERS.qa);

    const dash = new DashboardPage(page);
    const api  = new ApiClient(request);

    // Capture the current ETH balance shown on screen
    const before = await dash.walletBalance('ETH').textContent();

    // Trigger a balance change through the API — the WS should push it to the UI
    await api.updateWalletBalance('user_001', 'ETH', 7.7777);

    // Balance must update in the UI without a manual page reload
    await expect(dash.walletBalance('ETH')).not.toHaveText(before, { timeout: 8000 });
    await expect(dash.walletBalance('ETH')).toHaveText('7.7777');
  });

});

// ─── TC-06-18b: New transaction appears in /history in real time ──────────────

test.describe('Cross-Browser — Real-time Transaction in History', () => {

  test('New transaction appears in /history in real time', async ({ page, request }) => {
    await loginAs(page, USERS.qa);

    const api = new ApiClient(request);
    const { HistoryPage } = require('../pages/HistoryPage');
    const history = new HistoryPage(page);
    await history.goto();

    const rows        = history.transactionsTable.locator('[data-testid^="history-row-"]');
    const countBefore = await rows.count();

    // Inject a new transaction via API — WS broadcasts it to the open page
    const res = await api.createTransaction({
      userId:  'user_001',
      type:    'receive',
      asset:   'USDT',
      amount:  100,
      address: '1CrossBrowserTestAddr',
      status:  'completed',
    });
    expect(res.status()).toBe(201);

    // New row must appear at the top without refreshing
    await expect(rows).toHaveCount(countBefore + 1, { timeout: 8000 });
  });

});
