// pages/DashboardPage.js
// Page Object Model for the Dashboard screen (TC-03-xx)

class DashboardPage {
  constructor(page) {
    this.page = page;

    // Root
    this.screen = page.getByTestId('screen-dashboard');

    // Portfolio hero card
    this.totalBalanceCard = page.getByTestId('total-balance-card');
    this.totalBalanceUSD  = page.getByTestId('total-balance-usd');
    this.portfolioChange  = page.getByTestId('portfolio-change');

    // Quick-action buttons
    this.sendBtn    = page.getByTestId('btn-goto-send');
    this.receiveBtn = page.getByTestId('btn-goto-receive');

    // Wallet grid
    this.walletGrid = page.getByTestId('wallet-grid');

    // Recent transactions
    this.recentTxList       = page.getByTestId('recent-transactions');
    this.viewAllBtn         = page.getByTestId('btn-view-all-transactions');
  }

  /** Returns the wallet card element for a given symbol (BTC/ETH/USDT/SOL). */
  walletCard(symbol)       { return this.page.getByTestId(`wallet-card-${symbol.toLowerCase()}`); }
  walletBalance(symbol)    { return this.page.getByTestId(`balance-${symbol.toLowerCase()}`); }
  walletBalanceUSD(symbol) { return this.page.getByTestId(`balance-usd-${symbol.toLowerCase()}`); }

  /** Returns a single transaction row by its ID. */
  txRow(txId) { return this.page.getByTestId(`tx-row-${txId}`); }
}

module.exports = { DashboardPage };
