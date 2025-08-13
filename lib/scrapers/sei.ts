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

  const getFieldFromCells = (labels: string[]): string => {
    for (const label of labels) {
      // Busca exata
      let cell = $('td, th').filter((_, el) => normalizeText($(el).text()) === label).first()
      
      // Se não encontrar, busca parcial
      if (!cell.length) {
        cell = $('td, th').filter((_, el) => normalizeText($(el).text()).includes(label.replace(':', ''))).first()
      }
      
      if (cell.length) {
        const next = normalizeText(cell.next('td').text())
        if (next) return next
        const alt = normalizeText(cell.parent().find('td').eq(1).text())
        if (alt) return alt
        // Tenta buscar na mesma linha
        const sameRow = normalizeText(cell.parent().find('td').last().text())
        if (sameRow && sameRow !== normalizeText(cell.text())) return sameRow
      }
    }
    return ''
  }

  const numero = getFieldFromCells(['Processo:', 'Número:', 'Número do Processo:'])
  const tipo = getFieldFromCells(['Tipo:', 'Tipo do Processo:', 'Espécie:'])
  const dataGeracao = parseDateBR(getFieldFromCells(['Data de Geração:', 'Data de Autuação:', 'Data:']))
  const interessado = getFieldFromCells(['Interessados:', 'Interessado:', 'Requerente:', 'Solicitante:'])

  return { numero, tipo, dataGeracao, interessado, acessoRestrito }
}

export function parseProtocolos($: cheerio.CheerioAPI): Protocolo[] {
  const protocolos: Protocolo[] = []
  
  // Primeiro tenta encontrar por seção h3
  let table = $('h3:contains("Lista de Protocolos"), h3:contains("Protocolos"), h3:contains("Lista de Documentos"), h3:contains("Documentos")').first().nextAll('table').first()
  
  // Se não encontrar, procura por tabela com cabeçalhos específicos
  if (!table.length) {
    table = $('table').filter((_, el) => {
      const headers = $(el).find('tr').first().find('th, td').map((_, cell) => 
        normalizeText($(cell).text())
      ).get().join(' ')
      return headers.includes('Processo') && headers.includes('Tipo') && headers.includes('Data')
    }).first()
  }
  
  if (!table.length) return protocolos
  
  // Encontrar o índice correto das colunas baseado nos cabeçalhos
  const headerRow = table.find('tr').first()
  const headers = headerRow.find('th, td').map((_, cell) => normalizeText($(cell).text())).get()
  
  const numeroIndex = headers.findIndex(h => h.includes('Processo') || h.includes('Documento'))
  const tipoIndex = headers.findIndex(h => h.includes('Tipo'))
  const dataIndex = headers.findIndex(h => h.includes('Data') && !h.includes('Inclusão'))
  const dataInclusaoIndex = headers.findIndex(h => h.includes('Inclusão'))
  const unidadeIndex = headers.findIndex(h => h.includes('Unidade'))
  
  table.find('tr').slice(1).each((_, tr) => { // Pula o cabeçalho
    const tds = $(tr).find('td')
    if (tds.length >= 5) {
      const numero = numeroIndex >= 0 ? normalizeText($(tds[numeroIndex]).text()) : ''
      const tipo = tipoIndex >= 0 ? normalizeText($(tds[tipoIndex]).text()) : ''
      const data = dataIndex >= 0 ? parseDateBR(normalizeText($(tds[dataIndex]).text())) : null
      const dataInclusao = dataInclusaoIndex >= 0 ? parseDateBR(normalizeText($(tds[dataInclusaoIndex]).text())) : null
      const unidade = unidadeIndex >= 0 ? normalizeText($(tds[unidadeIndex]).text()) : ''
      
      if (numero && tipo) {
        protocolos.push({ numero, tipo, data, dataInclusao, unidade })
      }
    }
  })
  return protocolos
}

export function parseAndamentos($: cheerio.CheerioAPI): Andamento[] {
  const andamentos: Andamento[] = []
  
  // Primeiro tenta encontrar por seção h3
  let table = $('h3:contains("Lista de Andamentos"), h3:contains("Andamentos"), h3:contains("Histórico"), h3:contains("Tramitação")').first().nextAll('table').first()
  
  // Se não encontrar, procura por tabela com cabeçalhos específicos
  if (!table.length) {
    table = $('table').filter((_, el) => {
      const headers = $(el).find('tr').first().find('th, td').map((_, cell) => 
        normalizeText($(cell).text())
      ).get().join(' ')
      return headers.includes('Data') && headers.includes('Unidade') && headers.includes('Descrição')
    }).first()
  }
  
  if (!table.length) return andamentos
  
  // Encontrar o índice correto das colunas baseado nos cabeçalhos
  const headerRow = table.find('tr').first()
  const headers = headerRow.find('th, td').map((_, cell) => normalizeText($(cell).text())).get()
  
  const dataHoraIndex = headers.findIndex(h => h.includes('Data'))
  const unidadeIndex = headers.findIndex(h => h.includes('Unidade'))
  const descricaoIndex = headers.findIndex(h => h.includes('Descrição') || h.includes('Descricao'))
  
  table.find('tr').slice(1).each((_, tr) => { // Pula o cabeçalho
    const tds = $(tr).find('td')
    if (tds.length >= 3) {
      const dataHora = dataHoraIndex >= 0 ? parseDateTimeBR(normalizeText($(tds[dataHoraIndex]).text())) : null
      const unidade = unidadeIndex >= 0 ? normalizeText($(tds[unidadeIndex]).text()) : ''
      const descricao = descricaoIndex >= 0 ? normalizeText($(tds[descricaoIndex]).text()) : ''
      
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


