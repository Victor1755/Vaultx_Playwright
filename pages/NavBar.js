// pages/NavBar.js
// Page Object Model for the top navigation bar (TC-07-xx)

class NavBar {
  constructor(page) {
    this.page = page;

    this.bar              = page.getByTestId('nav-bar');
    this.dashboardTab     = page.getByTestId('nav-dashboard');
    this.transferTab      = page.getByTestId('nav-transfer');
    this.historyTab       = page.getByTestId('nav-history');
    this.logoutBtn        = page.getByTestId('btn-logout');
    this.userAvatar       = page.getByTestId('user-avatar');
    this.userName         = page.getByTestId('user-name');
    this.connectionStatus = page.getByTestId('connection-status');
  }

  async goToDashboard() { await this.dashboardTab.click(); }
  async goToTransfer()  { await this.transferTab.click(); }
  async goToHistory()   { await this.historyTab.click(); }
  async logout()        { await this.logoutBtn.click(); }
}

module.exports = { NavBar };
