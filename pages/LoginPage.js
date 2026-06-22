// pages/LoginPage.js
// Page Object Model for the Login screen (TC-01-xx)
// All selectors use data-testid exclusively — no CSS classes or text.

class LoginPage {
  constructor(page) {
    this.page = page;

    // Root & form
    this.screen     = page.getByTestId('screen-login');
    this.form       = page.getByTestId('form-login');

    // Inputs
    this.emailInput    = page.getByTestId('input-email');
    this.passwordInput = page.getByTestId('input-password');

    // Actions
    this.loginBtn   = page.getByTestId('btn-login');
    this.errorMsg   = page.getByTestId('error-login');
    this.credHint   = page.getByTestId('test-credentials');
  }

  async goto() {
    await this.page.goto('/login');
  }

  /** Fill credentials and submit the login form. */
  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginBtn.click();
  }
}

module.exports = { LoginPage };
