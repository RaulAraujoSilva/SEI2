import { describe, it, expect } from 'vitest'
import { POST as schedulePOST } from '@/app/api/schedule/route'

describe('API /api/schedule', () => {
  it('valida entrada e retorna nextRun', async () => {
    const req = new Request('http://localhost/api/schedule', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode: 'scheduled', type: 'daily', dailyTime: '09:00' }),
    })
    const res = await schedulePOST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.nextRun).toBeTruthy()
  }, 10000)
})


