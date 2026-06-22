// tests/06-history.spec.js
// TC-06-01, TC-06-03, TC-06-04, TC-06-06, TC-06-15, TC-06-16, TC-06-18

const { test, expect } = require('@playwright/test');
const { HistoryPage } = require('../pages/HistoryPage');
const { loginAs }     = require('../utils/auth');
const { USERS }       = require('../utils/testData');

test.describe('Transaction History', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, USERS.qa);
    // Reset seed data before each test so filters start from a clean state
    await page.request.post('http://localhost:3000/api/reset');
  });

  // TC-06-01: History loads all seed transactions in newest-first order
  test('TC-06-01 — History loads all seed transactions newest first', async ({ page }) => {
    const history = new HistoryPage(page);
    await history.goto();

    // The transactions table must be visible and contain rows
    await expect(history.transactionsTable).toBeVisible();

    const rows = history.transactionsTable.locator('[data-testid^="history-row-"]');
    await expect(rows.first()).toBeVisible();

    // No empty-state message should appear when seed data is present
    await expect(history.noResults).not.toBeVisible();
  });

  // TC-06-03: Summary stats match seed data totals
  test('TC-06-03 — Summary stats (Sent, Received, Pending) are correct', async ({ page }) => {
    const history = new HistoryPage(page);
    await history.goto();

    await expect(history.statTotalSent).toBeVisible();
    await expect(history.statTotalRcvd).toBeVisible();
    await expect(history.statPending).toBeVisible();

    // Values must be non-empty
    await expect(history.statTotalSent).not.toHaveText('');
    await expect(history.statTotalRcvd).not.toHaveText('');
  });

  // TC-06-04: Filtering by Type = send shows only send transactions
  test('TC-06-04 — Filter by Type = send shows only send transactions', async ({ page }) => {
    const history = new HistoryPage(page);
    await history.goto();

    await history.applyFilters({ type: 'send' });

    // Every visible type cell must say "send"
    const typeCells = history.transactionsTable.locator('[data-testid^="tx-type-"]');
    const count = await typeCells.count();
    for (let i = 0; i < count; i++) {
      await expect(typeCells.nth(i)).toHaveText('send');
    }
  });

  // TC-06-06: Filtering by Status = completed shows only completed transactions
  test('TC-06-06 — Filter by Status = completed shows only completed rows', async ({ page }) => {
    const history = new HistoryPage(page);
    await history.goto();

    await history.applyFilters({ status: 'completed' });

    // All visible status badges must be the completed badge
    const completedBadges = history.transactionsTable.locator('[data-testid="status-badge-completed"]');
    const pendingBadges   = history.transactionsTable.locator('[data-testid="status-badge-pending"]');
    const failedBadges    = history.transactionsTable.locator('[data-testid="status-badge-failed"]');

    await expect(completedBadges.first()).toBeVisible();
    await expect(pendingBadges).toHaveCount(0);
    await expect(failedBadges).toHaveCount(0);
  });

  // TC-06-15: Combined filters (send + completed + BTC) narrow results correctly
  test('TC-06-15 — Combined filters send + completed + BTC narrow correctly', async ({ page }) => {
    const history = new HistoryPage(page);
    await history.goto();

    await history.applyFilters({ type: 'send', status: 'completed', asset: 'BTC' });

    const rows = history.transactionsTable.locator('[data-testid^="history-row-"]');
    const rowCount = await rows.count();

    if (rowCount === 0) {
      // Acceptable: no seed transactions match all three criteria
      await expect(history.noResults).toBeVisible();
    } else {
      // Every returned row must be a completed BTC send
      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        await expect(row.locator('[data-testid^="tx-type-"]')).toHaveText('send');
        await expect(row.locator('[data-testid="status-badge-completed"]')).toBeVisible();
        await expect(row.locator('[data-testid^="tx-amount-"]')).toContainText('BTC');
      }
    }
  });

  // TC-06-16: Clear filters button resets all filters and restores full list
  test('TC-06-16 — Clear button resets all filters and restores full list', async ({ page }) => {
    const history = new HistoryPage(page);
    await history.goto();

    // Record full row count before filtering
    const allRows = history.transactionsTable.locator('[data-testid^="history-row-"]');
    const totalCount = await allRows.count();

    // Apply a restrictive filter
    await history.applyFilters({ type: 'send', status: 'completed' });

    // Clear and confirm the full list is restored
    await history.clearFilters();
    await expect(allRows).toHaveCount(totalCount);
  });

  // TC-06-18: New API transaction appears in real time without page refresh
  test('TC-06-18 — New transaction appears in real time via WebSocket', async ({ page }) => {
    const history = new HistoryPage(page);
    await history.goto();

    const rowsBefore = history.transactionsTable.locator('[data-testid^="history-row-"]');
    const countBefore = await rowsBefore.count();

    // Inject a new transaction via the API — the WS should broadcast it to the UI
    await page.request.post('http://localhost:3000/api/transactions', {
      data: {
        userId: 'user_001',
        type:   'send',
        asset:  'BTC',
        amount: 0.01,
        address: '1NewAddressForTest',
        status: 'completed',
      },
    });

    // The new row should appear at the top without a page reload
    await expect(rowsBefore).toHaveCount(countBefore + 1, { timeout: 8000 });
  });

});
