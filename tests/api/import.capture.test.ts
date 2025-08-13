import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST as capturePOST } from '@/app/api/import/capture/route'

vi.mock('@/lib/scrapers/sei', () => {
  return {
    fetchHtml: vi.fn().mockResolvedValue('<html>ok</html>'),
    parseSei: vi.fn().mockReturnValue({
      autuacao: {
        numero: 'SEI-123',
        tipo: 'Administrativo: Teste',
        dataGeracao: '2025-03-18',
        interessado: 'UENF',
      },
      protocolos: [
        { numero: '1', tipo: 'Anexo', data: '2025-03-18', dataInclusao: '2025-03-18', unidade: 'UENF/DIRCCH' },
      ],
      andamentos: [
        { dataHora: '2025-08-07T15:39:00.000Z', unidade: 'UENF/DIRCCH', descricao: 'Recebido' },
      ],
    }),
  }
})

describe('API /api/import/capture', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna preview a partir de URL válida', async () => {
    const req = new Request('http://localhost/api/import/capture', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url: 'https://sei.example/processo' }),
    })
    const res = await capturePOST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.numero).toBe('SEI-123')
    expect(json.protocolos.length).toBe(1)
    expect(json.andamentos.length).toBe(1)
  }, 10000)

  it('valida body inválido', async () => {
    const req = new Request('http://localhost/api/import/capture', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url: 'notaurl' }),
    })
    const res = await capturePOST(req)
    expect(res.status).toBe(400)
  }, 10000)
})


