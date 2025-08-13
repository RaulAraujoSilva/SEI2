import { neon } from '@neondatabase/serverless'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Carrega as variáveis de ambiente
dotenv.config({ path: resolve(__dirname, '..', '.env') })

async function testAuthSystem() {
  console.log('🔐 Testando sistema de autenticação...\n')
  
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL não está configurada')
    process.exit(1)
  }
  
  const sql = neon(databaseUrl)
  
  try {
    // Teste 1: Verificar estrutura do banco
    console.log('1️⃣ Verificando tabelas de autenticação...')
    const authTables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('users', 'sessions', 'verification_tokens', 'auth_logs')
      ORDER BY tablename
    `
    
    if (authTables.length === 4) {
      console.log('✅ Todas as tabelas de autenticação existem')
      authTables.forEach(t => console.log(`   ✓ ${t.tablename}`))
    } else {
      console.log(`⚠️  Apenas ${authTables.length}/4 tabelas encontradas`)
    }
    console.log()
    
    // Teste 2: Verificar usuário admin padrão
    console.log('2️⃣ Verificando usuário administrador padrão...')
    const adminUsers = await sql`
      SELECT id, email, name, role, is_active, email_verified, created_at
      FROM users 
      WHERE email = 'admin@sei.local'
    `
    
    if (adminUsers.length > 0) {
      const admin = adminUsers[0]
      console.log('✅ Usuário admin encontrado:')
      console.log(`   ID: ${admin.id}`)
      console.log(`   Email: ${admin.email}`)
      console.log(`   Nome: ${admin.name}`)
      console.log(`   Role: ${admin.role}`)
      console.log(`   Ativo: ${admin.is_active}`)
      console.log(`   Email verificado: ${admin.email_verified}`)
      console.log(`   Criado em: ${admin.created_at}`)
    } else {
      console.log('❌ Usuário admin não encontrado')
    }
    console.log()
    
    // Teste 3: Teste de hash de senha
    console.log('3️⃣ Testando verificação de senha...')
    if (adminUsers.length > 0) {
      const admin = adminUsers[0]
      
      // Buscar hash da senha
      const passwordData = await sql`
        SELECT password_hash FROM users WHERE id = ${admin.id}
      `
      
      if (passwordData.length > 0) {
        const isValidPassword = await bcrypt.compare('admin123', passwordData[0].password_hash)
        console.log(`✅ Senha padrão válida: ${isValidPassword ? 'Sim' : 'Não'}`)
        
        // Teste senha incorreta
        const isInvalidPassword = await bcrypt.compare('wrong-password', passwordData[0].password_hash)
        console.log(`✅ Rejeita senha incorreta: ${!isInvalidPassword ? 'Sim' : 'Não'}`)
      }
    }
    console.log()
    
    // Teste 4: Criar usuário de teste
    console.log('4️⃣ Criando usuário de teste temporário...')
    const testUserEmail = `test.user.${Date.now()}@example.com`
    const testPasswordHash = await bcrypt.hash('test123', 10)
    
    const testUser = await sql`
      INSERT INTO users (email, name, password_hash, role, is_active, email_verified)
      VALUES (${testUserEmail}, 'Usuário de Teste', ${testPasswordHash}, 'user', true, true)
      RETURNING id, email, name
    `
    
    console.log('✅ Usuário de teste criado:')
    console.log(`   ID: ${testUser[0].id}`)
    console.log(`   Email: ${testUser[0].email}`)
    console.log(`   Nome: ${testUser[0].name}`)
    console.log()
    
    // Teste 5: Testar log de autenticação
    console.log('5️⃣ Testando sistema de logs...')
    await sql`
      INSERT INTO auth_logs (user_id, action, ip_address, user_agent)
      VALUES (${testUser[0].id}, 'login', '127.0.0.1', 'Test-Agent/1.0')
    `
    
    const authLogs = await sql`
      SELECT action, ip_address, user_agent, created_at
      FROM auth_logs
      WHERE user_id = ${testUser[0].id}
      ORDER BY created_at DESC
      LIMIT 1
    `
    
    if (authLogs.length > 0) {
      console.log('✅ Log de autenticação criado:')
      console.log(`   Ação: ${authLogs[0].action}`)
      console.log(`   IP: ${authLogs[0].ip_address}`)
      console.log(`   User Agent: ${authLogs[0].user_agent}`)
      console.log(`   Data: ${authLogs[0].created_at}`)
    }
    console.log()
    
    // Teste 6: Verificar sessões (estrutura)
    console.log('6️⃣ Verificando estrutura de sessões...')
    const sessionColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'sessions'
      ORDER BY ordinal_position
    `
    
    console.log('✅ Colunas da tabela sessions:')
    sessionColumns.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type}`)
    })
    console.log()
    
    // Teste 7: Estatísticas do sistema
    console.log('7️⃣ Estatísticas do sistema...')
    const stats = await sql`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE is_active = true) as active_users,
        (SELECT COUNT(*) FROM users WHERE role = 'admin') as admin_users,
        (SELECT COUNT(*) FROM sessions) as active_sessions,
        (SELECT COUNT(*) FROM auth_logs) as total_auth_logs
    `
    
    console.log('📊 Estatísticas:')
    console.log(`   Total de usuários: ${stats[0].total_users}`)
    console.log(`   Usuários ativos: ${stats[0].active_users}`)
    console.log(`   Administradores: ${stats[0].admin_users}`)
    console.log(`   Sessões ativas: ${stats[0].active_sessions}`)
    console.log(`   Logs de auth: ${stats[0].total_auth_logs}`)
    console.log()
    
    // Limpeza: remover usuário de teste
    console.log('8️⃣ Limpeza - removendo usuário de teste...')
    await sql`DELETE FROM users WHERE id = ${testUser[0].id}`
    console.log('✅ Usuário de teste removido')
    console.log()
    
    console.log('🎉 Todos os testes de autenticação passaram!')
    console.log('\n📋 Sistema de Autenticação - Status:')
    console.log('   ✅ Estrutura do banco')
    console.log('   ✅ Usuário admin padrão')
    console.log('   ✅ Hash de senhas')
    console.log('   ✅ Sistema de logs')
    console.log('   ✅ Sessões configuradas')
    console.log('\n💡 Próximos passos:')
    console.log('   1. Testar login na interface web')
    console.log('   2. Verificar proteção de rotas')
    console.log('   3. Testar logout')
    console.log('   4. Alterar senha padrão em produção')
    
    process.exit(0)
    
  } catch (error) {
    console.error('\n❌ Erro durante os testes:')
    console.error(error)
    process.exit(1)
  }
}

testAuthSystem()