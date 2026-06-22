// tests/08-api.spec.js
// TC-API-01, TC-API-03, TC-API-05, TC-API-06, TC-API-07,
// TC-API-11, TC-API-16, TC-API-18, TC-API-19, TC-API-25, TC-API-26, TC-API-28

const { test, expect } = require('@playwright/test');
const { ApiClient }    = require('../pages/ApiClient');
const { DashboardPage } = require('../pages/DashboardPage');
const { HistoryPage }   = require('../pages/HistoryPage');
const { loginAs }       = require('../utils/auth');
const { USERS, API }    = require('../utils/testData');

test.describe('API Tests', () => {

  let api;

  test.beforeEach(async ({ request, page }) => {
    api = new ApiClient(request);
    // Reset seed data before every API test so state is predictable
    await api.reset();
  });

  // ─── Health ────────────────────────────────────────────────────────────────

  // TC-API-01: Health check returns 200 with uptime and record counts
  test('TC-API-01 — Health check returns 200', async () => {
    const res  = await api.health();
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(body).toHaveProperty('uptime');
  });

  // ─── Reset ─────────────────────────────────────────────────────────────────

  // TC-API-03: Reset restores seed data; snapshot returns seed state
  test('TC-API-03 — Reset restores seed data', async () => {
    // Mutate something first
    await api.updateWalletBalance(API.userId, 'BTC', 0.001);

    // Reset
    const resetRes = await api.reset();
    expect(resetRes.status()).toBe(200);

    // Snapshot must reflect the original BTC balance
    const snapRes  = await api.snapshot();
    const snap     = await snapRes.json();
    const btcWallet = snap.wallets.find(w => w.symbol === 'BTC');
    expect(btcWallet.balance).toBe(0.84231);
  });

  // ─── Users ─────────────────────────────────────────────────────────────────

  // TC-API-05: Returns single user object for valid user_001
  test('TC-API-05 — Returns user object for valid user ID', async () => {
    const res  = await api.getUser(API.userId);
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(body.name).toBe('Jordan Okafor');
    expect(body.email).toBe(USERS.qa.email);
  });

  // TC-API-06: Returns 404 for an unknown user ID
  test('TC-API-06 — Returns 404 for unknown user ID', async () => {
    const res = await api.getUser(API.unknownId);
    expect(res.status()).toBe(404);
  });

  // TC-API-07: Creates a new user; body contains the new user object
  test('TC-API-07 — Creates new user with required fields', async () => {
    const payload = {
      name:     'Test User',
      email:    'newuser@vaultx.io',
      password: 'NewPass@99',
    };

    const res  = await api.createUser(payload);
    const body = await res.json();

    expect(res.status()).toBe(201);
    expect(body).toHaveProperty('id');
    expect(body.name).toBe(payload.name);
    expect(body.email).toBe(payload.email);
  });

  // ─── Wallets ───────────────────────────────────────────────────────────────

  // TC-API-11: Returns exactly 4 seed wallets for user_001
  test('TC-API-11 — Returns 4 seed wallets for user_001', async () => {
    const res     = await api.getWallets(API.userId);
    const wallets = await res.json();

    expect(res.status()).toBe(200);
    expect(wallets).toHaveLength(4);

    const symbols = wallets.map(w => w.symbol);
    expect(symbols).toContain('BTC');
    expect(symbols).toContain('ETH');
    expect(symbols).toContain('USDT');
    expect(symbols).toContain('SOL');
  });

  // TC-API-16: Update wallet balance; Dashboard reflects the change via WebSocket
  test('TC-API-16 — Updates wallet balance; UI reflects change via WS', async ({ page }) => {
    await loginAs(page, USERS.qa);

    const dash = new DashboardPage(page);

    // Update ETH balance via API
    const res = await api.updateWalletBalance(API.userId, 'ETH', 9.9999);
    expect(res.status()).toBe(200);

    // Without reloading, the dashboard should update via WebSocket
    await expect(dash.walletBalance('ETH')).toHaveText('9.9999', { timeout: 8000 });
  });

  // ─── Transactions ──────────────────────────────────────────────────────────

  // TC-API-18: Returns all seed transactions for user_001
  test('TC-API-18 — Returns all seed transactions for user', async () => {
    const res  = await api.getTransactions(API.userId);
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  // TC-API-19: Filtering by type=send returns only send transactions
  test('TC-API-19 — Filter by type=send returns only send transactions', async () => {
    const res  = await api.getTransactions(API.userId, { type: 'send' });
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(body.every(tx => tx.type === 'send')).toBe(true);
  });

  // TC-API-25: Creates a transaction; UI shows it in /history via WS
  test('TC-API-25 — Creates transaction; UI updates in /history via WS', async ({ page }) => {
    await loginAs(page, USERS.qa);

    const history = new HistoryPage(page);
    await history.goto();

    const rowsBefore = history.transactionsTable.locator('[data-testid^="history-row-"]');
    const countBefore = await rowsBefore.count();

    const res = await api.createTransaction({
      userId:  API.userId,
      type:    'send',
      asset:   'SOL',
      amount:  1.0,
      address: '1WSTestAddressSOL9988',
      status:  'completed',
    });
    expect(res.status()).toBe(201);

    // New row must appear in the UI without page refresh
    await expect(rowsBefore).toHaveCount(countBefore + 1, { timeout: 8000 });
  });

  // TC-API-26: Rejects transaction creation with missing required fields
  test('TC-API-26 — Rejects transaction with missing required fields', async () => {
    // Omit required fields (type, asset, amount)
    const res = await api.createTransaction({ userId: API.userId });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });

  // TC-API-28: Deletes a transaction; it disappears from /history
  test('TC-API-28 — Deletes transaction; removed from history via WS', async ({ page }) => {
    // First, get the list of transactions to find a valid ID
    const listRes = await api.getTransactions(API.userId);
    const txList  = await listRes.json();
    expect(txList.length).toBeGreaterThan(0);

    const targetTxId = txList[0].id;

    await loginAs(page, USERS.qa);

    const history = new HistoryPage(page);
    await history.goto();

    // Confirm the row exists before deletion
    await expect(history.txRow(targetTxId)).toBeVisible();

    // Delete via API
    const delRes = await api.deleteTransaction(targetTxId);
    expect(delRes.status()).toBe(200);

    // Row should disappear from the UI in real time
    await expect(history.txRow(targetTxId)).not.toBeVisible({ timeout: 8000 });
  });

});
