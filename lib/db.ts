import { neon } from '@neondatabase/serverless'

export type Row = Record<string, unknown>
export type QueryParams = unknown[] | undefined

export type RawQueryResult<T = Row> = {
  rows?: T[]
  rowCount?: number
}

export type RawSqlClient = {
  query: (text: string, params?: QueryParams) => Promise<RawQueryResult>
}

export type SqlClient = ((text: string, params?: QueryParams) => Promise<Row[]>) & {
  raw: RawSqlClient
}

export function getDb(): SqlClient | null {
  const url = process.env.DATABASE_URL
  if (!url) return null
  type CallableSql = ((text: string, params?: QueryParams) => Promise<Row[]>) & Partial<RawSqlClient>
  const raw = neon(url) as unknown as CallableSql
  const fn = (async (text: string, params?: QueryParams) => {
    if (typeof raw.query === 'function') {
      const res: unknown = await raw.query(text, params)
      // Compat: alguns drivers retornam Row[] diretamente; outros retornam { rows, rowCount }
      if (Array.isArray(res)) return res as Row[]
      const obj = res as RawQueryResult
      return (obj?.rows ?? []) as Row[]
    }
    const res = await raw(text, params)
    return (res as Row[]) ?? []
  }) as SqlClient
  fn.raw = (raw as unknown as RawSqlClient)
  return fn
}
