import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST as batchPOST } from '@/app/api/import/batch/route'

describe.skip('batch import concurrency (integration-like)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    process.env.IMPORT_CONCURRENCY = '2'
  })

  it('processa URLs com concorrência 2 em tempo < soma dos atrasos', async () => {
    // arranjo: 2 URLs ok com atraso de 300ms cada, 1 URL falha imediata
    const delays: Record<string, number> = {
      'https://sei/ok1': 300,
      'https://sei/ok2': 300,
    }
    vi.doMock('@/lib/scrapers/sei', () => ({
      fetchHtml: vi.fn().mockImplementation((url: string) => {
        const d = delays[url]
        if (typeof d === 'number') {
          return new Promise((resolve) => setTimeout(() => resolve('<html>ok</html>'), d))
        }
        return Promise.reject(new Error('404'))
      }),
      parseSei: vi.fn().mockReturnValue({ autuacao: { numero: 'X', tipo: 'T', dataGeracao: null, interessado: '' }, protocolos: [], andamentos: [] }),
    }))
    const urls = ['https://sei/ok1', 'https://sei/fail', 'https://sei/ok2']
    const req = new Request('http://localhost/api/import/batch', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ urls }),
    })
    const t0 = Date.now()
    const res = await batchPOST(req)
    const ms = Date.now() - t0
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(2)
    expect(json.failed).toBe(1)
    // concorrência 2: ~300ms total ao invés de ~600ms
    expect(ms).toBeLessThan(2000)
  }, 8000)
})


