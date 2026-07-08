export const getCurrencySymbol = (currencyCode) => {
    return '₹';
};

const SUPPORTED_CURRENCIES = ['INR'];

export function isValidCurrency(code) {
  return typeof code === 'string' && code.toUpperCase() === 'INR';
}
