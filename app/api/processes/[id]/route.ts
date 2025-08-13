import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { listProtocolosByProcessoId } from '@/lib/repositories/protocolos'
import { listAndamentosByProcessoId } from '@/lib/repositories/andamentos'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const db = getDb()
  if (!db) return NextResponse.json({ id: params.id, numero: 'SEI-...', tipo: '...', interessado: '...' })
  const rows = (await db(
    `SELECT id, numero, tipo, interessado, data_geracao, ultima_unidade, data_ultimo_andamento, assunto, concessionaria, titulo, tipo_custom
     FROM processos WHERE id = $1`,
    [params.id]
  )) as Array<{ id: string; numero: string; tipo: string; interessado: string; data_geracao: string | null; ultima_unidade: string | null; data_ultimo_andamento: string | null; assunto: string | null; concessionaria: string | null; titulo: string | null; tipo_custom: string | null }>
  if (!rows.length) return NextResponse.json({ message: 'Not found' }, { status: 404 })
  const p = rows[0]
  const [protocolos, andamentos] = await Promise.all([
    listProtocolosByProcessoId(params.id),
    listAndamentosByProcessoId(params.id),
  ])
  return NextResponse.json({ ...p, protocolos, andamentos })
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}))
  const db = getDb()
  if (!db) return NextResponse.json({ ok: true, id: params.id, changes: body })
  const fields: string[] = []
  const values: (string | null)[] = []
  const allowed = ['assunto', 'concessionaria', 'titulo', 'tipo_custom']
  for (const k of allowed) {
    if (k in body) {
      values.push(body[k])
      fields.push(`${k} = $${values.length}`)
    }
  }
  if (!fields.length) return NextResponse.json({ ok: true, id: params.id })
  values.push(params.id)
  await db(`UPDATE processos SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${values.length}`, values)
  return NextResponse.json({ ok: true, id: params.id })
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const db = getDb()
  if (!db) return NextResponse.json({ ok: true, id: params.id })
  await db(`DELETE FROM processos WHERE id = $1`, [params.id])
  return NextResponse.json({ ok: true })
}
