import { getDb } from '@/lib/db'
import { logInfo, logWarn, logError } from '@/lib/logger'

export interface UpdateJobLog {
  id: string
  jobId: string
  type: 'manual' | 'scheduled'
  status: 'running' | 'completed' | 'failed'
  startedAt: Date
  finishedAt?: Date
  totalProcesses: number
  successCount: number
  failureCount: number
  novosProtocolos: number
  novosAndamentos: number
  errorMessage?: string
  metadata?: Record<string, any>
}

export interface ProcessUpdateLog {
  id: string
  jobId: string
  processId: string
  numero: string
  status: 'success' | 'failed'
  novosProtocolos?: number
  novosAndamentos?: number
  duration?: number
  errorMessage?: string
  timestamp: Date
}

/**
 * Log de início de job de atualização
 */
export async function logUpdateJobStart(
  jobId: string,
  type: 'manual' | 'scheduled',
  totalProcesses: number
): Promise<void> {
  const db = getDb()
  if (!db) return

  try {
    await db(`
      INSERT INTO update_job_logs (
        id, job_id, type, status, started_at, 
        total_processes, success_count, failure_count,
        novos_protocolos, novos_andamentos
      ) VALUES (
        $1, $2, $3, 'running', NOW(),
        $4, 0, 0, 0, 0
      )
    `, [
      crypto.randomUUID(),
      jobId,
      type,
      totalProcesses
    ])

    logInfo('monitoring.job.started', {
      jobId,
      type,
      totalProcesses
    })
  } catch (error) {
    logError('monitoring.job.start_error', error as Error, { jobId })
  }
}

/**
 * Log de conclusão de job de atualização
 */
export async function logUpdateJobComplete(
  jobId: string,
  result: {
    successCount: number
    failureCount: number
    novosProtocolos: number
    novosAndamentos: number
    errorMessage?: string
  }
): Promise<void> {
  const db = getDb()
  if (!db) return

  try {
    const status = result.errorMessage ? 'failed' : 'completed'
    
    await db(`
      UPDATE update_job_logs 
      SET 
        status = $1,
        finished_at = NOW(),
        success_count = $2,
        failure_count = $3,
        novos_protocolos = $4,
        novos_andamentos = $5,
        error_message = $6
      WHERE job_id = $7
    `, [
      status,
      result.successCount,
      result.failureCount,
      result.novosProtocolos,
      result.novosAndamentos,
      result.errorMessage || null,
      jobId
    ])

    logInfo('monitoring.job.completed', {
      jobId,
      status,
      ...result
    })
  } catch (error) {
    logError('monitoring.job.complete_error', error as Error, { jobId })
  }
}

/**
 * Log de atualização de processo individual
 */
export async function logProcessUpdate(
  jobId: string,
  processId: string,
  numero: string,
  result: {
    success: boolean
    novosProtocolos?: number
    novosAndamentos?: number
    duration?: number
    error?: string
  }
): Promise<void> {
  const db = getDb()
  if (!db) return

  try {
    await db(`
      INSERT INTO process_update_logs (
        id, job_id, process_id, numero,
        status, novos_protocolos, novos_andamentos,
        duration, error_message, timestamp
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()
      )
    `, [
      crypto.randomUUID(),
      jobId,
      processId,
      numero,
      result.success ? 'success' : 'failed',
      result.novosProtocolos || 0,
      result.novosAndamentos || 0,
      result.duration || null,
      result.error || null
    ])
  } catch (error) {
    logError('monitoring.process.log_error', error as Error, {
      jobId,
      processId,
      numero
    })
  }
}

/**
 * Obtém estatísticas de atualizações recentes
 */
export async function getUpdateStats(
  days: number = 30
): Promise<{
  totalJobs: number
  successfulJobs: number
  failedJobs: number
  totalProcesses: number
  avgJobDuration?: number
  recentJobs: UpdateJobLog[]
}> {
  const db = getDb()
  if (!db) {
    return {
      totalJobs: 0,
      successfulJobs: 0,
      failedJobs: 0,
      totalProcesses: 0,
      recentJobs: []
    }
  }

  try {
    // Estatísticas gerais
    const stats = await db(`
      SELECT 
        COUNT(*) as total_jobs,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_jobs,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_jobs,
        SUM(total_processes) as total_processes,
        AVG(EXTRACT(EPOCH FROM (finished_at - started_at))) as avg_duration
      FROM update_job_logs 
      WHERE started_at >= NOW() - INTERVAL '${days} days'
    `)

    // Jobs recentes
    const recentJobs = await db(`
      SELECT 
        id, job_id, type, status, started_at, finished_at,
        total_processes, success_count, failure_count,
        novos_protocolos, novos_andamentos, error_message
      FROM update_job_logs 
      WHERE started_at >= NOW() - INTERVAL '7 days'
      ORDER BY started_at DESC
      LIMIT 20
    `)

    return {
      totalJobs: parseInt(stats[0]?.total_jobs || '0'),
      successfulJobs: parseInt(stats[0]?.successful_jobs || '0'),
      failedJobs: parseInt(stats[0]?.failed_jobs || '0'),
      totalProcesses: parseInt(stats[0]?.total_processes || '0'),
      avgJobDuration: stats[0]?.avg_duration ? parseFloat(stats[0].avg_duration) : undefined,
      recentJobs: recentJobs.map((job: any) => ({
        id: job.id,
        jobId: job.job_id,
        type: job.type,
        status: job.status,
        startedAt: new Date(job.started_at),
        finishedAt: job.finished_at ? new Date(job.finished_at) : undefined,
        totalProcesses: job.total_processes,
        successCount: job.success_count,
        failureCount: job.failure_count,
        novosProtocolos: job.novos_protocolos,
        novosAndamentos: job.novos_andamentos,
        errorMessage: job.error_message
      }))
    }
  } catch (error) {
    logError('monitoring.stats_error', error as Error)
    return {
      totalJobs: 0,
      successfulJobs: 0,
      failedJobs: 0,
      totalProcesses: 0,
      recentJobs: []
    }
  }
}

/**
 * Obtém logs de atualização de um job específico
 */
export async function getJobLogs(
  jobId: string
): Promise<{
  job?: UpdateJobLog
  processLogs: ProcessUpdateLog[]
}> {
  const db = getDb()
  if (!db) {
    return { processLogs: [] }
  }

  try {
    // Informações do job
    const jobs = await db(`
      SELECT 
        id, job_id, type, status, started_at, finished_at,
        total_processes, success_count, failure_count,
        novos_protocolos, novos_andamentos, error_message
      FROM update_job_logs 
      WHERE job_id = $1
    `, [jobId])

    // Logs dos processos
    const processLogs = await db(`
      SELECT 
        id, job_id, process_id, numero, status,
        novos_protocolos, novos_andamentos, duration,
        error_message, timestamp
      FROM process_update_logs
      WHERE job_id = $1
      ORDER BY timestamp DESC
    `, [jobId])

    return {
      job: jobs[0] ? {
        id: jobs[0].id,
        jobId: jobs[0].job_id,
        type: jobs[0].type,
        status: jobs[0].status,
        startedAt: new Date(jobs[0].started_at),
        finishedAt: jobs[0].finished_at ? new Date(jobs[0].finished_at) : undefined,
        totalProcesses: jobs[0].total_processes,
        successCount: jobs[0].success_count,
        failureCount: jobs[0].failure_count,
        novosProtocolos: jobs[0].novos_protocolos,
        novosAndamentos: jobs[0].novos_andamentos,
        errorMessage: jobs[0].error_message
      } : undefined,
      processLogs: processLogs.map((log: any) => ({
        id: log.id,
        jobId: log.job_id,
        processId: log.process_id,
        numero: log.numero,
        status: log.status,
        novosProtocolos: log.novos_protocolos,
        novosAndamentos: log.novos_andamentos,
        duration: log.duration,
        errorMessage: log.error_message,
        timestamp: new Date(log.timestamp)
      }))
    }
  } catch (error) {
    logError('monitoring.job_logs_error', error as Error, { jobId })
    return { processLogs: [] }
  }
}

/**
 * Limpa logs antigos (manter apenas os últimos N dias)
 */
export async function cleanupOldLogs(retentionDays: number = 90): Promise<number> {
  const db = getDb()
  if (!db) return 0

  try {
    const result = await db(`
      DELETE FROM update_job_logs 
      WHERE started_at < NOW() - INTERVAL '${retentionDays} days'
    `)

    const deletedCount = result.length || 0
    
    if (deletedCount > 0) {
      logInfo('monitoring.cleanup', {
        deletedCount,
        retentionDays
      })
    }

    return deletedCount
  } catch (error) {
    logError('monitoring.cleanup_error', error as Error, { retentionDays })
    return 0
  }
}