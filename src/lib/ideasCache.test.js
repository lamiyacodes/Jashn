import { describe, it, expect } from 'vitest'
import { ideasCacheKey } from './ideasCache'

const base = {
  type: 'wedding',
  customType: '',
  guests: 100,
  budget: 500000,
  date: '2026-12-01',
  city: 'Varanasi',
  vibe: '',
}

describe('ideasCacheKey', () => {
  it('ignores case and extra spaces in text fields', () => {
    expect(ideasCacheKey({ ...base, city: '  varanasi ' })).toBe(ideasCacheKey(base))
  })

  it('treats numbers typed as text the same as numbers', () => {
    expect(ideasCacheKey({ ...base, guests: '100', budget: '500000' })).toBe(ideasCacheKey(base))
  })

  it('changes when the budget changes', () => {
    expect(ideasCacheKey({ ...base, budget: 600000 })).not.toBe(ideasCacheKey(base))
  })

  it('changes when the event type changes', () => {
    expect(ideasCacheKey({ ...base, type: 'birthday' })).not.toBe(ideasCacheKey(base))
  })
})
