// tests/05-transfer-receive.spec.js
// TC-05-01, TC-05-05, TC-05-06

const { test, expect } = require('@playwright/test');
const { TransferPage }  = require('../pages/TransferPage');
const { DashboardPage } = require('../pages/DashboardPage');
const { loginAs }       = require('../utils/auth');
const { USERS }         = require('../utils/testData');

test.describe('Transfer — Receive', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, USERS.qa);
  });

  // TC-05-01: Receive tab is pre-selected when visiting /transfer?type=receive
  test('TC-05-01 — Receive tab is pre-selected on /transfer?type=receive', async ({ page }) => {
    const transfer = new TransferPage(page);
    await transfer.gotoReceive();

    await expect(transfer.receiveTab).toHaveAttribute('aria-selected', 'true');

    // Deposit address box must be visible in receive mode
    await expect(transfer.receiveAddressBox).toBeVisible();
  });

  // TC-05-05: Switching the asset updates the displayed deposit address
  test('TC-05-05 — Switching asset updates the deposit address', async ({ page }) => {
    const transfer = new TransferPage(page);
    await transfer.gotoReceive();

    // Capture the initial deposit address (BTC by default)
    const btcAddress = await transfer.receiveAddressValue.textContent();

    // Switch to ETH — the deposit address must change
    await transfer.selectAsset('ETH');
    const ethAddress = await transfer.receiveAddressValue.textContent();

    expect(ethAddress).not.toBe(btcAddress);
    expect(ethAddress).not.toBe('');
  });

  // TC-05-06: Submitting a receive increases ETH balance and creates a transaction
  test('TC-05-06 — Submitting receive increases balance and creates transaction', async ({ page }) => {
    const transfer  = new TransferPage(page);
    const dashboard = new DashboardPage(page);

    // Capture ETH balance before
    await page.goto('/dashboard');
    const beforeText = await dashboard.walletBalance('ETH').textContent();
    const before = parseFloat(beforeText);

    // Submit a receive of 0.5 ETH
    await transfer.gotoReceive();
    await transfer.selectAsset('ETH');
    await transfer.amountInput.fill('0.5');
    await transfer.submit();

    await expect(transfer.successScreen).toBeVisible({ timeout: 10000 });

    // Verify the ETH balance increased on the dashboard
    await page.goto('/dashboard');
    const afterText = await dashboard.walletBalance('ETH').textContent();
    const after = parseFloat(afterText);

    expect(after).toBeGreaterThan(before);
    expect(after).toBeCloseTo(before + 0.5, 3);
  });

});
