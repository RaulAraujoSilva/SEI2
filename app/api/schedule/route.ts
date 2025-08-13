import { NextResponse } from 'next/server'
import { z } from 'zod'
import { upsertSchedule } from '@/lib/repositories/schedules'

const schema = z.object({
  mode: z.enum(['manual', 'scheduled']),
  type: z.enum(['daily', 'interval']).optional(),
  dailyTime: z.string().optional(), // HH:mm
  intervalHours: z.number().int().positive().optional(),
})

function computeNextRun(input: z.infer<typeof schema>) {
  if (input.mode !== 'scheduled') return undefined
  const now = new Date()
  if (input.type === 'daily' && input.dailyTime) {
    const [hh, mm] = input.dailyTime.split(':').map((n) => parseInt(n || '0', 10))
    const next = new Date(now)
    next.setHours(hh || 9, mm || 0, 0, 0)
    if (next <= now) next.setDate(next.getDate() + 1)
    return next.toISOString()
  }
  if (input.type === 'interval' && input.intervalHours) {
    const next = new Date(now.getTime() + input.intervalHours * 60 * 60 * 1000)
    return next.toISOString()
  }
  return undefined
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: 'Parâmetros inválidos', issues: parsed.error.issues }, { status: 400 })
  }
  const nextRun = computeNextRun(parsed.data)

  await upsertSchedule({
    mode: parsed.data.mode,
    type: parsed.data.type,
    dailyTime: parsed.data.dailyTime,
    intervalHours: parsed.data.intervalHours,
    nextRun: nextRun ?? null,
  })
  return NextResponse.json({ nextRun })
}
