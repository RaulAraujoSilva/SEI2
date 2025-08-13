import { describe, it, expect, beforeAll, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import * as processesRepo from '@/lib/repositories/processes'
import * as protRepo from '@/lib/repositories/protocolos'
import * as andRepo from '@/lib/repositories/andamentos'
import { importFromHtml } from '@/lib/services/importer'

function readFixture(name: string): string {
  const p = path.resolve(__dirname, '../fixtures/sei', name)
  return fs.readFileSync(p, 'utf8')
}

describe('importer service', () => {
  beforeAll(() => {
    vi.spyOn(processesRepo, 'upsertProcessoByNumero').mockResolvedValue('proc-1')
    vi.spyOn(processesRepo, 'refreshProcessoDerivados').mockResolvedValue()
    vi.spyOn(protRepo, 'upsertProtocolosBulk').mockResolvedValue({ inserted: 2, conflicted: 0 })
    vi.spyOn(andRepo, 'upsertAndamentosBulk').mockResolvedValue({ inserted: 2, conflicted: 0 })
  })

  it('persiste processo, protocolos e andamentos a partir de HTML (mock repos)', async () => {
    const html = readFixture('exemplo1.html')
    const res = await importFromHtml('http://example', html)
    expect(res.processoId).toBe('proc-1')
    expect(res.novosProtocolos).toBe(2)
    expect(res.novosAndamentos).toBe(2)
  }, 10000)
})


