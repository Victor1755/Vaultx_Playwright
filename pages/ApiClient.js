// pages/ApiClient.js
// A lightweight API helper that wraps Playwright's request context.
// Tests import this instead of calling page.request directly —
// keeps endpoint paths in one place and test files readable.

class ApiClient {
  /**
   * @param {import('@playwright/test').APIRequestContext} request
   */
  constructor(request) {
    this.request = request;
    this.base    = 'http://localhost:3000/api';
  }

  // ─── Health ────────────────────────────────────────────────────────────────

  async health() {
    return this.request.get(`${this.base}/health`);
  }

  // ─── Reset ─────────────────────────────────────────────────────────────────

  async reset() {
    return this.request.post(`${this.base}/reset`);
  }

  async snapshot() {
    return this.request.get(`${this.base}/snapshot`);
  }

  // ─── Users ─────────────────────────────────────────────────────────────────

  async getUser(userId) {
    return this.request.get(`${this.base}/users/${userId}`);
  }

  async createUser(payload) {
    return this.request.post(`${this.base}/users`, { data: payload });
  }

  // ─── Wallets ───────────────────────────────────────────────────────────────

  async getWallets(userId) {
    return this.request.get(`${this.base}/wallets/${userId}`);
  }

  async updateWalletBalance(userId, symbol, balance) {
    return this.request.patch(`${this.base}/wallets/${userId}/${symbol}`, {
      data: { balance },
    });
  }

  // ─── Transactions ──────────────────────────────────────────────────────────

  async getTransactions(userId, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url   = `${this.base}/transactions/${userId}${query ? `?${query}` : ''}`;
    return this.request.get(url);
  }

  async createTransaction(payload) {
    return this.request.post(`${this.base}/transactions`, { data: payload });
  }

  async deleteTransaction(txId) {
    return this.request.delete(`${this.base}/transactions/${txId}`);
  }
}

module.exports = { ApiClient };
