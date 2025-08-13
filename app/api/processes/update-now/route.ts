import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { fetchHtml } from '@/lib/scrapers/sei'
import { importFromHtml } from '@/lib/services/importer'
import { logInfo, logError } from '@/lib/logger'

export async function POST() {
  const db = getDb()
  if (!db) {
    const jobId = crypto.randomUUID()
    return NextResponse.json({ jobId, message: 'Sem DB configurado. Simulação.' }, { status: 202 })
  }

  const rows = (await db(`SELECT id, source_url, numero FROM processos`)) as Array<{ id: string; source_url: string | null; numero: string }>
  let novosProtocolos = 0
  let novosAndamentos = 0
  for (const r of rows) {
    if (!r.source_url) continue
    try {
      const t0 = Date.now()
      const html = await fetchHtml(r.source_url)
      const res = await importFromHtml(r.source_url, html)
      novosProtocolos += res.novosProtocolos
      novosAndamentos += res.novosAndamentos
      logInfo('update-now.item.ok', { id: r.id, numero: r.numero, novosProtocolos: res.novosProtocolos, novosAndamentos: res.novosAndamentos, ms: Date.now() - t0 })
    } catch {
      logError('update-now.item.error', new Error('fetch/import failed'), { id: r.id, numero: r.numero, url: r.source_url })
    }
  }
  logInfo('update-now.done', { processes: rows.length, novosProtocolos, novosAndamentos })
  return NextResponse.json({ ok: true, processes: rows.length, novosProtocolos, novosAndamentos })
}
