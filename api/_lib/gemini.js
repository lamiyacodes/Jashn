/* global process */

const CALL_TIMEOUT_MS = 11000
const TOTAL_BUDGET_MS = 24000
const RETRYABLE_STATUSES = [429, 500, 502, 503, 504]
const FALLBACK_MODEL = 'gemini-flash-lite-latest'

export function clean(value, max) {
  return String(value ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, max)
}

export function extractJson(text) {
  const stripped = String(text || '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim()
  const start = stripped.indexOf('{')
  const end = stripped.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No JSON found in AI reply')
  }
  return JSON.parse(stripped.slice(start, end + 1))
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function retryable(message) {
  return Object.assign(new Error(message), { retryable: true })
}

async function callModel({ prompt, apiKey, model, temperature, maxOutputTokens }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), CALL_TIMEOUT_MS)

  let response
  try {
    response = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature,
          maxOutputTokens,
        },
      }),
    })
  } catch {
    throw retryable('Gemini did not respond in time')
  } finally {
    clearTimeout(timer)
  }

  if (!response.ok) {
    const error = new Error(`Gemini returned status ${response.status}`)
    // Busy or temporary errors are worth retrying; key or model errors are not.
    error.retryable = RETRYABLE_STATUSES.includes(response.status)
    throw error
  }

  const data = await response.json()
  const candidate = data?.candidates?.[0]
  const text = candidate?.content?.parts?.map((p) => p.text || '').join('')
  const reason = candidate?.finishReason || 'unknown'
  if (!text) throw retryable(`Empty AI reply (finish reason: ${reason})`)

  try {
    return extractJson(text)
  } catch {
    throw retryable(`Unreadable AI reply (finish reason: ${reason})`)
  }
}

/**
 * Asks Gemini for JSON and returns validate(parsed).
 * Retries once on temporary errors, then tries a lighter backup model.
 * Errors carry a status (500 for a missing key, 502 for an AI failure).
 */
export async function generateJson({
  prompt,
  validate,
  temperature = 0.7,
  maxOutputTokens = 4096,
  retryDelayMs = 1200,
}) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw Object.assign(new Error('Server is missing GEMINI_API_KEY'), { status: 500 })
  }

  const primary = process.env.GEMINI_MODEL || 'gemini-flash-latest'
  const models = [...new Set([primary, FALLBACK_MODEL])]
  const startedAt = Date.now()
  let lastError = 'AI request failed'

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      if (Date.now() - startedAt > TOTAL_BUDGET_MS) break

      try {
        const parsed = await callModel({ prompt, apiKey, model, temperature, maxOutputTokens })
        return validate(parsed)
      } catch (err) {
        lastError = err.message || 'AI request failed'
        if (err.retryable === false) break
        if (attempt === 0) await sleep(retryDelayMs)
      }
    }
  }

  throw Object.assign(new Error(lastError), { status: 502 })
}
