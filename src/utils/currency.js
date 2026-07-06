export const getCurrencySymbol = (currencyCode) => {
    switch (currencyCode) {
        case 'USD': return '$';
        case 'EUR': return '€';
        case 'GBP': return '£';
        case 'JPY': return '¥';
        case 'INR': return '₹';
        case 'AUD': return 'A$';
        case 'CAD': return 'C$';
        default: return '$';
    }
};

const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'AUD', 'CAD', 'CHF', 'CNY', 'SGD', 'THB', 'KRW'];

export function isValidCurrency(code) {
  return typeof code === 'string' && SUPPORTED_CURRENCIES.includes(code.toUpperCase());
}
