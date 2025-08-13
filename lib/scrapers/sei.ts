import * as cheerio from 'cheerio'
import { normalizeText, parseDateBR, parseDateTimeBR } from '@/lib/utils/date'

export type Autuacao = {
  numero: string
  tipo: string
  dataGeracao: string | null
  interessado: string
  acessoRestrito?: boolean
}

export type Protocolo = {
  numero: string
  tipo: string
  data: string | null
  dataInclusao: string | null
  unidade: string
}

export type Andamento = {
  dataHora: string | null
  unidade: string
  descricao: string
}

export type ScrapeResult = {
  autuacao: Autuacao
  protocolos: Protocolo[]
  andamentos: Andamento[]
}

export async function fetchHtml(url: string, timeoutMs = Number(process.env.FETCH_TIMEOUT_MS) || 20000): Promise<string> {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), timeoutMs)
  const maxRetries = Math.max(0, Number(process.env.FETCH_RETRIES) || 2)
  const baseDelayMs = Math.max(50, Number(process.env.FETCH_RETRY_BASE_MS) || 500)
  let attempt = 0
  try {
    while (true) {
      const startedAt = Date.now()
      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'SEI-Manager/1.0 (+https://example.local)'
          },
          signal: controller.signal,
          cache: 'no-store',
        })
        const durationMs = Date.now() - startedAt
        if (!res.ok) {
          const retriable = res.status === 429 || res.status >= 500
          if (retriable && attempt < maxRetries) {
            attempt += 1
            const backoff = baseDelayMs * Math.pow(2, attempt - 1)
            await new Promise((r) => setTimeout(r, backoff))
            continue
          }
          throw new Error(`Falha ao baixar página (${res.status})`)
        }
        const text = await res.text()
        // logging estruturado mínimo
        try {
          console.log(JSON.stringify({ component: 'fetchHtml', url, status: res.status, durationMs, sizeBytes: text.length }))
        } catch {}
        return text
      } catch (e) {
        if (attempt < maxRetries) {
          attempt += 1
          const backoff = baseDelayMs * Math.pow(2, attempt - 1)
          await new Promise((r) => setTimeout(r, backoff))
          continue
        }
        throw e
      }
    }
  } finally {
    clearTimeout(t)
  }
}

export function parseAutuacao($: cheerio.CheerioAPI): Autuacao {
  const bodyText = $('body').text()
  const acessoRestrito = /Processo ou Documento de Acesso Restrito/i.test(bodyText)

  const getFieldFromCells = (label: string): string => {
    const cell = $('td, th').filter((_, el) => normalizeText($(el).text()) === label).first()
    if (cell.length) {
      const next = normalizeText(cell.next('td').text())
      if (next) return next
      const alt = normalizeText(cell.parent().find('td').eq(1).text())
      if (alt) return alt
    }
    return ''
  }

  const numero = getFieldFromCells('Processo:')
  const tipo = getFieldFromCells('Tipo:')
  const dataGeracao = parseDateBR(getFieldFromCells('Data de Geração:'))
  const interessado = getFieldFromCells('Interessados:')

  return { numero, tipo, dataGeracao, interessado, acessoRestrito }
}

export function parseProtocolos($: cheerio.CheerioAPI): Protocolo[] {
  const protocolos: Protocolo[] = []
  const table = $('h3:contains("Lista de Protocolos")').first().nextAll('table').first()
  if (!table.length) return protocolos
  table.find('tr').each((_, tr) => {
    const tds = $(tr).find('td')
    if (tds.length >= 5) {
      // Usa as últimas 5 colunas para tolerar coluna extra de seleção no início
      const start = tds.length - 5
      const numero = normalizeText($(tds[start + 0]).text())
      const tipo = normalizeText($(tds[start + 1]).text())
      const data = parseDateBR(normalizeText($(tds[start + 2]).text()))
      const dataInclusao = parseDateBR(normalizeText($(tds[start + 3]).text()))
      const unidade = normalizeText($(tds[start + 4]).text())
      if (numero && tipo) {
        protocolos.push({ numero, tipo, data, dataInclusao, unidade })
      }
    }
  })
  return protocolos
}

export function parseAndamentos($: cheerio.CheerioAPI): Andamento[] {
  const andamentos: Andamento[] = []
  const table = $('h3:contains("Lista de Andamentos")').first().nextAll('table').first()
  if (!table.length) return andamentos
  table.find('tr').each((_, tr) => {
    const tds = $(tr).find('td')
    if (tds.length >= 3) {
      const dataHora = parseDateTimeBR(normalizeText($(tds[0]).text()))
      const unidade = normalizeText($(tds[1]).text())
      const descricao = normalizeText($(tds[2]).text())
      if (unidade || descricao) {
        andamentos.push({ dataHora, unidade, descricao })
      }
    }
  })
  return andamentos
}

export function parseSei(html: string): ScrapeResult {
  const $ = cheerio.load(html)
  const autuacao = parseAutuacao($)
  const protocolos = parseProtocolos($)
  const andamentos = parseAndamentos($)
  return { autuacao, protocolos, andamentos }
}


