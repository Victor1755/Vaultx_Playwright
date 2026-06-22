// pages/TwoFAPage.js
// Page Object Model for the 2FA screen (TC-02-xx)

class TwoFAPage {
  constructor(page) {
    this.page = page;

    // Root & form
    this.screen    = page.getByTestId('screen-2fa');
    this.form      = page.getByTestId('form-2fa');

    // OTP digit inputs (indices 0–5)
    this.otpInputs = Array.from({ length: 6 }, (_, i) =>
      page.getByTestId(`otp-input-${i}`)
    );

    // Actions
    this.verifyBtn   = page.getByTestId('btn-verify-2fa');
    this.errorMsg    = page.getByTestId('error-2fa');
    this.backBtn     = page.getByTestId('btn-back-login');
  }

  /**
   * Type an OTP code one digit at a time.
   * Playwright fires keydown/keypress/input/keyup for each character,
   * which triggers the focus-advance logic in the app.
   */
  async enterOTP(code) {
    const digits = code.toString().split('');
    for (let i = 0; i < digits.length; i++) {
      await this.otpInputs[i].fill(digits[i]);
    }
  }

  /**
   * Paste a full 6-digit code into the first input.
   * The app should distribute the digits across all boxes (TC-02-04).
   */
  async pasteOTP(code) {
    await this.otpInputs[0].focus();
    await this.page.keyboard.insertText(code);
  }

  async submit() {
    await this.verifyBtn.click();
  }

  async loginWithOTP(code) {
    await this.enterOTP(code);
    await this.submit();
  }
}

module.exports = { TwoFAPage };
