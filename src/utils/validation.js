import { isValidCurrency } from './currency.js';

// Expense validation
export function validateExpenseData(data) {
  const errors = [];
  const allowed = [
    'amount', 'category', 'currency', 'description', 'paidBy', 
    'splitDetails', 'splitMethod', 'date', 'dayId',
    'userName', 'userId', 'splitType', 'createdAt', 'updatedAt'
  ];
  const extraKeys = Object.keys(data).filter(k => !allowed.includes(k));
  if (extraKeys.length) errors.push(`Unknown fields: ${extraKeys.join(', ')}`);
  
  if (data.amount === undefined || data.amount === null) errors.push('Amount is required');
  else {
    const amt = Number(data.amount);
    if (isNaN(amt) || amt <= 0) errors.push('Amount must be a positive number');
    if (amt > 999999999) errors.push('Amount is unreasonably large');
  }
  
  if (data.category && typeof data.category !== 'string') errors.push('Category must be a string');
  if (data.category && data.category.length > 50) errors.push('Category too long');
  if (data.description && typeof data.description !== 'string') errors.push('Description must be a string');
  if (data.description && data.description.length > 500) errors.push('Description too long');
  if (data.paidBy && typeof data.paidBy !== 'string') errors.push('paidBy must be a string');
  if (data.currency && !isValidCurrency(data.currency)) errors.push('Invalid currency code');
  
  // Validate splitDetails if present
  if (data.splitDetails) {
    if (typeof data.splitDetails !== 'object' || Array.isArray(data.splitDetails)) {
      errors.push('splitDetails must be an object');
    } else {
      const totalSplit = Object.values(data.splitDetails).reduce((sum, v) => sum + Number(v || 0), 0);
      if (Math.abs(totalSplit - Number(data.amount)) > 0.02) {
        errors.push(`Split total (${totalSplit}) does not match amount (${data.amount})`);
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
}

// Profile validation
export function validateProfileData(data) {
  const errors = [];
  const allowed = [
    'identity', 'preferences', 'behavior', 'completenessScore',
    'metadata', 'displayName', 'photoURL', 'email', 'updatedAt', 'metadata.completenessScore'
  ];
  const extraKeys = Object.keys(data).filter(k => !allowed.includes(k));
  if (extraKeys.length) errors.push(`Unknown fields: ${extraKeys.join(', ')}`);
  
  if (data.identity) {
    if (data.identity.displayName && data.identity.displayName.length > 100) errors.push('Display name too long');
    if (data.identity.bio && data.identity.bio.length > 1000) errors.push('Bio too long');
    if (data.identity.phoneNumber && !/^[\d\s\-\+\(\)]{5,20}$/.test(data.identity.phoneNumber)) errors.push('Invalid phone number');
  }
  
  if (data.behavior) {
    if (data.behavior.dailyBudgetSoftLimit !== undefined) {
      const b = Number(data.behavior.dailyBudgetSoftLimit);
      if (isNaN(b) || b < 0 || b > 999999999) errors.push('Invalid daily budget limit');
    }
    if (data.behavior.defaultCurrency && !isValidCurrency(data.behavior.defaultCurrency)) {
      errors.push('Invalid default currency code');
    }
  }
  if (data['behavior.defaultCurrency'] && !isValidCurrency(data['behavior.defaultCurrency'])) {
    errors.push('Invalid default currency code');
  }
  
  return { valid: errors.length === 0, errors };
}

// Notification validation
export function validateNotificationData(data) {
  // If title is missing, populate it from message or type to satisfy validation
  if (!data.title) {
    data.title = data.message || data.type || 'Notification';
  }
  // Normalize type if needed to match allowed types
  if (data.type === 'trip_invite') data.type = 'invite';
  if (data.type === 'trip_delete') data.type = 'info';

  const errors = [];
  const allowed = [
    'title', 'message', 'type', 'tripId', 'tripName', 'actionUrl', 'read',
    'senderId', 'senderName', 'timestamp', 'link'
  ];
  const extraKeys = Object.keys(data).filter(k => !allowed.includes(k));
  if (extraKeys.length) errors.push(`Unknown fields: ${extraKeys.join(', ')}`);
  if (!data.title || typeof data.title !== 'string') errors.push('Title is required and must be a string');
  if (data.title && data.title.length > 200) errors.push('Title too long');
  if (data.message && data.message.length > 1000) errors.push('Message too long');
  if (data.type && !['info', 'success', 'warning', 'invite', 'expense'].includes(data.type)) errors.push('Invalid notification type');
  return { valid: errors.length === 0, errors };
}

export const AUTH_ERROR_MESSAGES = {
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Invalid email or password.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/weak-password': 'Password is too weak.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/network-request-failed': 'Network error. Please check your connection.',
};
