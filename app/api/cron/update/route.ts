import { NextResponse } from 'next/server'
import { listSchedules, updateNextRun } from '@/lib/repositories/schedules'
import { getDb } from '@/lib/db'
import { fetchHtml } from '@/lib/scrapers/sei'
import { importFromHtml } from '@/lib/services/importer'
import { logInfo, logError } from '@/lib/logger'

export async function GET() {
  const db = getDb()
  if (!db) {
    return NextResponse.json({ ok: true, processed: 0, message: 'Sem DB configurado' })
  }

  const schedules = await listSchedules()
  const shouldRun = schedules.some((s) => s.mode === 'scheduled')
  if (!shouldRun) {
    return NextResponse.json({ ok: true, processed: 0, message: 'Sem agendamento ativo' })
  }

  const rows = (await db(`SELECT id, source_url FROM processos WHERE source_url IS NOT NULL`)) as Array<{ id: string; source_url: string }>
  let novosProtocolos = 0
  let novosAndamentos = 0
  for (const r of rows) {
    try {
      const t0 = Date.now()
      const html = await fetchHtml(r.source_url)
      const res = await importFromHtml(r.source_url, html)
      novosProtocolos += res.novosProtocolos
      novosAndamentos += res.novosAndamentos
      logInfo('cron.item.ok', { id: r.id, novosProtocolos: res.novosProtocolos, novosAndamentos: res.novosAndamentos, ms: Date.now() - t0 })
    } catch {
      logError('cron.item.error', new Error('fetch/import failed'), { id: r.id })
    }
  }

  // atualiza next_run simplisticamente: adiciona +interval ou +1 dia
  for (const s of schedules) {
    let next: string | null = null
    if (s.type === 'interval' && s.interval_hours) {
      next = new Date(Date.now() + s.interval_hours * 3600 * 1000).toISOString()
    }
    if (s.type === 'daily' && s.daily_time) {
      const [hh, mm] = s.daily_time.split(':').map((n) => parseInt(n || '0', 10))
      const d = new Date()
      d.setHours(hh || 9, mm || 0, 0, 0)
      if (d <= new Date()) d.setDate(d.getDate() + 1)
      next = d.toISOString()
    }
    if (next) await updateNextRun(s.id, next)
  }

  logInfo('cron.done', { processed: rows.length, novosProtocolos, novosAndamentos })
  return NextResponse.json({ ok: true, processed: rows.length, novosProtocolos, novosAndamentos, finishedAt: new Date().toISOString() })
}
