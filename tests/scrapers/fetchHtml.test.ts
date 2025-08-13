import { describe, it, expect, vi } from 'vitest'
import { fetchHtml } from '@/lib/scrapers/sei'

describe('fetchHtml with retry/backoff', () => {
  it('reintenta em 429 e retorna sucesso na segunda tentativa', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 429 })
      .mockResolvedValueOnce({ ok: true, status: 200, text: async () => '<html>ok</html>' })
    // @ts-expect-error override global
    global.fetch = mockFetch
    const html = await fetchHtml('http://example', 200)
    expect(html).toContain('ok')
    expect(mockFetch).toHaveBeenCalledTimes(2)
  }, 10000)
})


