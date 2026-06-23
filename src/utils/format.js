/**
 * Format a number as USD currency string.
 * @param {number} amount
 * @returns {string} e.g. "$1,299.00"
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format an ISO datetime string as a 12-hour time string (UTC timezone).
 * @param {string} iso - ISO 8601 datetime string
 * @returns {string} e.g. "9:00 AM"
 */
export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  })
}

/**
 * Format a YYYY-MM-DD date string as a full date label.
 * @param {string} dateStr - YYYY-MM-DD format
 * @returns {string} e.g. "Thursday, November 15, 2028"
 */
export function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00Z').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/**
 * Format a time range from two ISO strings.
 * @param {string} start - ISO start datetime
 * @param {string} end - ISO end datetime
 * @returns {string} e.g. "9:00 AM – 10:00 AM"
 */
export function formatTimeRange(start, end) {
  return `${formatTime(start)} – ${formatTime(end)}`
}
