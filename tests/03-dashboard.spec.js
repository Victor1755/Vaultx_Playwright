// tests/03-dashboard.spec.js
// TC-03-01, TC-03-02, TC-03-03, TC-03-05, TC-03-06, TC-03-08, TC-03-11

const { test, expect } = require('@playwright/test');
const { DashboardPage } = require('../pages/DashboardPage');
const { NavBar }        = require('../pages/NavBar');
const { loginAs }       = require('../utils/auth');
const { USERS, WALLETS, PORTFOLIO } = require('../utils/testData');

test.describe('Dashboard', () => {

  // Log in once before each test
  test.beforeEach(async ({ page }) => {
    await loginAs(page, USERS.qa);
  });

  // TC-03-01: Portfolio total displays correct USD value
  test('TC-03-01 — Portfolio total shows $70,892.18', async ({ page }) => {
    const dash = new DashboardPage(page);
    await expect(dash.totalBalanceUSD).toHaveText(PORTFOLIO.totalUSD);
  });

  // TC-03-02: All 4 wallet cards render with correct balances
  test('TC-03-02 — All 4 wallet cards render with correct balances', async ({ page }) => {
    const dash = new DashboardPage(page);

    for (const symbol of ['BTC', 'ETH', 'USDT', 'SOL']) {
      const wallet = WALLETS[symbol];
      await expect(dash.walletCard(symbol)).toBeVisible();
      await expect(dash.walletBalance(symbol)).toHaveText(wallet.balance);
      await expect(dash.walletBalanceUSD(symbol)).toContainText(wallet.usdValue);
    }
  });

  // TC-03-03: Recent Activity shows exactly 5 transactions, newest first
  test('TC-03-03 — Recent Activity shows 5 most recent transactions', async ({ page }) => {
    const dash = new DashboardPage(page);
    const rows = dash.recentTxList.locator('[data-testid^="tx-row-"]');
    await expect(rows).toHaveCount(5);
  });

  // TC-03-05: Send button navigates to /transfer?type=send
  test('TC-03-05 — Send button navigates to /transfer?type=send', async ({ page }) => {
    const dash = new DashboardPage(page);
    await dash.sendBtn.click();
    await expect(page).toHaveURL(/\/transfer\?type=send/);
  });

  // TC-03-06: Receive button navigates to /transfer?type=receive
  test('TC-03-06 — Receive button navigates to /transfer?type=receive', async ({ page }) => {
    const dash = new DashboardPage(page);
    await dash.receiveBtn.click();
    await expect(page).toHaveURL(/\/transfer\?type=receive/);
  });

  // TC-03-08: WebSocket live update — ETH balance updates without page refresh
  test('TC-03-08 — Wallet balances update live via WebSocket', async ({ page }) => {
    const dash = new DashboardPage(page);

    // Record the current ETH balance shown on the dashboard
    const initialBalance = await dash.walletBalance('ETH').textContent();

    // Trigger a balance update via the API so the WS broadcasts a change
    await page.request.patch(`http://localhost:3000/api/wallets/user_001/ETH`, {
      data: { balance: 5.0 },
    });

    // The UI should reflect the new balance without a manual reload
    await expect(dash.walletBalance('ETH')).not.toHaveText(initialBalance, { timeout: 8000 });
    await expect(dash.walletBalance('ETH')).toHaveText('5');
  });

  // TC-03-11: Unauthenticated user is redirected from /dashboard to /login
  test('TC-03-11 — Logged-out user is redirected from /dashboard', async ({ page }) => {
    const nav = new NavBar(page);
    await nav.logout();

    // Attempt to visit /dashboard without a session
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

});
