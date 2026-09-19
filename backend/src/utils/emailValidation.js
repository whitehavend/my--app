const normalizeEmail = (email) => {
  if (typeof email !== 'string') return '';

  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return '';

  return trimmed;
};

const isValidEmail = (email) => {
  const normalized = normalizeEmail(email);
  if (!normalized) return false;

  const emailPattern = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}$/i;
  return emailPattern.test(normalized);
};

module.exports = {
  normalizeEmail,
  isValidEmail,
};
