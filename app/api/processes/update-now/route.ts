import { NextResponse } from 'next/server'
import { updateAllProcesses } from '@/lib/services/scheduler'
import { logInfo } from '@/lib/logger'

export async function POST() {
  try {
    logInfo('update-now.start', { timestamp: new Date().toISOString() })
    
    const result = await updateAllProcesses()
    
    logInfo('update-now.complete', {
      jobId: result.jobId,
      duration: result.finishedAt.getTime() - result.startedAt.getTime(),
      totalProcesses: result.totalProcesses,
      successCount: result.successCount,
      failureCount: result.failureCount
    })
    
    return NextResponse.json({
      ok: true,
      jobId: result.jobId,
      processes: result.totalProcesses,
      successCount: result.successCount,
      failureCount: result.failureCount,
      novosProtocolos: result.novosProtocolos,
      novosAndamentos: result.novosAndamentos,
      startedAt: result.startedAt.toISOString(),
      finishedAt: result.finishedAt.toISOString(),
      results: result.results.map(r => ({
        processId: r.processId,
        numero: r.numero,
        success: r.success,
        error: r.error,
        novosProtocolos: r.novosProtocolos,
        novosAndamentos: r.novosAndamentos
      }))
    })
  } catch (error) {
    console.error('Update now error:', error)
    return NextResponse.json({
      ok: false,
      error: 'Erro ao atualizar processos',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
