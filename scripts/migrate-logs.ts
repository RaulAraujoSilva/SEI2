import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { readFileSync } from 'fs'

// Carrega as variáveis de ambiente
dotenv.config({ path: resolve(__dirname, '..', '.env') })

async function runMigration() {
  console.log('🔧 Executando migração para logs de atualização...\n')
  
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL não está configurada')
    process.exit(1)
  }
  
  const sql = neon(databaseUrl)
  
  try {
    // Executar comandos SQL individualmente
    console.log('📋 Criando tabela update_job_logs...')
    await sql`
      CREATE TABLE IF NOT EXISTS update_job_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        job_id VARCHAR(255) NOT NULL UNIQUE,
        type VARCHAR(20) NOT NULL CHECK (type IN ('manual', 'scheduled')),
        status VARCHAR(20) NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
        started_at TIMESTAMP WITH TIME ZONE NOT NULL,
        finished_at TIMESTAMP WITH TIME ZONE,
        total_processes INTEGER NOT NULL DEFAULT 0,
        success_count INTEGER NOT NULL DEFAULT 0,
        failure_count INTEGER NOT NULL DEFAULT 0,
        novos_protocolos INTEGER NOT NULL DEFAULT 0,
        novos_andamentos INTEGER NOT NULL DEFAULT 0,
        error_message TEXT,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    
    console.log('📋 Criando tabela process_update_logs...')
    await sql`
      CREATE TABLE IF NOT EXISTS process_update_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        job_id VARCHAR(255) NOT NULL,
        process_id UUID NOT NULL,
        numero VARCHAR(255) NOT NULL,
        status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed')),
        novos_protocolos INTEGER DEFAULT 0,
        novos_andamentos INTEGER DEFAULT 0,
        duration INTEGER,
        error_message TEXT,
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    
    console.log('📊 Criando índices...')
    await sql`CREATE INDEX IF NOT EXISTS idx_update_job_logs_started_at ON update_job_logs(started_at DESC)`
    await sql`CREATE INDEX IF NOT EXISTS idx_update_job_logs_status ON update_job_logs(status)`
    await sql`CREATE INDEX IF NOT EXISTS idx_update_job_logs_type ON update_job_logs(type)`
    await sql`CREATE INDEX IF NOT EXISTS idx_process_update_logs_job_id ON process_update_logs(job_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_process_update_logs_timestamp ON process_update_logs(timestamp DESC)`
    await sql`CREATE INDEX IF NOT EXISTS idx_process_update_logs_process_id ON process_update_logs(process_id)`
    
    console.log('✅ Migração executada com sucesso!')
    console.log('📋 Tabelas criadas:')
    console.log('   - update_job_logs')
    console.log('   - process_update_logs')
    console.log('📊 Índices criados para performance')
    
    // Verificar se as tabelas foram criadas
    const tables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('update_job_logs', 'process_update_logs')
      ORDER BY tablename
    `
    
    console.log(`\n✅ Verificação: ${tables.length}/2 tabelas encontradas`)
    tables.forEach(t => console.log(`   ✓ ${t.tablename}`))
    
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Erro na migração:')
    console.error(error)
    process.exit(1)
  }
}

runMigration()