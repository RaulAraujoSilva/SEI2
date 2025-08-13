import { NextResponse } from 'next/server'
import { listProcesses } from '@/lib/repositories/processes'
import { getDb } from '@/lib/db'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const start = url.searchParams.get('start')
  const end = url.searchParams.get('end')
  if (!start || !end) {
    return NextResponse.json({ message: 'start and end are required (YYYY-MM-DD)' }, { status: 400 })
  }

  const db = getDb()
  if (!db) {
    // Fallback: utiliza mock de processos e exemplos
    const { items } = await listProcesses(undefined, start, end)
    type ProtocoloRes = { numero: string; tipo: string; data: string; dataInclusao: string; unidade: string }
    type AndamentoRes = { dataHora: string; unidade: string; descricao: string }
    type RelatorioProcesso = {
      processo: string
      tipo: string
      interessado: string
      dataGeracao: string
      ultimaUnidade: string
      dataUltimoAndamento: string
      protocolos: ProtocoloRes[]
      andamentos: AndamentoRes[]
    }

    const processos: RelatorioProcesso[] = items.map((p) => ({
      processo: p.numero,
      tipo: p.tipo,
      interessado: p.interessado,
      dataGeracao: p.data_geracao || '',
      ultimaUnidade: p.ultima_unidade || '',
      dataUltimoAndamento: p.data_ultimo_andamento || '',
      protocolos: [],
      andamentos: [],
    }))
    return NextResponse.json({ processos })
  }

  const rows = (await db(
    `SELECT p.id, p.numero, p.tipo, p.interessado, p.data_geracao, p.ultima_unidade, p.data_ultimo_andamento
     FROM processos p
     WHERE p.data_ultimo_andamento::date BETWEEN $1 AND $2
     ORDER BY p.data_ultimo_andamento DESC NULLS LAST, p.created_at DESC`,
    [start, end]
  )) as Array<{ id: string; numero: string; tipo: string; interessado: string; data_geracao: string | null; ultima_unidade: string | null; data_ultimo_andamento: string | null }>
  type ProtocoloRes = { numero: string; tipo: string; data: string | null; dataInclusao: string | null; unidade: string | null }
  type AndamentoRes = { dataHora: string | null; unidade: string | null; descricao: string }
  type RelatorioProcesso = {
    processo: string
    tipo: string
    interessado: string
    dataGeracao: string
    ultimaUnidade: string
    dataUltimoAndamento: string
    protocolos: ProtocoloRes[]
    andamentos: AndamentoRes[]
  }
  const processos: RelatorioProcesso[] = []
  for (const p of rows) {
    const protocolos = (await db(
      `SELECT numero, tipo, data, data_inclusao as "dataInclusao", unidade FROM protocolos WHERE processo_id = $1 ORDER BY data_inclusao NULLS LAST, created_at ASC`,
      [p.id]
    )) as ProtocoloRes[]
    const andamentos = (await db(
      `SELECT to_char(data_hora, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "dataHora", unidade, descricao FROM andamentos WHERE processo_id = $1 ORDER BY data_hora DESC NULLS LAST, created_at ASC`,
      [p.id]
    )) as AndamentoRes[]
    processos.push({
      processo: p.numero,
      tipo: p.tipo,
      interessado: p.interessado,
      dataGeracao: p.data_geracao || '',
      ultimaUnidade: p.ultima_unidade || '',
      dataUltimoAndamento: p.data_ultimo_andamento || '',
      protocolos,
      andamentos,
    })
  }
  return NextResponse.json({ processos })
}
