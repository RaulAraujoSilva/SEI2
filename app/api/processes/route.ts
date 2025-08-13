import { NextResponse } from 'next/server'
import { listProcesses } from '@/lib/repositories/processes'
import { z } from 'zod'
import { getDb } from '@/lib/db'

const createSchema = z.object({
  numero: z.string(),
  tipo: z.string(),
  interessado: z.string(),
  dataGeracao: z.string().optional(),
  ultimaUnidade: z.string().optional(),
  dataUltimoAndamento: z.string().optional(),
  assunto: z.string().optional(),
  concessionaria: z.string().optional(),
  titulo: z.string().optional(),
  tipoCustom: z.string().optional(),
})

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = url.searchParams.get('q') || undefined
  const start = url.searchParams.get('start') || undefined
  const end = url.searchParams.get('end') || undefined
  const data = await listProcesses(q, start, end)
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid body', issues: parsed.error.issues }, { status: 400 })
  }

  // Fallback: quando sem DB configurado, apenas ecoa com id mockado
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ id: crypto.randomUUID(), ...parsed.data }, { status: 201 })
  }

  const db = getDb()
  if (!db) return NextResponse.json({ id: crypto.randomUUID(), ...parsed.data }, { status: 201 })
  const id = crypto.randomUUID()
  const rows = (await db(
    `INSERT INTO processos (id, numero, tipo, interessado, data_geracao, ultima_unidade, data_ultimo_andamento, assunto, concessionaria, titulo, tipo_custom)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     ON CONFLICT (numero) DO UPDATE SET
       tipo = EXCLUDED.tipo,
       interessado = EXCLUDED.interessado,
       data_geracao = COALESCE(EXCLUDED.data_geracao, processos.data_geracao),
       ultima_unidade = COALESCE(EXCLUDED.ultima_unidade, processos.ultima_unidade),
       data_ultimo_andamento = COALESCE(EXCLUDED.data_ultimo_andamento, processos.data_ultimo_andamento),
       assunto = COALESCE(EXCLUDED.assunto, processos.assunto),
       concessionaria = COALESCE(EXCLUDED.concessionaria, processos.concessionaria),
       titulo = COALESCE(EXCLUDED.titulo, processos.titulo),
       tipo_custom = COALESCE(EXCLUDED.tipo_custom, processos.tipo_custom),
       updated_at = NOW()
     RETURNING id`,
    [
      id,
      parsed.data.numero,
      parsed.data.tipo,
      parsed.data.interessado,
      parsed.data.dataGeracao ?? null,
      parsed.data.ultimaUnidade ?? null,
      parsed.data.dataUltimoAndamento ?? null,
      parsed.data.assunto ?? null,
      parsed.data.concessionaria ?? null,
      parsed.data.titulo ?? null,
      parsed.data.tipoCustom ?? null,
    ]
  )) as Array<{ id: string }>
  const createdId = rows?.[0]?.id ?? id
  return NextResponse.json({ id: createdId }, { status: 201 })
}
