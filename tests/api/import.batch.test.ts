import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST as batchPOST } from '@/app/api/import/batch/route'

vi.mock('@/lib/scrapers/sei', () => {
  return {
    fetchHtml: vi
      .fn()
      .mockImplementation((url: string) => (url.includes('ok') ? Promise.resolve('<html>ok</html>') : Promise.reject(new Error('404')))),
    parseSei: vi.fn().mockReturnValue({
      autuacao: { numero: 'SEI-123', tipo: 'T', dataGeracao: '2025-03-18', interessado: 'UENF' },
      protocolos: [],
      andamentos: [],
    }),
  }
})

describe('API /api/import/batch', () => {
  beforeEach(() => vi.clearAllMocks())

  it('processa URLs em lote com concorrência e agrega sucesso/falha', async () => {
    const req = new Request('http://localhost/api/import/batch', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ urls: ['https://sei/ok1', 'https://sei/fail1', 'https://sei/ok2'] }),
    })
    const res = await batchPOST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(2)
    expect(json.failed).toBe(1)
    expect(json.items.length).toBe(3)
  }, 10000)
})


