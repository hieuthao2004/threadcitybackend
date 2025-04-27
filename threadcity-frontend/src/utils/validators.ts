export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) return 'Email is required';
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters long';
  return null;
};

export const validateUsername = (username: string): string | null => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  if (!username.trim()) return 'Username is required';
  if (!usernameRegex.test(username)) {
    return 'Username must be 3-20 characters and can only contain letters, numbers, and underscores';
  }
  return null;
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return null;
};

export const validateRequiredField = (value: string, fieldName: string): string | null => {
  if (!value.trim()) return `${fieldName} is required`;
  return null;
};