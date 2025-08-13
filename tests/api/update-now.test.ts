import { describe, it, expect, vi } from 'vitest'
import { POST as updateNowPOST } from '@/app/api/processes/update-now/route'

vi.mock('@/lib/db', () => {
  return {
    getDb: () => null, // força caminho sem DB para smoke test
  }
})

describe('API /api/processes/update-now', () => {
  it('retorna 202 com jobId quando DB não está configurado', async () => {
    const res = await updateNowPOST()
    expect(res.status).toBe(202)
    const json = await res.json()
    expect(json.jobId).toBeTruthy()
  })
})


