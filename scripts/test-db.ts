import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Carrega as variáveis de ambiente
dotenv.config({ path: resolve(__dirname, '..', '.env') })

async function testDatabaseConnection() {
  console.log('🔍 Testando conexão com o banco de dados...\n')
  
  const databaseUrl = process.env.DATABASE_URL
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL não está configurada no arquivo .env')
    process.exit(1)
  }
  
  console.log('✅ DATABASE_URL encontrada')
  console.log(`📍 Host: ${databaseUrl.split('@')[1]?.split('/')[0] || 'unknown'}\n`)
  
  try {
    const sql = neon(databaseUrl)
    
    // Teste 1: Conexão básica
    console.log('1️⃣ Testando conexão básica...')
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`
    console.log(`✅ Conectado com sucesso!`)
    console.log(`⏰ Hora do servidor: ${result[0].current_time}`)
    console.log(`📦 Versão PostgreSQL: ${result[0].pg_version.split(',')[0]}\n`)
    
    // Teste 2: Verificar tabelas existentes
    console.log('2️⃣ Verificando tabelas existentes...')
    const tables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `
    
    if (tables.length === 0) {
      console.log('⚠️  Nenhuma tabela encontrada no banco de dados')
      console.log('💡 Execute as migrações com: npm run db:migrate\n')
    } else {
      console.log(`✅ ${tables.length} tabelas encontradas:`)
      tables.forEach(t => console.log(`   - ${t.tablename}`))
      console.log()
    }
    
    // Teste 3: Verificar estrutura das tabelas principais
    const expectedTables = ['processos', 'protocolos', 'andamentos', 'observacoes', 'schedules']
    const existingTables = tables.map(t => t.tablename)
    const missingTables = expectedTables.filter(t => !existingTables.includes(t))
    
    if (missingTables.length > 0) {
      console.log('3️⃣ Tabelas faltando:')
      missingTables.forEach(t => console.log(`   ❌ ${t}`))
      console.log('\n💡 Execute as migrações para criar as tabelas faltantes')
    } else {
      console.log('3️⃣ Todas as tabelas principais existem ✅')
      
      // Teste 4: Contar registros
      console.log('\n4️⃣ Contando registros...')
      const counts = await sql`
        SELECT 
          (SELECT COUNT(*) FROM processos) as processos_count,
          (SELECT COUNT(*) FROM protocolos) as protocolos_count,
          (SELECT COUNT(*) FROM andamentos) as andamentos_count
      `
      console.log(`   📋 Processos: ${counts[0].processos_count}`)
      console.log(`   📄 Protocolos: ${counts[0].protocolos_count}`)
      console.log(`   📝 Andamentos: ${counts[0].andamentos_count}`)
    }
    
    console.log('\n✅ Todos os testes de conexão passaram com sucesso!')
    process.exit(0)
    
  } catch (error) {
    console.error('\n❌ Erro ao conectar com o banco de dados:')
    console.error(error)
    console.log('\n💡 Verifique:')
    console.log('   1. Se a DATABASE_URL está correta')
    console.log('   2. Se o banco de dados está acessível')
    console.log('   3. Se as credenciais estão corretas')
    process.exit(1)
  }
}

testDatabaseConnection()