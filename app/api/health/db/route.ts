import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { logInfo, logError } from '@/lib/logger'

export async function GET() {
  const url = process.env.DATABASE_URL
  if (!url) {
    return NextResponse.json({
      ok: true,
      databaseUrl: false,
      usingMock: true,
      message: 'DATABASE_URL não configurada. APIs usarão mocks até configurar o banco.',
    })
  }

  const db = getDb()
  if (!db) {
    return NextResponse.json({
      ok: false,
      databaseUrl: true,
      connected: false,
      error: 'Falha ao inicializar cliente do banco.',
    }, { status: 500 })
  }

  try {
    // Ping ao banco
    const timeRows = await db('SELECT NOW() as now') as Array<{ now: string }>
    const now = timeRows[0]?.now

    // Verifica existência de tabelas chave
    const existsRows = await db(`
      SELECT 
        (to_regclass('public.processos') IS NOT NULL) AS processos,
        (to_regclass('public.protocolos') IS NOT NULL) AS protocolos,
        (to_regclass('public.andamentos') IS NOT NULL) AS andamentos
    `) as Array<{ processos: boolean; protocolos: boolean; andamentos: boolean }>
    const exists = existsRows[0] || { processos: false, protocolos: false, andamentos: false }

    // Conta registros (se tabelas existirem)
    let processos = 0
    let protocolos = 0
    let andamentos = 0
    if (exists.processos) {
      const c1 = await db('SELECT COUNT(*)::int AS c FROM processos') as Array<{ c: number }>
      processos = c1[0]?.c ?? 0
    }
    if (exists.protocolos) {
      const c2 = await db('SELECT COUNT(*)::int AS c FROM protocolos') as Array<{ c: number }>
      protocolos = c2[0]?.c ?? 0
    }
    if (exists.andamentos) {
      const c3 = await db('SELECT COUNT(*)::int AS c FROM andamentos') as Array<{ c: number }>
      andamentos = c3[0]?.c ?? 0
    }
    const counts = { processos, protocolos, andamentos }

    const payload = {
      ok: true,
      databaseUrl: true,
      connected: true,
      now,
      tables: exists,
      counts,
    }
    logInfo('health.db.ok', payload)
    return NextResponse.json(payload)
  } catch (e: unknown) {
    const err = e as { message?: string }
    const payload = {
      ok: false,
      databaseUrl: true,
      connected: false,
      error: err?.message || 'Erro desconhecido ao consultar o banco.',
    }
    logError('health.db.error', e)
    return NextResponse.json(payload, { status: 500 })
  }
}
