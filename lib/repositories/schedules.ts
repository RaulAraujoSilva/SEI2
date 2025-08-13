import { getDb, type SqlClient } from '@/lib/db'

export type ScheduleRow = {
  id: string
  mode: 'manual' | 'scheduled'
  type: 'daily' | 'interval' | null
  daily_time: string | null
  interval_hours: number | null
  next_run: string | null
}

export type ScheduleInput = {
  mode: 'manual' | 'scheduled'
  type?: 'daily' | 'interval'
  dailyTime?: string
  intervalHours?: number
  nextRun?: string | null
}

export async function upsertSchedule(input: ScheduleInput) {
  const db = getDb()
  if (!db) return null
  const id = crypto.randomUUID()
  const sql = `
    INSERT INTO schedules (id, mode, type, daily_time, interval_hours, next_run)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (id) DO UPDATE SET
      mode = EXCLUDED.mode,
      type = EXCLUDED.type,
      daily_time = EXCLUDED.daily_time,
      interval_hours = EXCLUDED.interval_hours,
      next_run = EXCLUDED.next_run,
      updated_at = NOW()
    RETURNING *;
  `
  const rows = (await (db as SqlClient)(sql, [
    id,
    input.mode,
    input.type ?? null,
    input.dailyTime ?? null,
    input.intervalHours ?? null,
    input.nextRun ?? null,
  ])) as ScheduleRow[]
  return rows[0]
}

export async function listSchedules() {
  const db = getDb()
  if (!db) return [] as ScheduleRow[]
  const rows = (await (db as SqlClient)(`SELECT id, mode, type, daily_time, interval_hours, next_run FROM schedules ORDER BY updated_at DESC`)) as ScheduleRow[]
  return rows
}

export async function updateNextRun(id: string, nextRun: string | null) {
  const db = getDb()
  if (!db) return null
  await (db as SqlClient)(`UPDATE schedules SET next_run = $1, updated_at = NOW() WHERE id = $2`, [nextRun, id])
}


