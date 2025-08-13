import { describe, it, expect } from 'vitest'
import { POST as updateNowPOST } from '@/app/api/processes/update-now/route'
import { getDb } from '@/lib/db'
import { importFromHtml } from '@/lib/services/importer'
import fs from 'node:fs'
import path from 'node:path'

const hasDb = !!process.env.DATABASE_URL

function readFixture(name: string): string {
  const p = path.resolve(__dirname, '../fixtures/sei', name)
  return fs.readFileSync(p, 'utf8')
}

describe.skipIf(!hasDb)('update-now integration (DB)', () => {
  const db = getDb()!
  it('executa delta e reporta novos itens', async () => {
    // arrange: importar base
    await db('TRUNCATE TABLE andamentos, protocolos, observacoes, processos RESTART IDENTITY;')
    await importFromHtml('http://example', readFixture('exemplo1.html'))
    // importar incremento
    await importFromHtml('http://example', readFixture('exemplo1_incremental.html'))
    // marcar source_url para update-now (se não ficou salvo)
    await db("UPDATE processos SET source_url = 'http://example' WHERE source_url IS NULL;")
    const res = await updateNowPOST()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.processes).toBeGreaterThan(0)
    // como já importamos incremento antes, delta agora deve ser 0
    expect(json.novosProtocolos).toBe(0)
    expect(json.novosAndamentos).toBe(0)
  }, 20000)
})


