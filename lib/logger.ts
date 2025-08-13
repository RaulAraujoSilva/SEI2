type LogDetails = Record<string, unknown>

function safeSerialize(input: unknown): string | undefined {
  try {
    if (!input) return undefined
    if (typeof input === 'string') return input
    return JSON.stringify(input)
  } catch {
    return undefined
  }
}

export function logInfo(event: string, details: LogDetails = {}): void {
  const payload = { level: 'info', event, timestamp: new Date().toISOString(), ...details }
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(payload))
}

export function logError(event: string, error: unknown, details: LogDetails = {}): void {
  const payload = {
    level: 'error',
    event,
    timestamp: new Date().toISOString(),
    error: (error as { message?: string } | undefined)?.message || safeSerialize(error) || 'unknown-error',
    ...details,
  }
  // eslint-disable-next-line no-console
  console.error(JSON.stringify(payload))
}


