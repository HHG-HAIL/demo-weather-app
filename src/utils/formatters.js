/**
 * Formats a number to remove decimal places
 * @param {number} value - The number to format
 * @returns {string} - The formatted number as a string (e.g., 72.5 becomes "73")
 */
export const formatNumber = (value) => {
  return value.toFixed();
};
