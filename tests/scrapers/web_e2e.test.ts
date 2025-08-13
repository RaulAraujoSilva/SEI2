import { describe, it, expect } from 'vitest'
import { fetchHtml, parseSei } from '@/lib/scrapers/sei'

const hasLiveUrl = !!process.env.WEB_SCRAPE_URL

describe.skipIf(!hasLiveUrl)('web scraping (live)', () => {
  it('baixa HTML real e faz parse básico da autuação', async () => {
    const url = process.env.WEB_SCRAPE_URL as string
    const html = await fetchHtml(url, 20000)
    const result = parseSei(html)
    expect(result.autuacao.numero).toBe('SEI-070002/013015/2024')
    expect(result.autuacao.tipo).toMatch(/Administrativo/i)
    expect(result.autuacao.acessoRestrito).toBe(true)
  }, 30000)
})


