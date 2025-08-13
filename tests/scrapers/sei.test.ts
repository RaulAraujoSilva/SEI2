import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { parseSei } from '@/lib/scrapers/sei'

function readFixture(name: string): string {
  const p = path.resolve(__dirname, '../fixtures/sei', name)
  return fs.readFileSync(p, 'utf8')
}

describe('scraper SEI', () => {
  it('parses autuação, protocolos e andamentos (exemplo1)', () => {
    const html = readFixture('exemplo1.html')
    const result = parseSei(html)
    expect(result.autuacao.numero).toBe('SEI-260002/002172/2025')
    expect(result.autuacao.tipo).toBe('Administrativo: Elaboração de Correspondência Interna')
    expect(result.autuacao.dataGeracao).toBe('2025-03-18')
    expect(result.autuacao.interessado).toMatch(/UENF/)

    expect(result.protocolos.length).toBeGreaterThanOrEqual(2)
    const p0 = result.protocolos[0]
    expect(p0.numero).toBe('95725517')
    expect(p0.tipo).toMatch(/Correspondência Interna/)
    expect(p0.data).toBe('2025-03-19')
    expect(p0.dataInclusao).toBe('2025-03-19')
    expect(p0.unidade).toBe('UENF/DIRCCH')

    expect(result.andamentos.length).toBeGreaterThanOrEqual(2)
    const a0 = result.andamentos[0]
    expect(a0.unidade).toBe('UENF/DIRCCH')
    expect(a0.descricao).toMatch(/recebido na unidade/)
    expect(a0.dataHora).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('detecta acesso restrito e extrai autuação básica (exemplo_restrito)', () => {
    const html = readFixture('exemplo_restrito.html')
    const result = parseSei(html)
    expect(result.autuacao.acessoRestrito).toBe(true)
    expect(result.autuacao.numero).toBe('SEI-070002/013015/2024')
    expect(result.autuacao.tipo).toMatch(/Administrativo/)
    expect(result.autuacao.dataGeracao).toBe('2024-07-16')
    expect(result.autuacao.interessado).toMatch(/UENF/)
    expect(result.protocolos.length).toBe(0)
    expect(result.andamentos.length).toBe(0)
  })
})


