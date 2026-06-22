// pages/HistoryPage.js
// Page Object Model for the Transaction History screen (TC-06-xx)

class HistoryPage {
  constructor(page) {
    this.page = page;

    // Root
    this.screen = page.getByTestId('screen-history');
    this.txCount = page.getByTestId('tx-count');

    // Summary stats
    this.historySummary  = page.getByTestId('history-summary');
    this.statTotalSent   = page.getByTestId('stat-total-sent');
    this.statTotalRcvd   = page.getByTestId('stat-total-received');
    this.statPending     = page.getByTestId('stat-pending-count');

    // Filters
    this.filterBar      = page.getByTestId('filter-bar');
    this.searchInput    = page.getByTestId('input-search');
    this.filterType     = page.getByTestId('filter-type');
    this.filterStatus   = page.getByTestId('filter-status');
    this.filterAsset    = page.getByTestId('filter-asset');
    this.sortBy         = page.getByTestId('sort-by');
    this.clearFiltersBtn = page.getByTestId('btn-clear-filters');

    // Table
    this.transactionsTable = page.getByTestId('transactions-table');
    this.noResults         = page.getByTestId('no-results');

    // Status badges
    this.badgeCompleted = page.getByTestId('status-badge-completed');
    this.badgePending   = page.getByTestId('status-badge-pending');
    this.badgeFailed    = page.getByTestId('status-badge-failed');
  }

  async goto() {
    await this.page.goto('/history');
  }

  /** Returns a transaction row element by its ID. */
  txRow(txId)    { return this.page.getByTestId(`history-row-${txId}`); }
  txType(txId)   { return this.page.getByTestId(`tx-type-${txId}`); }
  txAmount(txId) { return this.page.getByTestId(`tx-amount-${txId}`); }
  txUSD(txId)    { return this.page.getByTestId(`tx-usd-${txId}`); }

  async applyFilters({ type, status, asset } = {}) {
    if (type)   await this.filterType.selectOption(type);
    if (status) await this.filterStatus.selectOption(status);
    if (asset)  await this.filterAsset.selectOption(asset);
  }

  async clearFilters() {
    await this.clearFiltersBtn.click();
  }
}

module.exports = { HistoryPage };
