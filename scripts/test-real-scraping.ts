import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { fetchHtml } from '@/lib/scrapers/sei'
import { importFromHtml } from '@/lib/services/importer'
import { logInfo } from '@/lib/logger'

// Carrega as variáveis de ambiente
dotenv.config({ path: resolve(__dirname, '..', '.env') })

const TEST_URLS = [
  'https://sei.rj.gov.br/sei/modulos/pesquisa/md_pesq_processo_exibir.php?IC2o8Z7ACQH4LdQ4jJLJzjPBiLtP6l2FsQacllhUf-duzEubalut9yvd8-CzYYNLu7pd-wiM0k633-D6khhQNWcmSDZ7pQiEU0-fzi-haycwfope5I8xSVFCcuFRAsbo',
  'https://sei.rj.gov.br/sei/modulos/pesquisa/md_pesq_processo_exibir.php?rhvLNMLonhi2QStBSsTZGiGoQmCrLQaX2XhbnBMJ8pkwCR3ymzAH-pH3jSIrZ5qWOweyB9pzdjQy283MIK0o5-cJWO9VKQpl3AODK8ULDj2yxrNRHbZaxL8K6rICcSP0'
]

async function testRealScraping() {
  console.log('🔍 Testando web scraping com URLs reais do SEI-RJ...\n')
  
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL não está configurada')
    process.exit(1)
  }
  
  const sql = neon(databaseUrl)
  
  for (let i = 0; i < TEST_URLS.length; i++) {
    const url = TEST_URLS[i]
    console.log(`\n📋 TESTE ${i + 1}/2`)
    console.log(`🔗 URL: ${url.substring(0, 80)}...`)
    
    try {
      // Passo 1: Fazer scraping do HTML
      console.log('\n1️⃣ Fazendo scraping do HTML...')
      const startTime = Date.now()
      
      const html = await fetchHtml(url)
      const fetchDuration = Date.now() - startTime
      
      console.log(`✅ HTML baixado com sucesso`)
      console.log(`   Tamanho: ${html.length} caracteres`)
      console.log(`   Tempo: ${fetchDuration}ms`)
      
      // Verificar se o HTML contém dados do processo
      if (html.includes('Número do Processo') || html.includes('Tipo do Processo')) {
        console.log('✅ HTML contém estrutura esperada do SEI')
      } else {
        console.log('⚠️  HTML pode não conter dados de processo válidos')
      }
      
      // Passo 2: Processar e importar dados
      console.log('\n2️⃣ Processando e importando dados...')
      const importStartTime = Date.now()
      
      const result = await importFromHtml(url, html)
      const importDuration = Date.now() - importStartTime
      
      console.log(`✅ Dados processados e salvos`)
      console.log(`   Novos protocolos: ${result.novosProtocolos}`)
      console.log(`   Novos andamentos: ${result.novosAndamentos}`)
      console.log(`   Tempo de processamento: ${importDuration}ms`)
      
      // Passo 3: Verificar dados salvos no banco
      console.log('\n3️⃣ Verificando dados salvos no banco...')
      
      // Buscar o processo recém-importado
      const processos = await sql`
        SELECT 
          id, numero, tipo, interessado, data_geracao,
          ultima_unidade, data_ultimo_andamento, assunto,
          concessionaria, titulo, tipo_custom, source_url
        FROM processos 
        WHERE source_url = ${url}
        ORDER BY created_at DESC
        LIMIT 1
      `
      
      if (processos.length > 0) {
        const processo = processos[0]
        console.log('✅ Processo encontrado no banco:')
        console.log(`   ID: ${processo.id}`)
        console.log(`   Número: ${processo.numero}`)
        console.log(`   Tipo: ${processo.tipo}`)
        console.log(`   Interessado: ${processo.interessado}`)
        console.log(`   Data Geração: ${processo.data_geracao}`)
        console.log(`   Última Unidade: ${processo.ultima_unidade}`)
        console.log(`   Data Último Andamento: ${processo.data_ultimo_andamento}`)
        console.log(`   Assunto: ${processo.assunto}`)
        console.log(`   Concessionária: ${processo.concessionaria || 'N/A'}`)
        console.log(`   Título: ${processo.titulo || 'N/A'}`)
        console.log(`   Tipo Custom: ${processo.tipo_custom || 'N/A'}`)
        
        // Buscar protocolos
        const protocolos = await sql`
          SELECT id, numero, tipo, data, data_inclusao, unidade
          FROM protocolos 
          WHERE processo_id = ${processo.id}
          ORDER BY data DESC
        `
        
        console.log(`\n📄 Protocolos salvos: ${protocolos.length}`)
        protocolos.forEach((p, index) => {
          console.log(`   ${index + 1}. ${p.numero} (${p.tipo})`)
          console.log(`      Data: ${p.data}, Unidade: ${p.unidade}`)
        })
        
        // Buscar andamentos
        const andamentos = await sql`
          SELECT id, data_hora, unidade, descricao
          FROM andamentos 
          WHERE processo_id = ${processo.id}
          ORDER BY data_hora DESC
        `
        
        console.log(`\n📝 Andamentos salvos: ${andamentos.length}`)
        andamentos.forEach((a, index) => {
          console.log(`   ${index + 1}. ${a.data_hora}`)
          console.log(`      Unidade: ${a.unidade}`)
          console.log(`      Descrição: ${a.descricao?.substring(0, 100)}${a.descricao?.length > 100 ? '...' : ''}`)
        })
        
        // Validar integridade dos dados
        console.log('\n🔍 Validando integridade dos dados:')
        
        const validations = []
        
        if (!processo.numero || processo.numero.trim() === '') {
          validations.push('❌ Número do processo não capturado')
        } else {
          validations.push('✅ Número do processo válido')
        }
        
        if (!processo.tipo || processo.tipo.trim() === '') {
          validations.push('❌ Tipo do processo não capturado')
        } else {
          validations.push('✅ Tipo do processo válido')
        }
        
        if (!processo.interessado || processo.interessado.trim() === '') {
          validations.push('❌ Interessado não capturado')
        } else {
          validations.push('✅ Interessado válido')
        }
        
        if (protocolos.length === 0) {
          validations.push('⚠️  Nenhum protocolo encontrado')
        } else {
          validations.push(`✅ ${protocolos.length} protocolo(s) capturado(s)`)
        }
        
        if (andamentos.length === 0) {
          validations.push('⚠️  Nenhum andamento encontrado')
        } else {
          validations.push(`✅ ${andamentos.length} andamento(s) capturado(s)`)
        }
        
        validations.forEach(v => console.log(`   ${v}`))
        
        // Calcular score de qualidade
        const validCount = validations.filter(v => v.startsWith('✅')).length
        const totalChecks = validations.length
        const qualityScore = Math.round((validCount / totalChecks) * 100)
        
        console.log(`\n📊 Score de Qualidade: ${qualityScore}% (${validCount}/${totalChecks} checks passou)`)
        
        if (qualityScore >= 80) {
          console.log('🎉 Dados capturados com alta qualidade!')
        } else if (qualityScore >= 60) {
          console.log('⚠️  Dados capturados com qualidade média')
        } else {
          console.log('❌ Dados capturados com baixa qualidade')
        }
        
      } else {
        console.log('❌ Nenhum processo encontrado no banco para esta URL')
      }
      
    } catch (error) {
      console.error(`\n❌ Erro no teste ${i + 1}:`)
      console.error(error)
      
      if (error instanceof Error && error.message.includes('fetch')) {
        console.log('\n💡 Possíveis causas:')
        console.log('   - URL pode estar inválida ou expirada')
        console.log('   - Servidor SEI pode estar bloqueando requests')
        console.log('   - Necessário autenticação ou sessão ativa')
        console.log('   - Rate limiting do servidor')
      }
    }
    
    // Pausa entre testes para evitar rate limiting
    if (i < TEST_URLS.length - 1) {
      console.log('\n⏳ Pausando 5 segundos antes do próximo teste...')
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }
  
  // Resumo final
  console.log('\n' + '='.repeat(60))
  console.log('📋 RESUMO FINAL DOS TESTES')
  console.log('='.repeat(60))
  
  const totalProcesses = await sql`
    SELECT COUNT(*) as total FROM processos 
    WHERE source_url IN (${TEST_URLS[0]}, ${TEST_URLS[1]})
  `
  
  const totalProtocols = await sql`
    SELECT COUNT(*) as total FROM protocolos p
    INNER JOIN processos pr ON p.processo_id = pr.id
    WHERE pr.source_url IN (${TEST_URLS[0]}, ${TEST_URLS[1]})
  `
  
  const totalAndamentos = await sql`
    SELECT COUNT(*) as total FROM andamentos a
    INNER JOIN processos pr ON a.processo_id = pr.id
    WHERE pr.source_url IN (${TEST_URLS[0]}, ${TEST_URLS[1]})
  `
  
  console.log(`📊 Processos importados: ${totalProcesses[0].total}`)
  console.log(`📄 Total de protocolos: ${totalProtocols[0].total}`)
  console.log(`📝 Total de andamentos: ${totalAndamentos[0].total}`)
  
  if (parseInt(totalProcesses[0].total) === TEST_URLS.length) {
    console.log('\n🎉 Todos os testes de scraping foram bem-sucedidos!')
    console.log('✅ O sistema de web scraping está funcionando corretamente')
  } else {
    console.log('\n⚠️  Alguns testes falharam')
    console.log('❗ Verifique os logs acima para detalhes dos problemas')
  }
  
  process.exit(0)
}

testRealScraping()