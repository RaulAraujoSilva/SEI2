import { getDb, type SqlClient, type RawQueryResult } from '@/lib/db'

export type AndamentoInsert = {
  processo_id: string
  data_hora: string | null
  unidade: string | null
  descricao: string
}

export async function upsertAndamentosBulk(items: AndamentoInsert[]) {
  if (!items.length) return { inserted: 0, conflicted: 0 }
  const db = getDb()
  if (!db) throw new Error('DB não configurado')
  const params: (string | null)[] = []
  const valuesSql = items
    .map((it, i) => {
      const base = i * 4
      params.push(it.processo_id, it.data_hora, it.unidade, it.descricao)
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`
    })
    .join(',')
  const sql = `
    INSERT INTO andamentos (processo_id, data_hora, unidade, descricao)
    VALUES ${valuesSql}
    ON CONFLICT (processo_id, data_hora, unidade, descricao) DO NOTHING
    RETURNING descricao;
  `
  const exec = (await (db as SqlClient).raw.query(sql, params)) as unknown
  const inserted = Array.isArray(exec)
    ? (exec as Row[]).length
    : Array.isArray((exec as RawQueryResult).rows)
    ? (((exec as RawQueryResult).rows as Row[]) || []).length
    : ((exec as RawQueryResult).rowCount ?? 0)
  const conflicted = items.length - inserted
  return { inserted, conflicted }
}

export type AndamentoRow = {
  id: string
  processo_id: string
  data_hora: string | null
  unidade: string | null
  descricao: string
}

export async function listAndamentosByProcessoId(processoId: string): Promise<AndamentoRow[]> {
  const db = getDb()
  if (!db) return [] as AndamentoRow[]
  const rows = (await (db as SqlClient)(
    `SELECT id, processo_id, data_hora, unidade, descricao FROM andamentos WHERE processo_id = $1 ORDER BY data_hora DESC NULLS LAST, created_at ASC`,
    [processoId]
  )) as AndamentoRow[]
  return rows
}


