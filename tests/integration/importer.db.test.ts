import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { getDb } from '@/lib/db'
import { importFromHtml } from '@/lib/services/importer'

function readFixture(name: string): string {
  const p = path.resolve(__dirname, '../fixtures/sei', name)
  return fs.readFileSync(p, 'utf8')
}

const hasDb = !!process.env.DATABASE_URL

describe.skipIf(!hasDb)('importer integration (DB)', () => {
  const db = getDb()!

  beforeAll(async () => {
    // limpar tabelas
    await db('TRUNCATE TABLE andamentos, protocolos, observacoes, processos RESTART IDENTITY;')
  })

  beforeEach(async () => {
    // garantir limpeza entre testes
    await db('TRUNCATE TABLE andamentos, protocolos RESTART IDENTITY;')
  })

  afterAll(async () => {
    // noop
  })

  it('inserção inicial: 1 processo → N protocolos/andamentos', async () => {
    const html = readFixture('exemplo1.html')
    const res = await importFromHtml('http://example', html)
    expect(res.novosProtocolos).toBeGreaterThanOrEqual(1)
    expect(res.novosAndamentos).toBeGreaterThanOrEqual(1)
    const rows = (await db('SELECT COUNT(*)::int as c FROM processos')) as any[]
    expect(rows[0].c).toBe(1)
  }, 20000)

  it('reimportação idêntica: 0 duplicatas', async () => {
    const html = readFixture('exemplo1.html')
    await importFromHtml('http://example', html)
    const again = await importFromHtml('http://example', html)
    expect(again.novosProtocolos).toBe(0)
    expect(again.novosAndamentos).toBe(0)
  }, 20000)

  it('incremental: novos itens inseridos', async () => {
    const html = readFixture('exemplo1.html')
    await importFromHtml('http://example', html)
    const html2 = readFixture('exemplo1_incremental.html')
    const res2 = await importFromHtml('http://example', html2)
    expect(res2.novosProtocolos).toBeGreaterThanOrEqual(1)
    expect(res2.novosAndamentos).toBeGreaterThanOrEqual(1)
  }, 20000)

  it('derivados atualizados: data_ultimo_andamento e ultima_unidade', async () => {
    const rows = (await db('SELECT data_ultimo_andamento, ultima_unidade FROM processos LIMIT 1')) as any[]
    expect(rows[0].data_ultimo_andamento).toBeTruthy()
    expect(rows[0].ultima_unidade).toBeTruthy()
  }, 10000)
})


