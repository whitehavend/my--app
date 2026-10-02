const axios = require('axios');

const USD_RATES_URL = process.env.USD_EXCHANGE_RATES_URL || 'https://open.er-api.com/v6/latest/USD';
const CACHE_DURATION_MS = 60 * 60 * 1000;

let cachedRates = null;
let cachedAt = 0;

const getUsdExchangeRates = async () => {
  if (cachedRates && Date.now() - cachedAt < CACHE_DURATION_MS) return cachedRates;

  const response = await axios.get(USD_RATES_URL, { timeout: 5000 });
  const rates = response.data?.rates;
  if (response.data?.result !== 'success' || !rates || Number(rates.USD) !== 1) {
    throw new Error('Live USD exchange rates are unavailable');
  }

  cachedRates = rates;
  cachedAt = Date.now();
  return cachedRates;
};

module.exports = { getUsdExchangeRates };