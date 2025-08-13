import { NextResponse } from 'next/server'
import { z } from 'zod'
import { fetchHtml, parseSei } from '@/lib/scrapers/sei'
import { logInfo, logError } from '@/lib/logger'

const schema = z.object({ urls: z.array(z.string().url()).min(1) })

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: 'Envie ao menos uma URL válida' }, { status: 400 })
  }

  const limit = Math.max(1, Math.min(5, Number(process.env.IMPORT_CONCURRENCY) || 3))
  const urls = parsed.data.urls
  let success = 0
  let failed = 0
  const results: Array<{ url: string; status: 'ok' | 'error'; message?: string }> = []

  async function worker(queue: string[]) {
    while (queue.length) {
      const url = queue.shift()!
      try {
        const t0 = Date.now()
        const html = await fetchHtml(url)
        parseSei(html) // apenas valida parse; resposta não persiste
        results.push({ url, status: 'ok' })
        success += 1
        logInfo('batch.item.ok', { url, ms: Date.now() - t0 })
      } catch (e: unknown) {
        const err = e as { message?: string }
        results.push({ url, status: 'error', message: err?.message || 'erro' })
        failed += 1
        logError('batch.item.error', e, { url })
      }
    }
  }

  const queue = [...urls]
  const workers = Array.from({ length: limit }, () => worker(queue))
  await Promise.all(workers)

  logInfo('batch.done', { total: urls.length, success, failed, limit })
  return NextResponse.json({ success, failed, items: results })
}
