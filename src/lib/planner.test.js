import { describe, it, expect } from 'vitest'
import { EVENT_TYPES, buildPlan, fallbackSuggestions } from './planner'

function dateInDays(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

function baseForm(overrides = {}) {
  return {
    type: 'wedding',
    customType: '',
    guests: 100,
    budget: 500000,
    date: dateInDays(200),
    city: 'Varanasi',
    vibe: '',
    ...overrides,
  }
}

describe('event templates', () => {
  it('has a budget split that adds up to 100 percent for every event type', () => {
    for (const [key, template] of Object.entries(EVENT_TYPES)) {
      const total = template.split.reduce((sum, [, pct]) => sum + pct, 0)
      expect(total, key).toBe(100)
    }
  })

  it('keeps a contingency line in every budget split', () => {
    for (const [key, template] of Object.entries(EVENT_TYPES)) {
      const names = template.split.map(([name]) => name)
      expect(names, key).toContain('Contingency')
    }
  })

  it('counts the timeline down to the event day', () => {
    for (const [key, template] of Object.entries(EVENT_TYPES)) {
      const weeks = template.timeline.map(([w]) => w)
      for (let i = 0; i < weeks.length - 1; i++) {
        expect(weeks[i], key).toBeGreaterThan(weeks[i + 1])
      }
      expect(weeks[weeks.length - 1], key).toBe(0)
    }
  })

  it('has at least one vendor for every event type', () => {
    for (const [key, template] of Object.entries(EVENT_TYPES)) {
      expect(template.vendors.length, key).toBeGreaterThan(0)
    }
  })
})

describe('buildPlan', () => {
  it('converts the percentage split into rupee amounts', () => {
    const plan = buildPlan(baseForm())
    expect(plan.error).toBeUndefined()
    expect(plan.budget[0].name).toBe('Venue')
    expect(plan.budget[0].amount).toBe(125000)
  })

  it('keeps the rupee amounts close to the total budget', () => {
    const plan = buildPlan(baseForm({ budget: 333333 }))
    const sum = plan.budget.reduce((s, item) => s + item.amount, 0)
    expect(Math.abs(sum - plan.total)).toBeLessThanOrEqual(plan.budget.length)
  })

  it('works out the cost per guest', () => {
    const plan = buildPlan(baseForm({ budget: 500000, guests: 100 }))
    expect(plan.perGuest).toBe(5000)
  })

  it('counts the days remaining', () => {
    const plan = buildPlan(baseForm({ date: dateInDays(30) }))
    expect(plan.daysLeft).toBe(30)
  })

  it('does not compress the schedule when the event is far away', () => {
    const plan = buildPlan(baseForm({ date: dateInDays(300) }))
    expect(plan.compressed).toBe(false)
  })

  it('compresses the schedule when the event is close', () => {
    const plan = buildPlan(baseForm({ date: dateInDays(5) }))
    expect(plan.compressed).toBe(true)

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const firstDue = new Date(plan.timeline[0].due)
    expect(firstDue.getTime()).toBeGreaterThanOrEqual(startOfToday.getTime())
  })

  it('ends the timeline on the event date', () => {
    const form = baseForm({ date: dateInDays(60) })
    const plan = buildPlan(form)
    const last = new Date(plan.timeline[plan.timeline.length - 1].due)
    expect(last.getTime()).toBe(new Date(form.date + 'T00:00:00').getTime())
  })

  it('accepts a custom event type with a description', () => {
    const plan = buildPlan(baseForm({ type: 'other', customType: 'Housewarming' }))
    expect(plan.error).toBeUndefined()
    expect(plan.budget.length).toBe(EVENT_TYPES.other.split.length)
  })

  it('asks for a description when the custom event type is empty', () => {
    const plan = buildPlan(baseForm({ type: 'other', customType: '   ' }))
    expect(plan.error).toMatch(/describe/i)
  })

  it('rejects an unknown event type', () => {
    const plan = buildPlan(baseForm({ type: 'carnival' }))
    expect(plan.error).toMatch(/event type/i)
  })

  it('rejects a missing or zero budget', () => {
    expect(buildPlan(baseForm({ budget: 0 })).error).toMatch(/budget/i)
    expect(buildPlan(baseForm({ budget: '' })).error).toMatch(/budget/i)
  })

  it('rejects a missing or zero guest count', () => {
    expect(buildPlan(baseForm({ guests: 0 })).error).toMatch(/guests/i)
  })

  it('rejects a missing date', () => {
    expect(buildPlan(baseForm({ date: '' })).error).toMatch(/date/i)
  })

  it('rejects a date in the past', () => {
    expect(buildPlan(baseForm({ date: dateInDays(-3) })).error).toMatch(/past/i)
  })
})

describe('fallbackSuggestions', () => {
  it('gives four ideas and three tips for every event type', () => {
    for (const key of Object.keys(EVENT_TYPES)) {
      const result = fallbackSuggestions(baseForm({ type: key, customType: 'Reunion' }))
      expect(result.ideas.length, key).toBe(4)
      expect(result.tips.length, key).toBe(3)
    }
  })

  it('mentions the guest count, city and theme in the summary', () => {
    const result = fallbackSuggestions(baseForm({ vibe: 'pastel' }))
    expect(result.summary).toContain('100')
    expect(result.summary).toContain('Varanasi')
    expect(result.summary).toContain('pastel')
  })

  it('uses the custom event name when the type is Other', () => {
    const result = fallbackSuggestions(baseForm({ type: 'other', customType: 'Housewarming' }))
    expect(result.summary).toContain('Housewarming')
  })
})
