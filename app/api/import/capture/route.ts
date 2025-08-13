import { NextResponse } from 'next/server'
import { z } from 'zod'
import { fetchHtml, parseSei } from '@/lib/scrapers/sei'

const schema = z.object({ url: z.string().url() })

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: 'URL inválida' }, { status: 400 })
  }

  try {
    const html = await fetchHtml(parsed.data.url)
    const data = parseSei(html)
    return NextResponse.json({
      numero: data.autuacao.numero,
      tipo: data.autuacao.tipo,
      dataGeracao: data.autuacao.dataGeracao,
      interessado: data.autuacao.interessado,
      protocolos: data.protocolos.map((p) => ({
        numero: p.numero,
        tipo: p.tipo,
        data: p.data,
        dataInclusao: p.dataInclusao,
        unidade: p.unidade,
      })),
      andamentos: data.andamentos.map((a) => ({
        dataHora: a.dataHora,
        unidade: a.unidade,
        descricao: a.descricao,
      })),
    })
  } catch (e: unknown) {
    const err = e as { message?: string }
    return NextResponse.json({ message: err?.message || 'Falha ao capturar dados do SEI' }, { status: 502 })
  }
}
