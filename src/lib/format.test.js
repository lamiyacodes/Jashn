import { describe, it, expect } from 'vitest'
import { capitalise, rupees, shortDate, titleCase } from './format'

describe('rupees', () => {
  it('uses Indian digit grouping', () => {
    expect(rupees(1000000)).toBe('\u20B910,00,000')
    expect(rupees(250000)).toBe('\u20B92,50,000')
  })

  it('rounds to whole rupees', () => {
    expect(rupees(1234.6)).toBe('\u20B91,235')
  })

  it('handles zero', () => {
    expect(rupees(0)).toBe('\u20B90')
  })
})

describe('shortDate', () => {
  it('formats a date as day, short month and year', () => {
    expect(shortDate('2026-11-07T00:00:00')).toBe('7 Nov 2026')
  })
})

describe('capitalise', () => {
  it('upper-cases only the first letter', () => {
    expect(capitalise('wedding')).toBe('Wedding')
    expect(capitalise('baby shower')).toBe('Baby shower')
  })

  it('handles empty and missing values', () => {
    expect(capitalise('')).toBe('')
    expect(capitalise(undefined)).toBe('')
  })
})

describe('titleCase', () => {
  it('capitalises every word and lowers the rest', () => {
    expect(titleCase('VARANASI')).toBe('Varanasi')
    expect(titleCase('new delhi')).toBe('New Delhi')
  })

  it('trims and collapses extra spaces', () => {
    expect(titleCase('  new   delhi  ')).toBe('New Delhi')
  })

  it('handles empty and missing values', () => {
    expect(titleCase('')).toBe('')
    expect(titleCase(undefined)).toBe('')
  })
})
