import { describe, it, expect } from 'vitest'
import { normaliseBudget, shapeIdeas } from './shape.js'

const categories = [
  { name: 'Venue', pct: 25 },
  { name: 'Catering', pct: 30 },
  { name: 'Decor', pct: 45 },
]

const sum = (rows) => rows.reduce((total, row) => total + row.pct, 0)

describe('normaliseBudget', () => {
  it('keeps the category names and their order', () => {
    const result = normaliseBudget(categories, [
      { name: 'Decor', pct: 20 },
      { name: 'Venue', pct: 30 },
      { name: 'Catering', pct: 50 },
    ])
    expect(result.map((r) => r.name)).toEqual(['Venue', 'Catering', 'Decor'])
    expect(result.map((r) => r.pct)).toEqual([30, 50, 20])
  })

  it('rescales percentages that do not add up to 100', () => {
    const result = normaliseBudget(categories, [
      { name: 'Venue', pct: 10 },
      { name: 'Catering', pct: 20 },
      { name: 'Decor', pct: 30 },
    ])
    expect(sum(result)).toBe(100)
  })

  it('fixes rounding so the total is exactly 100', () => {
    const result = normaliseBudget(categories, [
      { name: 'Venue', pct: 1 },
      { name: 'Catering', pct: 1 },
      { name: 'Decor', pct: 1 },
    ])
    expect(sum(result)).toBe(100)
  })

  it('matches names regardless of case and spacing', () => {
    const result = normaliseBudget(categories, [
      { name: ' venue ', pct: 40 },
      { name: 'CATERING', pct: 40 },
      { name: 'decor', pct: 20 },
    ])
    expect(result.map((r) => r.pct)).toEqual([40, 40, 20])
  })

  it('rejects a reply that is missing a category', () => {
    expect(() =>
      normaliseBudget(categories, [
        { name: 'Venue', pct: 50 },
        { name: 'Catering', pct: 50 },
      ])
    ).toThrow(/did not match/)
  })

  it('rejects negative or non-numeric percentages', () => {
    expect(() =>
      normaliseBudget(categories, [
        { name: 'Venue', pct: -5 },
        { name: 'Catering', pct: 50 },
        { name: 'Decor', pct: 55 },
      ])
    ).toThrow()
    expect(() =>
      normaliseBudget(categories, [
        { name: 'Venue', pct: 'lots' },
        { name: 'Catering', pct: 50 },
        { name: 'Decor', pct: 50 },
      ])
    ).toThrow()
  })

  it('rejects a reply that is not a list', () => {
    expect(() => normaliseBudget(categories, undefined)).toThrow(/no budget/)
  })
})

describe('shapeIdeas', () => {
  it('limits ideas to six and tips to five', () => {
    const parsed = {
      summary: 'A plan',
      ideas: Array.from({ length: 9 }, (_, i) => ({ title: 'T' + i, detail: 'D' + i })),
      tips: Array.from({ length: 8 }, (_, i) => 'tip ' + i),
    }
    const result = shapeIdeas(parsed)
    expect(result.ideas).toHaveLength(6)
    expect(result.tips).toHaveLength(5)
  })

  it('turns missing fields into empty strings and an empty tips list', () => {
    const result = shapeIdeas({ ideas: [{}] })
    expect(result.summary).toBe('')
    expect(result.ideas[0]).toEqual({ title: '', detail: '' })
    expect(result.tips).toEqual([])
  })

  it('throws when there are no ideas', () => {
    expect(() => shapeIdeas({ ideas: [] })).toThrow(/no ideas/)
    expect(() => shapeIdeas(null)).toThrow(/no ideas/)
  })
})
