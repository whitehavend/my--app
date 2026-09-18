const { parsePhoneNumberFromString, isValidPhoneNumber } = require('libphonenumber-js');

const normalizeCountryCode = (countryCode) => {
  if (!countryCode) return '';
  const value = String(countryCode).trim();
  const digits = value.replace(/[^\d]/g, '');
  return digits ? `+${digits}` : '';
};

const isValidPhoneForCountry = (countryCode, phoneNumber) => {
  const normalizedCountryCode = normalizeCountryCode(countryCode);
  const trimmedPhone = String(phoneNumber || '').replace(/\s+/g, '').trim();

  if (!normalizedCountryCode || !trimmedPhone) {
    return false;
  }

  const cleanedPhone = trimmedPhone.replace(/^0+/, '');
  const fullNumber = `${normalizedCountryCode}${cleanedPhone}`;
  const parsed = parsePhoneNumberFromString(fullNumber);

  if (!parsed || !parsed.isValid()) {
    return false;
  }

  if (parsed.countryCallingCode !== normalizedCountryCode.replace('+', '')) {
    return false;
  }

  const standardNumber = isValidPhoneNumber(fullNumber);
  return Boolean(standardNumber);
};

module.exports = {
  isValidPhoneForCountry,
  normalizeCountryCode,
};
