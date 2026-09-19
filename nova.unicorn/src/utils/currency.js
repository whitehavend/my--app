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

export const getCurrencyForCountry = (countryCode) => currencyByCountry[countryCode] || "NGN";

const currencySymbols = {
  AED: "د.إ", AUD: "A$", CAD: "C$", CHF: "CHF", CNY: "¥", EGP: "E£",
  EUR: "€", GBP: "£", GHS: "GH₵", INR: "₹", JPY: "¥", KES: "KSh",
  NGN: "₦", NZD: "NZ$", RWF: "FRw", SAR: "﷼", SEK: "kr", SGD: "S$",
  TZS: "TSh", UGX: "USh", USD: "$", ZAR: "R", ZMW: "ZK",
};

export const formatCurrency = (amount, currency = "NGN") => {
  try {
    const formattedAmount = new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(Number(amount) || 0);
    return `${currencySymbols[currency] || currency} ${formattedAmount}`;
  } catch {
    return `${currencySymbols[currency] || currency} ${Number(amount) || 0}`;
  }
};
