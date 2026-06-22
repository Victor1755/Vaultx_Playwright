// tests/02-2fa.spec.js
// TC-02-02, TC-02-03, TC-02-04, TC-02-05, TC-02-06, TC-02-07, TC-02-08

const { test, expect } = require('@playwright/test');
const { LoginPage }    = require('../pages/LoginPage');
const { TwoFAPage }    = require('../pages/TwoFAPage');
const { USERS }        = require('../utils/testData');

// Each 2FA test starts fresh at the 2FA screen after a valid login.
// This beforeEach navigates through login so every test begins at 2FA.
test.describe('Two-Factor Authentication', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.qa.email, USERS.qa.password);
    // Wait for 2FA screen to be ready before each test runs
    await page.getByTestId('screen-2fa').waitFor({ state: 'visible' });
  });

  // TC-02-02: Focus auto-advances after each digit entry
  test('TC-02-02 — Focus advances automatically after each digit', async ({ page }) => {
    const twoFAPage = new TwoFAPage(page);

    // Type first digit into input-0 and confirm focus moves to input-1
    await twoFAPage.otpInputs[0].fill('4');
    await expect(twoFAPage.otpInputs[1]).toBeFocused();
  });

  // TC-02-03: Backspace clears current digit and returns focus to previous input
  test('TC-02-03 — Backspace clears digit and moves focus back', async ({ page }) => {
    const twoFAPage = new TwoFAPage(page);

    // Fill first two digits so focus lands on input-1
    await twoFAPage.otpInputs[0].fill('4');
    await twoFAPage.otpInputs[1].fill('8');

    // Press Backspace while on input-1
    await page.keyboard.press('Backspace');

    // input-1 should now be empty and focus should be back on input-0
    await expect(twoFAPage.otpInputs[1]).toHaveValue('');
    await expect(twoFAPage.otpInputs[0]).toBeFocused();
  });

  // TC-02-04: Pasting a 6-digit code fills all boxes at once
  test('TC-02-04 — Pasting 6-digit code fills all OTP inputs', async ({ page }) => {
    const twoFAPage = new TwoFAPage(page);

    await twoFAPage.pasteOTP(USERS.qa.otp);

    // All 6 boxes must be filled
    const digits = USERS.qa.otp.split('');
    for (let i = 0; i < 6; i++) {
      await expect(twoFAPage.otpInputs[i]).toHaveValue(digits[i]);
    }
  });

  // TC-02-05: Correct OTP navigates to /dashboard
  test('TC-02-05 — Correct OTP navigates to dashboard', async ({ page }) => {
    const twoFAPage = new TwoFAPage(page);

    await twoFAPage.loginWithOTP(USERS.qa.otp);

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  // TC-02-06: Wrong OTP shows error and stays on 2FA screen
  test('TC-02-06 — Wrong OTP shows error and stays on 2FA screen', async ({ page }) => {
    const twoFAPage = new TwoFAPage(page);

    await twoFAPage.loginWithOTP('000000');

    await expect(twoFAPage.errorMsg).toBeVisible();
    await expect(twoFAPage.screen).toBeVisible();
    await expect(page).not.toHaveURL(/\/dashboard/);
  });

  // TC-02-07: Verify button is disabled when fewer than 6 digits are entered
  test('TC-02-07 — Verify button disabled until all 6 digits are entered', async ({ page }) => {
    const twoFAPage = new TwoFAPage(page);

    // Button should start disabled (0 digits)
    await expect(twoFAPage.verifyBtn).toBeDisabled();

    // Enter only 3 digits — still disabled
    await twoFAPage.otpInputs[0].fill('4');
    await twoFAPage.otpInputs[1].fill('8');
    await twoFAPage.otpInputs[2].fill('2');
    await expect(twoFAPage.verifyBtn).toBeDisabled();

    // Enter remaining 3 digits — now enabled
    await twoFAPage.otpInputs[3].fill('9');
    await twoFAPage.otpInputs[4].fill('1');
    await twoFAPage.otpInputs[5].fill('0');
    await expect(twoFAPage.verifyBtn).toBeEnabled();
  });

  // TC-02-08: Back to login button clears OTP and returns to /login
  test('TC-02-08 — Back to login clears OTP and returns to /login', async ({ page }) => {
    const twoFAPage = new TwoFAPage(page);

    // Enter partial OTP so there is something to clear
    await twoFAPage.otpInputs[0].fill('4');
    await twoFAPage.otpInputs[1].fill('8');

    await twoFAPage.backBtn.click();

    await expect(page).toHaveURL(/\/login/);
  });

});
