/**
 * Formats a number in Indian Rupee format (e.g. ₹17,92,580 or ₹17,92,580.33)
 * Follows Indian number grouping: ##,##,##,###
 */
export function formatINR(value: number | null | undefined, includeDecimals = false): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '₹0';
  }

  const isNegative = value < 0;
  const absVal = Math.abs(value);

  const rounded = includeDecimals ? absVal.toFixed(2) : Math.round(absVal).toString();
  const parts = rounded.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  let result = '';
  const len = integerPart.length;

  if (len <= 3) {
    result = integerPart;
  } else {
    // Last 3 digits
    const lastThree = integerPart.substring(len - 3);
    const remaining = integerPart.substring(0, len - 3);
    
    // Group remaining into pairs of 2 from right to left
    const groupedPairs = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    result = `${groupedPairs},${lastThree}`;
  }

  if (includeDecimals && decimalPart !== undefined) {
    result = `${result}.${decimalPart}`;
  }

  return `${isNegative ? '-' : ''}₹${result}`;
}

/**
 * Format compact INR for charts and badges (e.g., ₹17.9L or ₹1.8Cr)
 */
export function formatCompactINR(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  }
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(2)} L`;
  }
  if (abs >= 1000) {
    return `${sign}₹${(abs / 1000).toFixed(1)}k`;
  }
  return `${sign}₹${Math.round(abs)}`;
}

/**
 * Format percentage
 */
export function formatPercent(rate: number, decimals = 2): string {
  if (rate === null || rate === undefined || isNaN(rate)) return '0%';
  return `${Number(rate).toFixed(decimals).replace(/\.?0+$/, '')}%`;
}

/**
 * Format date for display: "18 Oct 2026"
 */
export function formatDisplayDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
    const d = new Date(Date.UTC(year, month - 1, day));
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format month & year for display: "October 2026"
 */
export function formatMonthYear(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
    const d = new Date(Date.UTC(year, month - 1, day));
    return d.toLocaleDateString('en-IN', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
  } catch {
    return dateStr;
  }
}
