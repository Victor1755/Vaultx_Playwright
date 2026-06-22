// utils/auth.js
// Reusable full login (credentials + 2FA) helper.
// Import and call loginAs(page, user) at the start of any test
// that requires an authenticated session.

const { LoginPage } = require('../pages/LoginPage');
const { TwoFAPage  } = require('../pages/TwoFAPage');

/**
 * Completes the full login + 2FA flow.
 * @param {import('@playwright/test').Page} page
 * @param {{ email: string, password: string, otp: string }} user
 */
async function loginAs(page, user) {
  const loginPage = new LoginPage(page);
  const twoFAPage = new TwoFAPage(page);

  await loginPage.goto();
  await loginPage.login(user.email, user.password);

  // Wait for the 2FA screen to appear before entering the OTP
  await twoFAPage.screen.waitFor({ state: 'visible' });
  await twoFAPage.loginWithOTP(user.otp);

  // Wait until the app has navigated away from /2fa
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
}

module.exports = { loginAs };
