import { describe, it, expect } from 'vitest'
import { GET as reportGET } from '@/app/api/report/route'
import { GET as processesGET } from '@/app/api/processes/route'
import { getDb } from '@/lib/db'
import { importFromHtml } from '@/lib/services/importer'
import fs from 'node:fs'
import path from 'node:path'

const hasDb = !!process.env.DATABASE_URL

function readFixture(name: string): string {
  const p = path.resolve(__dirname, '../fixtures/sei', name)
  return fs.readFileSync(p, 'utf8')
}

describe.skipIf(!hasDb)('report and filters (DB)', () => {
  const db = getDb()!
  it('gera relatório no período e filtra processos', async () => {
    await db('TRUNCATE TABLE andamentos, protocolos, observacoes, processos RESTART IDENTITY;')
    await importFromHtml('http://example', readFixture('exemplo1.html'))
    const r = await reportGET(new Request('http://localhost/api/report?start=2024-01-01&end=2026-01-01'))
    expect(r.status).toBe(200)
    const j = await r.json()
    expect(Array.isArray(j.processos)).toBe(true)
    expect(j.processos.length).toBeGreaterThan(0)

    const p = await processesGET(new Request('http://localhost/api/processes?q=SEI-260002'))
    expect(p.status).toBe(200)
    const pj = await p.json()
    expect(Array.isArray(pj.items)).toBe(true)
    expect(pj.items.find((x: any) => x.numero.includes('SEI-260002'))).toBeTruthy()
  }, 20000)
})


