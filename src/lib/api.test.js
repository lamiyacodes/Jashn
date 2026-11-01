import { describe, it, expect, vi, afterEach } from 'vitest'
import { postJson } from './api'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('postJson', () => {
  it('sends the body as JSON and returns the parsed reply', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ done: 1 }) })
    vi.stubGlobal('fetch', fetchMock)

    const result = await postJson('/api/x', { a: 1 })

    expect(result).toEqual({ done: 1 })
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/x',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ a: 1 }) })
    )
  })

  it('throws the server message together with the status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => ({ error: 'Gemini returned status 503' }),
      })
    )
    await expect(postJson('/api/x', {})).rejects.toThrow('Gemini returned status 503 (status 502)')
  })

  it('falls back to a generic reason when the body is not JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('not json')
        },
      })
    )
    await expect(postJson('/api/x', {})).rejects.toThrow('Request failed (status 500)')
  })
})
