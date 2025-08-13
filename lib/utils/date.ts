export function parseDateBR(input: string): string | null {
  const text = (input || '').trim()
  if (!text) return null
  const m = text.match(/^([0-3]?\d)\/([0-1]?\d)\/(\d{4})$/)
  if (!m) return null
  const dd = m[1].padStart(2, '0')
  const mm = m[2].padStart(2, '0')
  const yyyy = m[3]
  return `${yyyy}-${mm}-${dd}`
}

export function parseDateTimeBR(input: string): string | null {
  const text = (input || '').trim()
  if (!text) return null
  const m = text.match(/^([0-3]?\d)\/([0-1]?\d)\/(\d{4})\s+([0-2]?\d):([0-5]\d)$/)
  if (!m) return null
  const dd = m[1].padStart(2, '0')
  const mm = m[2].padStart(2, '0')
  const yyyy = m[3]
  const HH = m[4].padStart(2, '0')
  const MI = m[5].padStart(2, '0')
  // Assume America/Sao_Paulo (UTC-03:00), sem horário de verão
  const localIsoWithOffset = `${yyyy}-${mm}-${dd}T${HH}:${MI}:00-03:00`
  const date = new Date(localIsoWithOffset)
  if (isNaN(date.getTime())) return null
  return date.toISOString()
}

export function normalizeText(input: string | null | undefined): string {
  return (input || '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}


