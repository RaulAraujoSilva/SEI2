import { NextResponse } from 'next/server'
import { checkAndRunSchedules } from '@/lib/services/scheduler'
import { logInfo } from '@/lib/logger'

/**
 * Endpoint do cron job para executar agendamentos automáticos
 * Deve ser chamado por um serviço externo de cron ou sistema de agendamento
 */
export async function GET() {
  try {
    logInfo('cron.trigger', { timestamp: new Date().toISOString() })
    
    const executed = await checkAndRunSchedules()
    
    if (executed) {
      logInfo('cron.executed', { timestamp: new Date().toISOString() })
      return NextResponse.json({
        ok: true,
        executed: true,
        message: 'Agendamento executado com sucesso',
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({
        ok: true,
        executed: false,
        message: 'Nenhum agendamento pendente',
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('Cron execution error:', error)
    return NextResponse.json({
      ok: false,
      error: 'Erro na execução do cron',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
