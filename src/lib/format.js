const RUPEE = '\u20B9'

export function rupees(amount) {
  return RUPEE + Math.round(amount).toLocaleString('en-IN')
}

export function shortDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function capitalise(text) {
  const value = String(text || '')
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function titleCase(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
