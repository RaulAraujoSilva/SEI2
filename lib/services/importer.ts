import { parseSei, type ScrapeResult } from '@/lib/scrapers/sei'
import { getDb, type SqlClient } from '@/lib/db'
import { upsertProcessoByNumero, refreshProcessoDerivados } from '@/lib/repositories/processes'
import { upsertProtocolosBulk } from '@/lib/repositories/protocolos'
import { upsertAndamentosBulk } from '@/lib/repositories/andamentos'

export async function importFromHtml(url: string, html: string) {
  const parsed: ScrapeResult = parseSei(html)
  try { console.log('[importer] numero:', parsed.autuacao.numero, 'tipo:', parsed.autuacao.tipo) } catch {}
  let processoId = await upsertProcessoByNumero({
    numero: parsed.autuacao.numero,
    tipo: parsed.autuacao.tipo,
    interessado: parsed.autuacao.interessado,
    data_geracao: parsed.autuacao.dataGeracao,
    source_url: url,
  })
  if (!processoId) {
    const db = getDb()
    if (!db) throw new Error('DB não configurado')
    const rows = (await (db as SqlClient)(
      `SELECT id FROM processos WHERE numero = $1 LIMIT 1`,
      [parsed.autuacao.numero]
    )) as Array<{ id: string }>
    processoId = rows[0]?.id
    try { console.log('[importer] processoId via SELECT:', processoId) } catch {}
  }
  if (!processoId) {
    throw new Error('Falha ao obter id do processo após upsert')
  }

  const protos = parsed.protocolos
    .filter((p) => p.numero)
    .map((p) => ({
      processo_id: processoId,
      numero: p.numero,
      tipo: p.tipo,
      data: p.data,
      data_inclusao: p.dataInclusao,
      unidade: p.unidade || null,
    }))
  const ands = parsed.andamentos
    .filter((a) => a.descricao)
    .map((a) => ({
      processo_id: processoId,
      data_hora: a.dataHora,
      unidade: a.unidade || null,
      descricao: a.descricao,
    }))
  try { console.log('[importer] counts parsed -> protocolos:', protos.length, 'andamentos:', ands.length) } catch {}

  const [pr, ar] = await Promise.all([
    upsertProtocolosBulk(protos),
    upsertAndamentosBulk(ands),
  ])
  try { console.log('[importer] upsert results -> protocolos.inserted:', pr.inserted, 'andamentos.inserted:', ar.inserted) } catch {}
  await refreshProcessoDerivados(processoId)

  return {
    processoId,
    novosProtocolos: pr.inserted,
    novosAndamentos: ar.inserted,
  }
}


