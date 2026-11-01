/**
 * Turns the model's ideas reply into the shape the app expects.
 */
export function shapeIdeas(parsed) {
  if (!parsed || !Array.isArray(parsed.ideas) || parsed.ideas.length === 0) {
    throw new Error('AI reply had no ideas')
  }
  return {
    summary: String(parsed.summary || ''),
    ideas: parsed.ideas.slice(0, 6).map((idea) => ({
      title: String(idea?.title || ''),
      detail: String(idea?.detail || ''),
    })),
    tips: Array.isArray(parsed.tips) ? parsed.tips.slice(0, 5).map(String) : [],
  }
}

/**
 * Matches the model's categories to the originals by name,
 * then rescales the percentages so they add up to exactly 100.
 */
export function normaliseBudget(categories, aiBudget) {
  if (!Array.isArray(aiBudget)) throw new Error('AI reply had no budget')

  const byName = new Map()
  for (const row of aiBudget) {
    byName.set(String(row?.name || '').trim().toLowerCase(), Number(row?.pct))
  }

  const raw = categories.map((category) => {
    const value = byName.get(category.name.trim().toLowerCase())
    if (!Number.isFinite(value) || value < 0) {
      throw new Error('AI budget did not match the categories')
    }
    return value
  })

  const total = raw.reduce((a, b) => a + b, 0)
  if (!(total > 0)) throw new Error('AI budget had no positive values')

  const scaled = raw.map((value) => Math.round((value / total) * 100))
  const diff = 100 - scaled.reduce((a, b) => a + b, 0)
  if (diff !== 0) {
    let largest = 0
    scaled.forEach((value, i) => {
      if (value > scaled[largest]) largest = i
    })
    scaled[largest] += diff
  }

  return categories.map((category, i) => ({ name: category.name, pct: scaled[i] }))
}
