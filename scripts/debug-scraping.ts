import * as cheerio from 'cheerio'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { fetchHtml } from '@/lib/scrapers/sei'
import { writeFileSync } from 'fs'

// Carrega as variáveis de ambiente
dotenv.config({ path: resolve(__dirname, '..', '.env') })

const TEST_URLS = [
  {
    name: 'Processo 1',
    url: 'https://sei.rj.gov.br/sei/modulos/pesquisa/md_pesq_processo_exibir.php?IC2o8Z7ACQH4LdQ4jJLJzjPBiLtP6l2FsQacllhUf-duzEubalut9yvd8-CzYYNLu7pd-wiM0k633-D6khhQNWcmSDZ7pQiEU0-fzi-haycwfope5I8xSVFCcuFRAsbo'
  },
  {
    name: 'Processo 2',
    url: 'https://sei.rj.gov.br/sei/modulos/pesquisa/md_pesq_processo_exibir.php?rhvLNMLonhi2QStBSsTZGiGoQmCrLQaX2XhbnBMJ8pkwCR3ymzAH-pH3jSIrZ5qWOweyB9pzdjQy283MIK0o5-cJWO9VKQpl3AODK8ULDj2yxrNRHbZaxL8K6rICcSP0'
  }
]

async function debugScraping() {
  console.log('🔍 Analisando estrutura HTML das páginas SEI...\n')
  
  for (let i = 0; i < TEST_URLS.length; i++) {
    const { name, url } = TEST_URLS[i]
    console.log(`\n📋 ${name.toUpperCase()}`)
    console.log(`🔗 URL: ${url.substring(0, 80)}...`)
    
    try {
      // Baixar HTML
      const html = await fetchHtml(url)
      const $ = cheerio.load(html)
      
      // Salvar HTML para análise offline
      const filename = `debug-${i + 1}-${Date.now()}.html`
      const filepath = resolve(__dirname, '..', 'temp', filename)
      try {
        writeFileSync(filepath, html, 'utf8')
        console.log(`📄 HTML salvo em: ${filename}`)
      } catch {
        console.log('⚠️  Não foi possível salvar HTML')
      }
      
      // Análise da estrutura
      console.log('\n🔍 ANÁLISE DA ESTRUTURA:')
      
      // 1. Informações básicas do processo
      console.log('\n1️⃣ Informações do Processo:')
      
      const tablesCells = $('td, th').map((_, el) => $(el).text().trim()).get()
      const relevantFields = ['Processo:', 'Tipo:', 'Data de Geração:', 'Interessados:']
      
      relevantFields.forEach(field => {
        const index = tablesCells.findIndex(text => text.includes(field))
        if (index !== -1 && index + 1 < tablesCells.length) {
          const value = tablesCells[index + 1]
          console.log(`   ${field} ${value}`)
        } else {
          console.log(`   ${field} ❌ NÃO ENCONTRADO`)
        }
      })
      
      // 2. Buscar por títulos de seções
      console.log('\n2️⃣ Seções encontradas:')
      const h3Titles = $('h3').map((_, el) => $(el).text().trim()).get()
      h3Titles.forEach(title => {
        if (title) {
          console.log(`   📋 ${title}`)
        }
      })
      
      // 3. Análise de tabelas
      console.log('\n3️⃣ Tabelas encontradas:')
      $('table').each((index, table) => {
        const rows = $(table).find('tr').length
        const firstRowCells = $(table).find('tr').first().find('td, th').length
        console.log(`   Tabela ${index + 1}: ${rows} linhas, ${firstRowCells} colunas`)
        
        // Mostrar cabeçalhos se existirem
        const headers = $(table).find('tr').first().find('th, td').map((_, cell) => 
          $(cell).text().trim()
        ).get().filter(text => text.length > 0)
        
        if (headers.length > 0) {
          console.log(`     Cabeçalhos: ${headers.join(' | ')}`)
        }
      })
      
      // 4. Buscar especificamente por protocolos
      console.log('\n4️⃣ Busca por Protocolos:')
      
      const protocolosSections = [
        'Lista de Protocolos',
        'Protocolos',
        'Lista de Documentos',
        'Documentos'
      ]
      
      let protocolosFound = false
      protocolosSections.forEach(section => {
        const sectionElement = $(`h3:contains("${section}")`).first()
        if (sectionElement.length > 0) {
          console.log(`   ✅ Seção encontrada: "${section}"`)
          const table = sectionElement.nextAll('table').first()
          if (table.length > 0) {
            const rows = table.find('tr').length
            console.log(`     📊 Tabela com ${rows} linhas`)
            protocolosFound = true
            
            // Mostrar algumas linhas de exemplo
            table.find('tr').slice(0, 3).each((rowIndex, row) => {
              const cells = $(row).find('td').map((_, cell) => 
                $(cell).text().trim().substring(0, 20)
              ).get()
              if (cells.length > 0) {
                console.log(`     Linha ${rowIndex + 1}: ${cells.join(' | ')}`)
              }
            })
          }
        }
      })
      
      if (!protocolosFound) {
        console.log('   ❌ Nenhuma seção de protocolos encontrada')
      }
      
      // 5. Buscar especificamente por andamentos
      console.log('\n5️⃣ Busca por Andamentos:')
      
      const andamentosSections = [
        'Lista de Andamentos',
        'Andamentos',
        'Histórico',
        'Tramitação'
      ]
      
      let andamentosFound = false
      andamentosSections.forEach(section => {
        const sectionElement = $(`h3:contains("${section}")`).first()
        if (sectionElement.length > 0) {
          console.log(`   ✅ Seção encontrada: "${section}"`)
          const table = sectionElement.nextAll('table').first()
          if (table.length > 0) {
            const rows = table.find('tr').length
            console.log(`     📊 Tabela com ${rows} linhas`)
            andamentosFound = true
            
            // Mostrar algumas linhas de exemplo
            table.find('tr').slice(0, 3).each((rowIndex, row) => {
              const cells = $(row).find('td').map((_, cell) => 
                $(cell).text().trim().substring(0, 30)
              ).get()
              if (cells.length > 0) {
                console.log(`     Linha ${rowIndex + 1}: ${cells.join(' | ')}`)
              }
            })
          }
        }
      })
      
      if (!andamentosFound) {
        console.log('   ❌ Nenhuma seção de andamentos encontrada')
      }
      
      // 6. Verificar se há conteúdo restrito
      console.log('\n6️⃣ Verificações de Acesso:')
      const bodyText = $('body').text()
      const restrictedKeywords = [
        'Acesso Restrito',
        'Processo ou Documento de Acesso Restrito',
        'Não é possível exibir',
        'Acesso negado',
        'Processo sigiloso'
      ]
      
      let hasRestrictions = false
      restrictedKeywords.forEach(keyword => {
        if (bodyText.includes(keyword)) {
          console.log(`   ⚠️  Encontrado: "${keyword}"`)
          hasRestrictions = true
        }
      })
      
      if (!hasRestrictions) {
        console.log('   ✅ Nenhuma restrição de acesso detectada')
      }
      
      // 7. Verificar encoding e caracteres especiais
      console.log('\n7️⃣ Verificação de Encoding:')
      const hasSpecialChars = /[^\x00-\x7F]/.test(html)
      console.log(`   Caracteres especiais: ${hasSpecialChars ? 'Sim' : 'Não'}`)
      
      const encoding = html.match(/charset=([^"'>]*)/i)
      console.log(`   Encoding declarado: ${encoding ? encoding[1] : 'Não encontrado'}`)
      
    } catch (error) {
      console.error(`\n❌ Erro ao analisar ${name}:`)
      console.error(error)
    }
    
    // Pausa entre análises
    if (i < TEST_URLS.length - 1) {
      console.log('\n⏳ Pausando 3 segundos...')
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('📋 ANÁLISE COMPLETA')
  console.log('='.repeat(60))
  console.log('💡 Use as informações acima para ajustar os seletores CSS no scraper')
  
  process.exit(0)
}

debugScraping()