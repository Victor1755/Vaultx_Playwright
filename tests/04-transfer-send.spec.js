// tests/04-transfer-send.spec.js
// TC-04-01, TC-04-02, TC-04-03, TC-04-04, TC-04-05, TC-04-06, TC-04-08, TC-04-09

const { test, expect } = require('@playwright/test');
const { TransferPage } = require('../pages/TransferPage');
const { DashboardPage } = require('../pages/DashboardPage');
const { loginAs }      = require('../utils/auth');
const { USERS, TRANSFER, WALLETS } = require('../utils/testData');

test.describe('Transfer — Send', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, USERS.qa);
  });

  // TC-04-01: Send tab is pre-selected when visiting /transfer?type=send
  test('TC-04-01 — Send tab is pre-selected on /transfer?type=send', async ({ page }) => {
    const transfer = new TransferPage(page);
    await transfer.gotoSend();

    // The send toggle should have an active/selected aria state
    await expect(transfer.sendTab).toHaveAttribute('aria-selected', 'true');
  });

  // TC-04-02: Asset dropdown lists all 4 wallets with balances
  test('TC-04-02 — Asset dropdown lists all 4 wallets with their balances', async ({ page }) => {
    const transfer = new TransferPage(page);
    await transfer.gotoSend();

    // Open the dropdown and verify all four asset options are present
    const options = transfer.assetSelect.locator('option');
    await expect(options.filter({ hasText: 'BTC' })).toHaveCount(1);
    await expect(options.filter({ hasText: 'ETH' })).toHaveCount(1);
    await expect(options.filter({ hasText: 'USDT' })).toHaveCount(1);
    await expect(options.filter({ hasText: 'SOL' })).toHaveCount(1);
  });

  // TC-04-03: USD preview updates live as amount is typed
  test('TC-04-03 — USD equivalent preview updates as amount is typed', async ({ page }) => {
    const transfer = new TransferPage(page);
    await transfer.gotoSend();

    // Select BTC; then type 0.5 — expected preview: 0.5 × $62,480 = $31,240.00
    await transfer.selectAsset('BTC');
    await transfer.amountInput.fill(TRANSFER.sendAmount);

    await expect(transfer.usdPreview).toHaveText(TRANSFER.sendUsdPreview);
  });

  // TC-04-04: Amount exceeding wallet balance shows "Insufficient balance" error
  test('TC-04-04 — Over-balance amount shows Insufficient balance error', async ({ page }) => {
    const transfer = new TransferPage(page);
    await transfer.gotoSend();

    await transfer.fillSendForm({
      asset:   'BTC',
      amount:  TRANSFER.overAmount,
      address: TRANSFER.validAddress,
    });
    await transfer.submit();

    await expect(transfer.errorAmount).toBeVisible();
    await expect(transfer.errorAmount).toContainText('Insufficient balance');
    // No success screen should appear
    await expect(transfer.successScreen).not.toBeVisible();
  });

  // TC-04-05: Empty recipient address shows required error
  test('TC-04-05 — Empty recipient address shows required field error', async ({ page }) => {
    const transfer = new TransferPage(page);
    await transfer.gotoSend();

    // Fill only the amount — leave address blank
    await transfer.fillSendForm({ asset: 'ETH', amount: '0.1' });
    await transfer.submit();

    await expect(transfer.errorAddress).toBeVisible();
    await expect(transfer.errorAddress).toContainText('required');
  });

  // TC-04-06: Address shorter than 10 characters shows short-address error
  test('TC-04-06 — Address < 10 chars shows short address validation error', async ({ page }) => {
    const transfer = new TransferPage(page);
    await transfer.gotoSend();

    await transfer.fillSendForm({
      asset:   'ETH',
      amount:  '0.1',
      address: TRANSFER.shortAddress, // 'abc' — 3 chars
    });
    await transfer.submit();

    await expect(transfer.errorAddress).toBeVisible();
  });

  // TC-04-08: Successful send shows success screen with transaction details
  test('TC-04-08 — Successful send shows success screen with Tx details', async ({ page }) => {
    const transfer = new TransferPage(page);
    await transfer.gotoSend();

    await transfer.fillSendForm({
      asset:   'ETH',
      amount:  '0.1',
      address: TRANSFER.validAddress,
    });
    await transfer.submit();

    // Success screen and Tx ID must appear
    await expect(transfer.successScreen).toBeVisible({ timeout: 10000 });
    await expect(transfer.successTxId).not.toBeEmpty();
    await expect(transfer.successSummary).toBeVisible();
  });

  // TC-04-09: ETH balance decreases after a successful send
  test('TC-04-09 — ETH wallet balance decreases after successful send', async ({ page }) => {
    const transfer   = new TransferPage(page);
    const dashboard  = new DashboardPage(page);

    // Capture balance before sending
    await page.goto('/dashboard');
    const beforeText = await dashboard.walletBalance('ETH').textContent();
    const before = parseFloat(beforeText);

    // Send 0.1 ETH
    await transfer.gotoSend();
    await transfer.fillSendForm({
      asset:   'ETH',
      amount:  '0.1',
      address: TRANSFER.validAddress,
    });
    await transfer.submit();
    await expect(transfer.successScreen).toBeVisible({ timeout: 10000 });

    // Return to dashboard and verify the balance dropped
    await page.goto('/dashboard');
    const afterText = await dashboard.walletBalance('ETH').textContent();
    const after = parseFloat(afterText);

    expect(after).toBeLessThan(before);
    expect(after).toBeCloseTo(before - 0.1, 3);
  });

});
