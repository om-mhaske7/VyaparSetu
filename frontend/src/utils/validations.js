// Validation utility functions with regex patterns

/**
 * Validate email format
 * @param {string} email 
 * @returns {object} { isValid: boolean, message: string }
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return { isValid: false, message: 'Email is required' };
  }
  
  // RFC 5322 compliant email regex
  const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate password
 * @param {string} password 
 * @returns {object} { isValid: boolean, message: string }
 */
export const validatePassword = (password) => {
  if (!password || password.trim() === '') {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate Indian phone number
 * @param {string} phone 
 * @returns {object} { isValid: boolean, message: string }
 */
export const validatePhone = (phone) => {
  if (!phone || phone.trim() === '') {
    return { isValid: false, message: 'Phone number is required' };
  }
  
  // Indian phone number regex: 10 digits starting with 6,7,8,9
  const phoneRegex = /^[6-9]\d{9}$/;
  const cleanPhone = phone.replace(/\s+/g, '').replace(/[()-]/g, '');
  
  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, message: 'Please enter a valid 10-digit Indian phone number' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate name (person/business name)
 * @param {string} name 
 * @returns {object} { isValid: boolean, message: string }
 */
export const validateName = (name) => {
  if (!name || name.trim() === '') {
    return { isValid: false, message: 'Name is required' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters long' };
  }
  
  if (name.trim().length > 100) {
    return { isValid: false, message: 'Name must be less than 100 characters' };
  }
  
  // Allow letters, spaces, hyphens, apostrophes for names
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  
  if (!nameRegex.test(name.trim())) {
    return { isValid: false, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate address
 * @param {string} address 
 * @returns {object} { isValid: boolean, message: string }
 */
export const validateAddress = (address) => {
  if (!address || address.trim() === '') {
    return { isValid: false, message: 'Address is required' };
  }
  
  if (address.trim().length < 10) {
    return { isValid: false, message: 'Please enter a complete address (at least 10 characters)' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate IFSC code (Indian Financial System Code)
 * @param {string} ifsc 
 * @returns {object} { isValid: boolean, message: string }
 */
export const validateIFSC = (ifsc) => {
  if (!ifsc || ifsc.trim() === '') {
    return { isValid: false, message: 'IFSC code is required' };
  }
  
  // IFSC format: 4 letters followed by 0 and 6 alphanumeric characters
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  
  if (!ifscRegex.test(ifsc.trim().toUpperCase())) {
    return { isValid: false, message: 'Please enter a valid IFSC code (e.g., ABCD0123456)' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate bank account number
 * @param {string} accountNumber 
 * @returns {object} { isValid: boolean, message: string }
 */
export const validateAccountNumber = (accountNumber) => {
  if (!accountNumber || accountNumber.trim() === '') {
    return { isValid: false, message: 'Account number is required' };
  }
  
  // Account numbers are typically 9-18 digits
  const accountRegex = /^\d{9,18}$/;
  
  if (!accountRegex.test(accountNumber.trim())) {
    return { isValid: false, message: 'Account number must be 9-18 digits' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate UPI ID
 * @param {string} upiId 
 * @returns {object} { isValid: boolean, message: string }
 */
export const validateUPI = (upiId) => {
  if (!upiId || upiId.trim() === '') {
    return { isValid: false, message: 'UPI ID is required' };
  }
  
  // UPI ID format: username@bankname or phone@bankname
  const upiRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9]+$/;
  
  if (!upiRegex.test(upiId.trim())) {
    return { isValid: false, message: 'Please enter a valid UPI ID (e.g., yourname@bankname)' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate price (positive number with optional decimals)
 * @param {string|number} price 
 * @returns {object} { isValid: boolean, message: string }
 */
export const validatePrice = (price) => {
  if (price === '' || price === null || price === undefined) {
    return { isValid: false, message: 'Price is required' };
  }
  
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    return { isValid: false, message: 'Price must be a valid number' };
  }
  
  if (numPrice <= 0) {
    return { isValid: false, message: 'Price must be greater than 0' };
  }
  
  if (numPrice > 999999) {
    return { isValid: false, message: 'Price cannot exceed ₹9,99,999' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate stock quantity
 * @param {string|number} quantity 
 * @returns {object} { isValid: boolean, message: string }
 */
export const validateStockQuantity = (quantity) => {
  if (quantity === '' || quantity === null || quantity === undefined) {
    return { isValid: false, message: 'Stock quantity is required' };
  }
  
  const numQty = typeof quantity === 'string' ? parseInt(quantity, 10) : quantity;
  
  if (isNaN(numQty)) {
    return { isValid: false, message: 'Quantity must be a valid number' };
  }
  
  if (numQty < 0) {
    return { isValid: false, message: 'Quantity cannot be negative' };
  }
  
  if (numQty > 9999999) {
    return { isValid: false, message: 'Quantity cannot exceed 9,999,999' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate product name
 * @param {string} productName 
 * @returns {object} { isValid: boolean, message: string }
 */
export const validateProductName = (productName) => {
  if (!productName || productName.trim() === '') {
    return { isValid: false, message: 'Product name is required' };
  }
  
  if (productName.trim().length < 3) {
    return { isValid: false, message: 'Product name must be at least 3 characters long' };
  }
  
  if (productName.trim().length > 100) {
    return { isValid: false, message: 'Product name must be less than 100 characters' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate description
 * @param {string} description 
 * @param {number} minLength 
 * @returns {object} { isValid: boolean, message: string }
 */
export const validateDescription = (description, minLength = 10) => {
  if (!description || description.trim() === '') {
    return { isValid: false, message: 'Description is required' };
  }
  
  if (description.trim().length < minLength) {
    return { isValid: false, message: `Description must be at least ${minLength} characters long` };
  }
  
  if (description.trim().length > 500) {
    return { isValid: false, message: 'Description must be less than 500 characters' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate file upload
 * @param {File} file 
 * @param {object} options 
 * @returns {object} { isValid: boolean, message: string }
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSizeMB = 2,
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  } = options;
  
  if (!file) {
    return { isValid: false, message: 'File is required' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, message: 'Please upload a valid image file (JPG, PNG, or WebP)' };
  }
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { isValid: false, message: `File size must be less than ${maxSizeMB}MB` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Clean phone number to digits only
 * @param {string} phone 
 * @returns {string}
 */
export const cleanPhoneNumber = (phone) => {
  if (!phone) return '';
  return phone.replace(/\s+/g, '').replace(/[()-]/g, '');
};

/**
 * Format IFSC code to uppercase
 * @param {string} ifsc 
 * @returns {string}
 */
export const formatIFSC = (ifsc) => {
  if (!ifsc) return '';
  return ifsc.trim().toUpperCase();
};

/**
 * Format UPI ID to lowercase
 * @param {string} upiId 
 * @returns {string}
 */
export const formatUPI = (upiId) => {
  if (!upiId) return '';
  return upiId.trim().toLowerCase();
};

