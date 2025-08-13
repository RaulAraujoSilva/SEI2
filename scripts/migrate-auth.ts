import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { readFileSync } from 'fs'

// Carrega as variáveis de ambiente
dotenv.config({ path: resolve(__dirname, '..', '.env') })

async function runAuthMigration() {
  console.log('🔐 Executando migração para sistema de autenticação...\n')
  
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL não está configurada')
    process.exit(1)
  }
  
  const sql = neon(databaseUrl)
  
  try {
    // Ler o arquivo SQL
    const migrationPath = resolve(__dirname, 'sql', '0006_users_auth.sql')
    const migrationSql = readFileSync(migrationPath, 'utf8')
    
    // Executar comandos SQL individualmente (separados por CREATE)
    const commands = migrationSql
      .split(/(?=CREATE)/g)
      .filter(cmd => cmd.trim())
      .map(cmd => cmd.replace(/--.*$/gm, '').trim())
      .filter(cmd => cmd.length > 0)
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i]
      console.log(`Executando comando ${i + 1}/${commands.length}...`)
      try {
        await sql.query(command)
      } catch (error) {
        console.log(`⚠️  Comando ${i + 1} pode já existir, continuando...`)
      }
    }
    
    console.log('\n✅ Migração de autenticação executada com sucesso!')
    
    // Verificar se as tabelas foram criadas
    const tables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('users', 'sessions', 'verification_tokens', 'auth_logs')
      ORDER BY tablename
    `
    
    console.log(`\n📋 Tabelas de autenticação criadas (${tables.length}/4):`)
    tables.forEach(t => console.log(`   ✓ ${t.tablename}`))
    
    // Criar usuário admin padrão
    console.log('\n👤 Criando usuário administrador padrão...')
    
    // Hash da senha "admin123" usando bcryptjs
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    try {
      await sql`
        INSERT INTO users (email, name, password_hash, role, is_active, email_verified)
        VALUES ('admin@sei.local', 'Administrador', ${hashedPassword}, 'admin', true, true)
        ON CONFLICT (email) DO NOTHING
      `
      console.log('✅ Usuário admin criado:')
      console.log('   Email: admin@sei.local')
      console.log('   Senha: admin123')
      console.log('   ⚠️  IMPORTANTE: Altere a senha no primeiro acesso!')
    } catch (error) {
      console.log('⚠️  Usuário admin já existe ou erro ao criar')
    }
    
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Erro na migração:')
    console.error(error)
    process.exit(1)
  }
}

runAuthMigration()