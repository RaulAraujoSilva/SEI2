import { getDb, type SqlClient, type RawQueryResult } from '@/lib/db'

export type ProtocoloInsert = {
  processo_id: string
  numero: string
  tipo: string
  data: string | null
  data_inclusao: string | null
  unidade: string | null
}

export async function upsertProtocolosBulk(items: ProtocoloInsert[]) {
  if (!items.length) return { inserted: 0, conflicted: 0 }
  const db = getDb()
  if (!db) throw new Error('DB não configurado')
  const params: (string | null)[] = []
  const valuesSql = items
    .map((it, i) => {
      const base = i * 6
      params.push(it.processo_id, it.numero, it.tipo, it.data, it.data_inclusao, it.unidade)
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`
    })
    .join(',')
  const sql = `
    INSERT INTO protocolos (processo_id, numero, tipo, data, data_inclusao, unidade)
    VALUES ${valuesSql}
    ON CONFLICT (processo_id, numero) DO NOTHING
    RETURNING numero;
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

export type ProtocoloRow = {
  id: string
  processo_id: string
  numero: string
  tipo: string
  data: string | null
  data_inclusao: string | null
  unidade: string | null
}

export async function listProtocolosByProcessoId(processoId: string) {
  const db = getDb()
  if (!db) return [] as ProtocoloRow[]
  const rows = (await (db as SqlClient)(
    `SELECT id, processo_id, numero, tipo, data, data_inclusao, unidade FROM protocolos WHERE processo_id = $1 ORDER BY data_inclusao NULLS LAST, created_at ASC`,
    [processoId]
  )) as ProtocoloRow[]
  return rows
}


