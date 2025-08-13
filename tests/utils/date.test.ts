import { describe, it, expect } from 'vitest'
import { parseDateBR, parseDateTimeBR, normalizeText } from '@/lib/utils/date'

describe('date utils', () => {
  it('parseDateBR converte dd/MM/yyyy para YYYY-MM-DD e mantém formato', () => {
    const iso = parseDateBR('18/03/2025')
    expect(iso).toBe('2025-03-18')
  })

  it('parseDateTimeBR converte dd/MM/yyyy HH:mm para ISO UTC', () => {
    const iso = parseDateTimeBR('07/08/2025 15:39')
    expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
  })

  it('normalizeText remove controles e espaços extras', () => {
    const s = normalizeText('  Foo\n\tBar\u0001  ')
    expect(s).toBe('Foo Bar')
  })
})


