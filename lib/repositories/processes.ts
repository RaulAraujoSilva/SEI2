import { getDb, type SqlClient } from '@/lib/db'

export type ProcessoRow = {
  id: string
  numero: string
  tipo: string
  interessado: string
  data_geracao: string | null
  ultima_unidade: string | null
  data_ultimo_andamento: string | null
  assunto?: string | null
  concessionaria?: string | null
  titulo?: string | null
  tipo_custom?: string | null
}

const mockItems: ProcessoRow[] = [
  {
    id: '1',
    numero: 'SEI-260002/002172/2025',
    tipo: 'Administrativo: Elaboração de Correspondência Interna',
    interessado: 'Agência de Inovação da UENF DGA/UENF',
    data_geracao: '2025-03-18',
    ultima_unidade: 'UENF/DGA',
    data_ultimo_andamento: '2025-07-02',
    assunto:
      'Solicitação de análise técnica para implementação de sistema de monitoramento de qualidade da água',
    concessionaria: 'aguas-do-rio',
    titulo: 'indicadores-desempenho',
    tipo_custom: 'julgado',
  },
  {
    id: '2',
    numero: 'SEI-260002/002175/2025',
    tipo: 'Administrativo: Solicitação de Compras',
    interessado: 'Laboratório de Ciências Químicas',
    data_geracao: '2025-03-20',
    ultima_unidade: 'UENF/GERCOMP',
    data_ultimo_andamento: '2025-07-04',
    assunto: 'Aquisição de equipamentos para laboratório de análise de água',
    concessionaria: 'cedae',
    titulo: 'aperfeicoamento-sistema',
    tipo_custom: 'termo-encerramento',
  },
]

export async function listProcesses(q?: string, start?: string, end?: string) {
  const db = getDb()
  if (!db) {
    const term = (q || '').toLowerCase()
    const items = mockItems.filter(
      (p) =>
        p.numero.toLowerCase().includes(term) ||
        p.tipo.toLowerCase().includes(term) ||
        p.interessado.toLowerCase().includes(term) ||
        (p.assunto || '').toLowerCase().includes(term)
    )
    return { items, total: items.length }
  }
  return queryListProcesses(db, q, start, end)
}

export type ProcessoUpsert = {
  numero: string
  tipo: string
  interessado: string
  data_geracao: string | null
  source_url?: string | null
}

export async function upsertProcessoByNumero(input: ProcessoUpsert) {
  const db = getDb()
  if (!db) throw new Error('DB não configurado')
  const id = crypto.randomUUID()
  const sql = `
    INSERT INTO processos (id, numero, tipo, interessado, data_geracao, source_url)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (numero) DO UPDATE SET
      tipo = EXCLUDED.tipo,
      interessado = EXCLUDED.interessado,
      data_geracao = COALESCE(EXCLUDED.data_geracao, processos.data_geracao),
      source_url = COALESCE(EXCLUDED.source_url, processos.source_url),
      updated_at = NOW()
    RETURNING id;
  `
  const rows = (await (db as SqlClient)(sql, [
    id,
    input.numero,
    input.tipo,
    input.interessado,
    input.data_geracao,
    input.source_url || null,
  ])) as Array<{ id: string }>
  if (rows && rows[0]?.id) return rows[0].id
  // Fallback: buscar por número caso o driver ignore RETURNING
  const fallback = (await (db as SqlClient)(
    `SELECT id FROM processos WHERE numero = $1 LIMIT 1`,
    [input.numero]
  )) as Array<{ id: string }>
  return fallback[0]?.id
}

export async function refreshProcessoDerivados(processoId: string) {
  const db = getDb()
  if (!db) throw new Error('DB não configurado')
  const sql = `
    WITH last_and AS (
      SELECT processo_id,
             MAX(data_hora) AS max_dh
      FROM andamentos
      WHERE processo_id = $1
      GROUP BY processo_id
    )
    UPDATE processos p
    SET data_ultimo_andamento = la.max_dh::date,
        ultima_unidade = (
          SELECT a.unidade FROM andamentos a
          WHERE a.processo_id = p.id AND a.data_hora = la.max_dh
          ORDER BY a.created_at DESC
          LIMIT 1
        ),
        updated_at = NOW()
    FROM last_and la
    WHERE p.id = la.processo_id;
  `
  await (db as SqlClient)(sql, [processoId])
}

async function queryListProcesses(db: SqlClient, q?: string, start?: string, end?: string) {
  const params: (string | null)[] = []
  const where: string[] = []
  if (q) {
    params.push(`%${q}%`)
    where.push(`(numero ILIKE $${params.length} OR tipo ILIKE $${params.length} OR interessado ILIKE $${params.length} OR COALESCE(assunto,'') ILIKE $${params.length})`)
  }
  if (start) {
    params.push(start)
    where.push(`(data_ultimo_andamento::date >= $${params.length})`)
  }
  if (end) {
    params.push(end)
    where.push(`(data_ultimo_andamento::date <= $${params.length})`)
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const sqlText = `
    SELECT id, numero, tipo, interessado, data_geracao, ultima_unidade, data_ultimo_andamento,
           assunto, concessionaria, titulo, tipo_custom
    FROM processos
    ${whereSql}
    ORDER BY data_ultimo_andamento DESC NULLS LAST, created_at DESC
    LIMIT 200;
  `
  const items = (await db(sqlText, params)) as ProcessoRow[]
  return { items, total: items.length }
}
