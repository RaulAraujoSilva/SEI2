import { neon } from '@neondatabase/serverless'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL não configurada.')
  process.exit(1)
}
const sql = neon(url)

async function main() {
  const id1 = crypto.randomUUID()
  const id2 = crypto.randomUUID()

  await sql`
    INSERT INTO processos (id, numero, tipo, interessado, data_geracao, ultima_unidade, data_ultimo_andamento, assunto, concessionaria, titulo, tipo_custom)
    VALUES
    (${id1}, 'SEI-260002/002172/2025', 'Administrativo: Elaboração de Correspondência Interna', 'Agência de Inovação da UENF DGA/UENF', '2025-03-18', 'UENF/DGA', '2025-07-02', 'Solicitação de análise técnica para implementação de sistema de monitoramento de qualidade da água', 'aguas-do-rio', 'indicadores-desempenho', 'julgado'),
    (${id2}, 'SEI-260002/002175/2025', 'Administrativo: Solicitação de Compras', 'Laboratório de Ciências Químicas', '2025-03-20', 'UENF/GERCOMP', '2025-07-04', 'Aquisição de equipamentos para laboratório de análise de água', 'cedae', 'aperfeicoamento-sistema', 'termo-encerramento')
    ON CONFLICT (numero) DO NOTHING;
  `
  console.log('Seed concluído.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
