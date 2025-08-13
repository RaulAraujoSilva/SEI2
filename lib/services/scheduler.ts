import { getDb } from '@/lib/db'
import { fetchHtml } from '@/lib/scrapers/sei'
import { importFromHtml } from '@/lib/services/importer'
import { logInfo, logError, logWarn } from '@/lib/logger'
import { listSchedules, updateNextRun, upsertSchedule } from '@/lib/repositories/schedules'

export interface UpdateResult {
  processId: string
  numero: string
  success: boolean
  novosProtocolos?: number
  novosAndamentos?: number
  error?: string
  duration?: number
}

export interface UpdateJobResult {
  jobId: string
  startedAt: Date
  finishedAt: Date
  totalProcesses: number
  successCount: number
  failureCount: number
  novosProtocolos: number
  novosAndamentos: number
  results: UpdateResult[]
}

/**
 * Atualiza um único processo
 */
export async function updateSingleProcess(
  processId: string,
  numero: string,
  sourceUrl: string
): Promise<UpdateResult> {
  const startTime = Date.now()
  
  try {
    logInfo('scheduler.update.start', { processId, numero })
    
    const html = await fetchHtml(sourceUrl)
    const result = await importFromHtml(sourceUrl, html)
    
    const duration = Date.now() - startTime
    
    logInfo('scheduler.update.success', {
      processId,
      numero,
      novosProtocolos: result.novosProtocolos,
      novosAndamentos: result.novosAndamentos,
      duration
    })
    
    return {
      processId,
      numero,
      success: true,
      novosProtocolos: result.novosProtocolos,
      novosAndamentos: result.novosAndamentos,
      duration
    }
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    
    logError('scheduler.update.error', error as Error, {
      processId,
      numero,
      sourceUrl,
      duration
    })
    
    return {
      processId,
      numero,
      success: false,
      error: errorMessage,
      duration
    }
  }
}

/**
 * Atualiza todos os processos com source_url
 */
export async function updateAllProcesses(): Promise<UpdateJobResult> {
  const jobId = crypto.randomUUID()
  const startedAt = new Date()
  
  logInfo('scheduler.job.start', { jobId })
  
  const db = getDb()
  if (!db) {
    logWarn('scheduler.job.no_db', { jobId })
    return {
      jobId,
      startedAt,
      finishedAt: new Date(),
      totalProcesses: 0,
      successCount: 0,
      failureCount: 0,
      novosProtocolos: 0,
      novosAndamentos: 0,
      results: []
    }
  }
  
  // Buscar todos os processos com source_url
  const processes = await db(`
    SELECT id, numero, source_url 
    FROM processos 
    WHERE source_url IS NOT NULL
    ORDER BY updated_at DESC
  `) as Array<{ id: string; numero: string; source_url: string }>
  
  const results: UpdateResult[] = []
  let novosProtocolos = 0
  let novosAndamentos = 0
  let successCount = 0
  let failureCount = 0
  
  // Processar em lotes para evitar sobrecarga
  const batchSize = 5
  for (let i = 0; i < processes.length; i += batchSize) {
    const batch = processes.slice(i, i + batchSize)
    
    const batchPromises = batch.map(p => 
      updateSingleProcess(p.id, p.numero, p.source_url)
    )
    
    const batchResults = await Promise.all(batchPromises)
    
    for (const result of batchResults) {
      results.push(result)
      
      if (result.success) {
        successCount++
        novosProtocolos += result.novosProtocolos || 0
        novosAndamentos += result.novosAndamentos || 0
      } else {
        failureCount++
      }
    }
    
    // Log de progresso
    logInfo('scheduler.job.progress', {
      jobId,
      processed: i + batch.length,
      total: processes.length
    })
  }
  
  const finishedAt = new Date()
  
  logInfo('scheduler.job.complete', {
    jobId,
    duration: finishedAt.getTime() - startedAt.getTime(),
    totalProcesses: processes.length,
    successCount,
    failureCount,
    novosProtocolos,
    novosAndamentos
  })
  
  return {
    jobId,
    startedAt,
    finishedAt,
    totalProcesses: processes.length,
    successCount,
    failureCount,
    novosProtocolos,
    novosAndamentos,
    results
  }
}

/**
 * Verifica e executa agendamentos pendentes
 */
export async function checkAndRunSchedules(): Promise<boolean> {
  const schedules = await listSchedules()
  const now = new Date()
  
  for (const schedule of schedules) {
    if (schedule.mode !== 'scheduled') continue
    
    const nextRun = schedule.next_run ? new Date(schedule.next_run) : null
    
    // Se já passou da hora de executar
    if (nextRun && nextRun <= now) {
      logInfo('scheduler.cron.executing', { 
        scheduleId: schedule.id,
        type: schedule.type,
        nextRun: schedule.next_run
      })
      
      // Executar atualização
      await updateAllProcesses()
      
      // Calcular próxima execução
      let newNextRun: Date | null = null
      
      if (schedule.type === 'daily' && schedule.daily_time) {
        const [hours, minutes] = schedule.daily_time.split(':').map(Number)
        newNextRun = new Date()
        newNextRun.setHours(hours, minutes, 0, 0)
        
        // Se já passou do horário hoje, agendar para amanhã
        if (newNextRun <= now) {
          newNextRun.setDate(newNextRun.getDate() + 1)
        }
      } else if (schedule.type === 'interval' && schedule.interval_hours) {
        newNextRun = new Date(now.getTime() + schedule.interval_hours * 60 * 60 * 1000)
      }
      
      // Atualizar próxima execução
      if (newNextRun) {
        await updateNextRun(schedule.id, newNextRun.toISOString())
        logInfo('scheduler.cron.rescheduled', {
          scheduleId: schedule.id,
          nextRun: newNextRun.toISOString()
        })
      }
      
      return true
    }
  }
  
  return false
}

/**
 * Salva ou atualiza configuração de agendamento
 */
export async function saveScheduleConfig(config: {
  mode: 'manual' | 'scheduled'
  type?: 'daily' | 'interval'
  dailyTime?: string
  intervalHours?: number
}): Promise<{ success: boolean; nextRun?: string }> {
  try {
    let nextRun: string | undefined
    
    if (config.mode === 'scheduled') {
      const now = new Date()
      
      if (config.type === 'daily' && config.dailyTime) {
        const [hours, minutes] = config.dailyTime.split(':').map(Number)
        const next = new Date()
        next.setHours(hours, minutes, 0, 0)
        
        if (next <= now) {
          next.setDate(next.getDate() + 1)
        }
        
        nextRun = next.toISOString()
      } else if (config.type === 'interval' && config.intervalHours) {
        const next = new Date(now.getTime() + config.intervalHours * 60 * 60 * 1000)
        nextRun = next.toISOString()
      }
    }
    
    await upsertSchedule({
      mode: config.mode,
      type: config.type,
      dailyTime: config.dailyTime,
      intervalHours: config.intervalHours,
      nextRun: nextRun || null
    })
    
    logInfo('scheduler.config.saved', config)
    
    return { success: true, nextRun }
  } catch (error) {
    logError('scheduler.config.error', error as Error, config)
    return { success: false }
  }
}

/**
 * Obtém status atual do agendador
 */
export async function getSchedulerStatus() {
  const schedules = await listSchedules()
  const activeSchedule = schedules.find(s => s.mode === 'scheduled')
  
  if (!activeSchedule) {
    return {
      active: false,
      mode: 'manual' as const
    }
  }
  
  return {
    active: true,
    mode: 'scheduled' as const,
    type: activeSchedule.type,
    dailyTime: activeSchedule.daily_time,
    intervalHours: activeSchedule.interval_hours,
    nextRun: activeSchedule.next_run
  }
}