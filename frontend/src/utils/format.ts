/**
 * Utility functions for formatting and data conversion
 */

/**
 * Safely converts a value to a number
 * @param value - The value to convert
 * @returns The number value or 0 if conversion fails
 */
export const toNumber = (value: any): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}

/**
 * Formats a number as currency
 * @param amount - The amount to format
 * @param currency - The currency symbol (default: '$')
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: any, currency: string = '$', decimals: number = 2): string => {
  const numAmount = toNumber(amount)
  return `${currency}${numAmount.toFixed(decimals)}`
}

/**
 * Formats a number as percentage
 * @param value - The value to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: any, decimals: number = 1): string => {
  const numValue = toNumber(value)
  return `${numValue.toFixed(decimals)}%`
}

/**
 * Safely converts API response data to ensure numbers are properly typed
 * @param data - The data object to convert
 * @returns The converted data with proper number types
 */
export const convertApiData = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(convertApiData)
  }
  
  if (data && typeof data === 'object') {
    const converted: any = {}
    for (const [key, value] of Object.entries(data)) {
      if (key.includes('amount') || key.includes('price') || key.includes('value')) {
        converted[key] = toNumber(value)
      } else if (typeof value === 'object') {
        converted[key] = convertApiData(value)
      } else {
        converted[key] = value
      }
    }
    return converted
  }
  
  return data
}
