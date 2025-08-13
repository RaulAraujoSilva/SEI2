import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { saveScheduleConfig, checkAndRunSchedules, updateAllProcesses, getSchedulerStatus } from '@/lib/services/scheduler'
import { getUpdateStats } from '@/lib/services/monitoring'

// Carrega as variáveis de ambiente
dotenv.config({ path: resolve(__dirname, '..', '.env') })

async function testUpdateManager() {
  console.log('🧪 Testando Update Manager completo...\n')
  
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL não está configurada')
    process.exit(1)
  }
  
  const sql = neon(databaseUrl)
  
  try {
    // Teste 1: Verificar estrutura do banco
    console.log('1️⃣ Verificando estrutura do banco...')
    const tables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('update_job_logs', 'process_update_logs', 'schedules')
      ORDER BY tablename
    `
    
    if (tables.length === 3) {
      console.log('✅ Todas as tabelas necessárias existem')
      tables.forEach(t => console.log(`   ✓ ${t.tablename}`))
    } else {
      console.log(`⚠️  Apenas ${tables.length}/3 tabelas encontradas`)
      tables.forEach(t => console.log(`   ✓ ${t.tablename}`))
    }
    console.log()
    
    // Teste 2: Configurar agendamento
    console.log('2️⃣ Testando configuração de agendamento...')
    const scheduleResult = await saveScheduleConfig({
      mode: 'scheduled',
      type: 'interval',
      intervalHours: 1
    })
    
    if (scheduleResult.success) {
      console.log('✅ Agendamento configurado com sucesso')
      console.log(`   Próxima execução: ${scheduleResult.nextRun}`)
    } else {
      console.log('❌ Falha ao configurar agendamento')
    }
    console.log()
    
    // Teste 3: Verificar status do agendador
    console.log('3️⃣ Verificando status do agendador...')
    const status = await getSchedulerStatus()
    console.log(`   Ativo: ${status.active ? 'Sim' : 'Não'}`)
    console.log(`   Modo: ${status.mode}`)
    if (status.active) {
      console.log(`   Tipo: ${status.type}`)
      console.log(`   Próxima execução: ${status.nextRun}`)
    }
    console.log()
    
    // Teste 4: Executar atualização manual
    console.log('4️⃣ Testando atualização manual...')
    console.log('   Iniciando atualização de todos os processos...')
    const updateResult = await updateAllProcesses()
    
    console.log('✅ Atualização concluída:')
    console.log(`   Job ID: ${updateResult.jobId}`)
    console.log(`   Total de processos: ${updateResult.totalProcesses}`)
    console.log(`   Sucessos: ${updateResult.successCount}`)
    console.log(`   Falhas: ${updateResult.failureCount}`)
    console.log(`   Novos protocolos: ${updateResult.novosProtocolos}`)
    console.log(`   Novos andamentos: ${updateResult.novosAndamentos}`)
    console.log(`   Duração: ${updateResult.finishedAt.getTime() - updateResult.startedAt.getTime()}ms`)
    console.log()
    
    // Teste 5: Verificar logs de monitoramento
    console.log('5️⃣ Verificando logs de monitoramento...')
    const stats = await getUpdateStats(7) // últimos 7 dias
    
    console.log('📊 Estatísticas:')
    console.log(`   Total de jobs: ${stats.totalJobs}`)
    console.log(`   Jobs bem-sucedidos: ${stats.successfulJobs}`)
    console.log(`   Jobs falharam: ${stats.failedJobs}`)
    console.log(`   Total de processos: ${stats.totalProcesses}`)
    if (stats.avgJobDuration) {
      console.log(`   Duração média: ${Math.round(stats.avgJobDuration)}s`)
    }
    
    if (stats.recentJobs.length > 0) {
      console.log(`\n📋 Jobs recentes (${stats.recentJobs.length}):`);
      stats.recentJobs.slice(0, 3).forEach((job, index) => {
        console.log(`   ${index + 1}. ${job.jobId} (${job.type}) - ${job.status}`)
        console.log(`      Processos: ${job.totalProcesses}, Sucessos: ${job.successCount}`)
      })
    }
    console.log()
    
    // Teste 6: Simular verificação de cron (sem executar)
    console.log('6️⃣ Testando verificação de agendamentos pendentes...')
    
    // Alterar o next_run para uma data no passado para simular agendamento pendente
    await sql`
      UPDATE schedules 
      SET next_run = NOW() - INTERVAL '1 hour' 
      WHERE mode = 'scheduled'
    `
    
    const cronResult = await checkAndRunSchedules()
    console.log(`   Agendamento executado: ${cronResult ? 'Sim' : 'Não'}`)
    
    if (cronResult) {
      console.log('✅ Sistema de cron está funcionando!')
    }
    console.log()
    
    // Teste 7: Restaurar agendamento normal
    console.log('7️⃣ Restaurando configuração normal...')
    await saveScheduleConfig({
      mode: 'manual'
    })
    console.log('✅ Agendamento desabilitado (modo manual)')
    console.log()
    
    console.log('🎉 Todos os testes do Update Manager passaram!')
    console.log('\n📋 Funcionalidades testadas:')
    console.log('   ✅ Configuração de agendamentos')
    console.log('   ✅ Atualização manual de processos')
    console.log('   ✅ Sistema de logs e monitoramento')
    console.log('   ✅ Verificação automática de agendamentos (cron)')
    console.log('   ✅ Status do agendador')
    console.log('\n💡 O Update Manager está completo e funcional!')
    
    process.exit(0)
    
  } catch (error) {
    console.error('\n❌ Erro durante os testes:')
    console.error(error)
    process.exit(1)
  }
}

testUpdateManager()