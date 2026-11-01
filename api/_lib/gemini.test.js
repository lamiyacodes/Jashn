/* global process */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { clean, extractJson, generateJson } from './gemini.js'

function geminiReply(object) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      candidates: [
        { content: { parts: [{ text: JSON.stringify(object) }] }, finishReason: 'STOP' },
      ],
    }),
  }
}

function failure(status) {
  return { ok: false, status, json: async () => ({}) }
}

describe('clean', () => {
  it('trims, removes line breaks and limits the length', () => {
    expect(clean('  hello\nworld  ', 50)).toBe('hello world')
    expect(clean('abcdefgh', 3)).toBe('abc')
  })

  it('turns missing values into an empty string', () => {
    expect(clean(undefined, 10)).toBe('')
    expect(clean(null, 10)).toBe('')
  })
})

describe('extractJson', () => {
  it('parses plain JSON', () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 })
  })

  it('strips markdown code fences', () => {
    expect(extractJson('```json\n{"a":1}\n```')).toEqual({ a: 1 })
  })

  it('finds JSON surrounded by extra text', () => {
    expect(extractJson('Here you go: {"a":1} Hope that helps')).toEqual({ a: 1 })
  })

  it('throws when there is no JSON', () => {
    expect(() => extractJson('no json here')).toThrow(/No JSON/)
  })
})

describe('generateJson', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
    process.env.GEMINI_API_KEY = 'test-key'
    delete process.env.GEMINI_MODEL
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    delete process.env.GEMINI_API_KEY
  })

  it('returns the validated result on the first success', async () => {
    fetchMock.mockResolvedValueOnce(geminiReply({ value: 7 }))
    const result = await generateJson({ prompt: 'x', validate: (p) => p.value })
    expect(result).toBe(7)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('retries once when Gemini is busy', async () => {
    fetchMock
      .mockResolvedValueOnce(failure(503))
      .mockResolvedValueOnce(geminiReply({ value: 9 }))
    const result = await generateJson({ prompt: 'x', validate: (p) => p.value, retryDelayMs: 0 })
    expect(result).toBe(9)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('switches to the lighter model when the first one keeps failing', async () => {
    fetchMock
      .mockResolvedValueOnce(failure(503))
      .mockResolvedValueOnce(failure(503))
      .mockResolvedValueOnce(geminiReply({ value: 3 }))
    const result = await generateJson({ prompt: 'x', validate: (p) => p.value, retryDelayMs: 0 })
    expect(result).toBe(3)
    expect(fetchMock.mock.calls[2][0]).toContain('gemini-flash-lite-latest')
  })

  it('does not retry a rejected key on the same model', async () => {
    fetchMock.mockResolvedValue(failure(403))
    await expect(
      generateJson({ prompt: 'x', validate: (p) => p, retryDelayMs: 0 })
    ).rejects.toMatchObject({ message: 'Gemini returned status 403', status: 502 })
    // One call per model, no repeated attempts on a key error.
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('retries when the reply fails validation', async () => {
    fetchMock
      .mockResolvedValueOnce(geminiReply({ bad: true }))
      .mockResolvedValueOnce(geminiReply({ value: 5 }))
    const validate = (p) => {
      if (p.value === undefined) throw new Error('missing value')
      return p.value
    }
    const result = await generateJson({ prompt: 'x', validate, retryDelayMs: 0 })
    expect(result).toBe(5)
  })

  it('fails with a clear error when the key is missing', async () => {
    delete process.env.GEMINI_API_KEY
    await expect(generateJson({ prompt: 'x', validate: (p) => p })).rejects.toMatchObject({
      status: 500,
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
