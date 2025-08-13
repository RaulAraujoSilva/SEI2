import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { getDb } from '@/lib/db'

async function run() {
  const db = getDb()
  if (!db) {
    console.error('DATABASE_URL não configurada. Abortei migração.')
    process.exit(1)
  }
  const dir = path.resolve(process.cwd(), 'scripts/sql')
  const files = ['0001_init.sql', '0002_indexes.sql', '0003_add_source_url.sql', '0004_uuid_defaults.sql']
  for (const f of files) {
    const full = path.join(dir, f)
    if (!fs.existsSync(full)) {
      console.warn(`Arquivo SQL não encontrado: ${f}`)
      continue
    }
    const sql = fs.readFileSync(full, 'utf8')
    console.log(`Aplicando: ${f}`)
    // Executa cada statement separadamente para compatibilidade com drivers serverless
    const statements = sql
      .split(/;\s*\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    for (const stmt of statements) {
      await db(stmt)
    }
  }
  console.log('Migrações aplicadas com sucesso.')
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})


