import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Carrega as variáveis de ambiente
dotenv.config({ path: resolve(__dirname, '..', '.env') })

async function testCrudOperations() {
  console.log('🔍 Testando operações CRUD no banco de dados...\n')
  
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL não está configurada')
    process.exit(1)
  }
  
  const sql = neon(databaseUrl)
  const testProcessNumber = `TEST-${Date.now()}`
  let processId: string
  
  try {
    // Teste 1: CREATE - Inserir novo processo
    console.log('1️⃣ CREATE - Inserindo novo processo de teste...')
    const insertResult = await sql`
      INSERT INTO processos (
        id, numero, tipo, interessado, data_geracao, 
        ultima_unidade, assunto, titulo
      ) VALUES (
        gen_random_uuid(),
        ${testProcessNumber},
        'Teste Automatizado',
        'Sistema de Testes',
        CURRENT_DATE,
        'Unidade de Testes',
        'Validação de CRUD',
        'Processo de Teste CRUD'
      )
      RETURNING id, numero
    `
    processId = insertResult[0].id
    console.log(`✅ Processo criado: ${insertResult[0].numero}`)
    console.log(`   ID: ${processId}\n`)
    
    // Teste 2: READ - Buscar processo criado
    console.log('2️⃣ READ - Buscando processo criado...')
    const readResult = await sql`
      SELECT * FROM processos 
      WHERE id = ${processId}
    `
    if (readResult.length > 0) {
      console.log('✅ Processo encontrado:')
      console.log(`   Número: ${readResult[0].numero}`)
      console.log(`   Tipo: ${readResult[0].tipo}`)
      console.log(`   Interessado: ${readResult[0].interessado}\n`)
    }
    
    // Teste 3: UPDATE - Atualizar processo
    console.log('3️⃣ UPDATE - Atualizando processo...')
    const updateResult = await sql`
      UPDATE processos 
      SET 
        assunto = 'Validação CRUD - Atualizado',
        concessionaria = 'Teste Concessionária',
        updated_at = NOW()
      WHERE id = ${processId}
      RETURNING assunto, concessionaria
    `
    console.log('✅ Processo atualizado:')
    console.log(`   Novo assunto: ${updateResult[0].assunto}`)
    console.log(`   Concessionária: ${updateResult[0].concessionaria}\n`)
    
    // Teste 4: Inserir dados relacionados
    console.log('4️⃣ RELACIONAMENTOS - Inserindo protocolo e andamento...')
    
    // Inserir protocolo
    await sql`
      INSERT INTO protocolos (
        id, processo_id, numero, tipo, data, unidade
      ) VALUES (
        gen_random_uuid(),
        ${processId},
        'PROT-TEST-001',
        'Protocolo de Teste',
        CURRENT_DATE,
        'Unidade de Testes'
      )
    `
    console.log('✅ Protocolo inserido')
    
    // Inserir andamento
    await sql`
      INSERT INTO andamentos (
        id, processo_id, data_hora, unidade, descricao
      ) VALUES (
        gen_random_uuid(),
        ${processId},
        NOW(),
        'Unidade de Testes',
        'Andamento de teste do sistema'
      )
    `
    console.log('✅ Andamento inserido\n')
    
    // Teste 5: Buscar com relacionamentos
    console.log('5️⃣ JOIN - Buscando processo com relacionamentos...')
    const joinResult = await sql`
      SELECT 
        p.numero as processo,
        COUNT(DISTINCT pr.id) as total_protocolos,
        COUNT(DISTINCT a.id) as total_andamentos
      FROM processos p
      LEFT JOIN protocolos pr ON pr.processo_id = p.id
      LEFT JOIN andamentos a ON a.processo_id = p.id
      WHERE p.id = ${processId}
      GROUP BY p.numero
    `
    console.log('✅ Dados relacionados:')
    console.log(`   Processo: ${joinResult[0].processo}`)
    console.log(`   Total de protocolos: ${joinResult[0].total_protocolos}`)
    console.log(`   Total de andamentos: ${joinResult[0].total_andamentos}\n`)
    
    // Teste 6: DELETE - Limpar dados de teste
    console.log('6️⃣ DELETE - Limpando dados de teste...')
    
    // Delete cascata (configurado no banco)
    const deleteResult = await sql`
      DELETE FROM processos 
      WHERE id = ${processId}
      RETURNING numero
    `
    console.log(`✅ Processo ${deleteResult[0].numero} removido (cascade delete)\n`)
    
    // Verificar se foi removido
    const checkDelete = await sql`
      SELECT COUNT(*) as count FROM processos WHERE id = ${processId}
    `
    if (checkDelete[0].count === '0') {
      console.log('✅ Confirmado: Processo removido com sucesso')
    }
    
    // Teste 7: Verificar integridade dos dados existentes
    console.log('\n7️⃣ INTEGRIDADE - Verificando dados existentes...')
    const integrity = await sql`
      SELECT 
        (SELECT COUNT(*) FROM processos) as processos,
        (SELECT COUNT(*) FROM protocolos) as protocolos,
        (SELECT COUNT(*) FROM andamentos) as andamentos,
        (SELECT COUNT(DISTINCT processo_id) FROM protocolos) as processos_com_protocolos,
        (SELECT COUNT(DISTINCT processo_id) FROM andamentos) as processos_com_andamentos
    `
    console.log('📊 Estado do banco:')
    console.log(`   Total de processos: ${integrity[0].processos}`)
    console.log(`   Total de protocolos: ${integrity[0].protocolos}`)
    console.log(`   Total de andamentos: ${integrity[0].andamentos}`)
    console.log(`   Processos com protocolos: ${integrity[0].processos_com_protocolos}`)
    console.log(`   Processos com andamentos: ${integrity[0].processos_com_andamentos}`)
    
    console.log('\n✅ Todos os testes CRUD passaram com sucesso!')
    console.log('🎉 O banco de dados está funcionando corretamente!')
    process.exit(0)
    
  } catch (error) {
    console.error('\n❌ Erro durante os testes CRUD:')
    console.error(error)
    
    // Tentar limpar dados de teste em caso de erro
    if (processId) {
      try {
        await sql`DELETE FROM processos WHERE id = ${processId}`
        console.log('\n🧹 Dados de teste limpos após erro')
      } catch (cleanupError) {
        console.log('⚠️  Não foi possível limpar dados de teste')
      }
    }
    
    process.exit(1)
  }
}

testCrudOperations()