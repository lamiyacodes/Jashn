const PREFIX = 'jashn-ideas:'

const normalise = (value) => String(value ?? '').trim().toLowerCase()

/** Builds a cache key from the fields that change the AI's answer. */
export function ideasCacheKey(form) {
  return (
    PREFIX +
    JSON.stringify([
      normalise(form.type),
      normalise(form.customType),
      Number(form.guests),
      Number(form.budget),
      normalise(form.date),
      normalise(form.city),
      normalise(form.vibe),
    ])
  )
}

export function readCachedIdeas(form) {
  try {
    const raw = sessionStorage.getItem(ideasCacheKey(form))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function cacheIdeas(form, ideas) {
  try {
    sessionStorage.setItem(ideasCacheKey(form), JSON.stringify(ideas))
  } catch {
    // Storage may be unavailable; the app still works without the cache.
  }
}
