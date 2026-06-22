// utils/testData.js
// Sourced from VaultX_RegressionSuite_Testdata1.xlsx — Test Data sheet

const USERS = {
  qa: {
    email:    'qa@vaultx.io',
    password: 'Test@1234',
    otp:      '482910',
    name:     'Jordan Okafor',
  },
  intern: {
    email:    'intern@vaultx.io',
    password: 'Intern@99',
    otp:      '773421',
    name:     'Priya Nair',
  },
  invalid: {
    email:    'wrong@vaultx.io',
    password: 'WrongPass!1',
  },
};

const WALLETS = {
  BTC:  { balance: '0.84231', usdRate: 62480,  usdValue: '52,627.53' },
  ETH:  { balance: '4.2091',  usdRate: 3105,   usdValue: '13,069.26' },
  USDT: { balance: '2450.0',  usdRate: 1,      usdValue: '2,450.00'  },
  SOL:  { balance: '18.55',   usdRate: 148,    usdValue: '2,745.40'  },
};

const PORTFOLIO = {
  totalUSD: '$70,892.18',
};

const TRANSFER = {
  validAddress:   '1A2B3C4D5E6F7G8H9I0J',
  shortAddress:   'abc',       // < 10 chars — triggers boundary error
  sendAmount:     '0.5',       // 0.5 BTC → $31,240.00 preview
  sendUsdPreview: '$31,240.00',
  overAmount:     '9999999',   // exceeds any wallet balance
};

const API = {
  baseURL:    'http://localhost:3000/api',
  userId:     'user_001',
  unknownId:  'user_999',
};

module.exports = { USERS, WALLETS, PORTFOLIO, TRANSFER, API };
