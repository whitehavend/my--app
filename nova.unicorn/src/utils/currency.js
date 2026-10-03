import { parsePhoneNumberFromString } from "libphonenumber-js";

const currencyByCountry = {
  AE: "AED",
  AU: "AUD",
  CA: "CAD",
  CH: "CHF",
  CN: "CNY",
  DE: "EUR",
  EG: "EGP",
  ES: "EUR",
  FR: "EUR",
  GH: "GHS",
  IN: "INR",
  IT: "EUR",
  JP: "JPY",
  KE: "KES",
  NG: "NGN",
  NL: "EUR",
  NZ: "NZD",
  PT: "EUR",
  RW: "RWF",
  SA: "SAR",
  SE: "SEK",
  SG: "SGD",
  TZ: "TZS",
  UG: "UGX",
  GB: "GBP",
  US: "USD",
  ZA: "ZAR",
  ZM: "ZMW",
};

const usdBaseRates = {
  USD: 1,
  NGN: 1500,
  KES: 130,
  EUR: 0.92,
  GBP: 0.79,
  ZAR: 18.5,
  GHS: 12.5,
  UGX: 3700,
  TZS: 2550,
  RWF: 1220,
  AED: 3.67,
  AUD: 1.5,
  CAD: 1.35,
  CHF: 0.9,
  CNY: 7.25,
  EGP: 49,
  INR: 83,
  JPY: 157,
  NZD: 1.62,
  SAR: 3.75,
  SEK: 10.2,
  SGD: 1.35,
  ZMW: 25,
};

const currencySymbols = {
  AED: "د.إ", AUD: "A$", CAD: "C$", CHF: "CHF", CNY: "¥", EGP: "E£",
  EUR: "€", GBP: "£", GHS: "GH₵", INR: "₹", JPY: "¥", KES: "KSh",
  NGN: "₦", NZD: "NZ$", RWF: "FRw", SAR: "﷼", SEK: "kr", SGD: "S$",
  TZS: "TSh", UGX: "USh", USD: "$", ZAR: "R", ZMW: "ZK",
};

export const getCurrencyForCountry = (countryCode) => currencyByCountry[String(countryCode || "").trim().toUpperCase()] || "NGN";

export const convertCurrency = (amount, fromCurrency = "NGN", toCurrency = "NGN") => {
  const numericAmount = Number(amount) || 0;
  if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) return numericAmount;

  const fromRate = usdBaseRates[fromCurrency] || 1;
  const toRate = usdBaseRates[toCurrency] || 1;

  return numericAmount * (toRate / fromRate);
};

const getLocaleCountryCode = () => {
  const locale = Intl.NumberFormat().resolvedOptions().locale || "en-US";
  const match = locale.match(/-([A-Z]{2})$/);
  return match ? match[1] : "";
};

export const detectVisitorCurrency = async (user = null) => {
  const profileCountry = String(user?.country || "").trim().toUpperCase();
  if (currencyByCountry[profileCountry]) {
    return currencyByCountry[profileCountry];
  }

  const phoneNumber = String(user?.phoneNumber || "").trim();
  const callingCode = String(user?.countryCode || "").trim();
  if (phoneNumber) {
    const fullPhoneNumber = phoneNumber.startsWith("+") ? phoneNumber : `${callingCode}${phoneNumber}`;
    const parsedPhoneNumber = parsePhoneNumberFromString(fullPhoneNumber);
    if (parsedPhoneNumber?.country && currencyByCountry[parsedPhoneNumber.country]) {
      return currencyByCountry[parsedPhoneNumber.country];
    }
  }

  try {
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) throw new Error("Geolocation unavailable");
    const data = await response.json();
    const countryCode = data?.country_code || data?.country;
    if (countryCode) {
      return getCurrencyForCountry(String(countryCode).toUpperCase());
    }
  } catch (error) {
    // Ignore geolocation failures and use the browser locale as a fallback.
  }

  const localeCountry = getLocaleCountryCode();
  if (localeCountry && currencyByCountry[localeCountry]) {
    return currencyByCountry[localeCountry];
  }

  return "NGN";
};

export const formatCurrency = (amount, currency = "NGN", options = {}) => {
  const { localCurrency = null, convert = false } = options;
  let displayCurrency = currency;
  let displayAmount = Number(amount) || 0;

  if (convert && localCurrency && localCurrency !== currency && usdBaseRates[currency] && usdBaseRates[localCurrency]) {
    displayAmount = convertCurrency(displayAmount, currency, localCurrency);
    displayCurrency = localCurrency;
  }

  try {
    const formattedAmount = new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(displayAmount);
    return `${currencySymbols[displayCurrency] || displayCurrency} ${formattedAmount}`;
  } catch {
    return `${currencySymbols[displayCurrency] || displayCurrency} ${displayAmount}`;
  }
};
