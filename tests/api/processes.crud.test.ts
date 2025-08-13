import { describe, it, expect } from 'vitest'
import { GET as listGET, POST as createPOST } from '@/app/api/processes/route'

describe('API /api/processes (CRUD mínima)', () => {
  it('cria processo quando sem DB configurado (mock)', async () => {
    const req = new Request('http://localhost/api/processes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ numero: 'SEI-XYZ', tipo: 'T', interessado: 'UENF' }),
    })
    const res = await createPOST(req)
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.id).toBeTruthy()
  }, 10000)

  it('lista processos (mock list)', async () => {
    const req = new Request('http://localhost/api/processes?q=SEI', { method: 'GET' })
    const res = await listGET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json.items)).toBe(true)
  }, 10000)
})


