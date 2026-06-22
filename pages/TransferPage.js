// pages/TransferPage.js
// Page Object Model for the Transfer screen (TC-04-xx / TC-05-xx)

class TransferPage {
  constructor(page) {
    this.page = page;

    // Root
    this.screen = page.getByTestId('screen-transfer');

    // Send/Receive toggle
    this.typeToggle  = page.getByTestId('transfer-type-toggle');
    this.sendTab     = page.getByTestId('toggle-send');
    this.receiveTab  = page.getByTestId('toggle-receive');

    // Form fields
    this.form           = page.getByTestId('form-transfer');
    this.assetSelect    = page.getByTestId('select-asset');
    this.amountInput    = page.getByTestId('input-amount');
    this.usdPreview     = page.getByTestId('usd-preview');
    this.addressInput   = page.getByTestId('input-address');
    this.noteInput      = page.getByTestId('input-note');
    this.submitBtn      = page.getByTestId('btn-submit-transfer');

    // Validation errors
    this.errorAmount  = page.getByTestId('error-amount');
    this.errorAddress = page.getByTestId('error-address');

    // Receive-mode elements
    this.receiveAddressBox   = page.getByTestId('receive-address');
    this.receiveAddressValue = page.getByTestId('receive-address-value');
    this.copyAddressBtn      = page.getByTestId('btn-copy-address');

    // Success screen
    this.successScreen  = page.getByTestId('screen-transfer-success');
    this.successSummary = page.getByTestId('success-summary');
    this.successTxId    = page.getByTestId('success-txid');
    this.newTransferBtn = page.getByTestId('btn-new-transfer');
    this.gotoHistoryBtn = page.getByTestId('btn-goto-history');
  }

  async gotoSend() {
    await this.page.goto('/transfer?type=send');
  }

  async gotoReceive() {
    await this.page.goto('/transfer?type=receive');
  }

  async selectAsset(symbol) {
    await this.assetSelect.selectOption(symbol);
  }

  async fillSendForm({ asset, amount, address, note }) {
    if (asset)   await this.selectAsset(asset);
    if (amount)  await this.amountInput.fill(amount);
    if (address) await this.addressInput.fill(address);
    if (note)    await this.noteInput.fill(note);
  }

  async submit() {
    await this.submitBtn.click();
  }
}

module.exports = { TransferPage };
