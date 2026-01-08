import { format } from 'date-fns';

// Date formatting
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return '';
  return format(new Date(date), formatStr);
};

// Currency Formatting
export const formatCurrency = (amount, currency = 'AED') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Cut the text and add ...
export const truncateText = (text, length = 50) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

// Check permissions
export const hasPermission = (user, requiredRole) => {
  if (!user || !user.role) return false;
  return user.role === requiredRole;
};

// Converting data for Formik
export const prepareFormData = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  return formData;
};
