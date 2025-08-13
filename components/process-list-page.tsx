"use client"

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Calendar, ExternalLink, Eye, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { ProcessDetailModal } from '@/components/process-detail-modal'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface ProcessData {
  id: string
  numero: string
  tipo: string
  interessado: string
  dataGeracao: string
  protocolos: {
    total: number
    novos: number
  }
  andamentos: {
    total: number
    novos: number
  }
  ultimaAtualizacao: string
  ultimaUnidade: string
  dataUltimoAndamento: string
  hasUpdates: boolean
  // campos personalizados
  assunto?: string
  concessionaria?: string
  titulo?: string
  tipoCustom?: string
}

const seedProcesses: ProcessData[] = [
  {
    id: '1',
    numero: 'SEI-260002/002172/2025',
    tipo: 'Administrativo: Elaboração de Correspondência Interna',
    interessado: 'Agência de Inovação da UENF DGA/UENF',
    dataGeracao: '18/03/2025',
    protocolos: { total: 142, novos: 3 },
    andamentos: { total: 218, novos: 5 },
    ultimaAtualizacao: '02/07/2025 12:45',
    ultimaUnidade: 'UENF/DGA',
    dataUltimoAndamento: '02/07/2025',
    hasUpdates: true,
    assunto:
      'Solicitação de análise técnica para implementação de sistema de monitoramento de qualidade da água',
    concessionaria: 'aguas-do-rio',
    titulo: 'indicadores-desempenho',
    tipoCustom: 'julgado',
  },
  {
    id: '2',
    numero: 'SEI-260002/002175/2025',
    tipo: 'Administrativo: Solicitação de Compras',
    interessado: 'Laboratório de Ciências Químicas',
    dataGeracao: '20/03/2025',
    protocolos: { total: 95, novos: 8 },
    andamentos: { total: 187, novos: 12 },
    ultimaAtualizacao: '04/07/2025 15:23',
    ultimaUnidade: 'UENF/DGA',
    dataUltimoAndamento: '04/07/2025',
    hasUpdates: true,
    assunto: 'Aquisição de equipamentos para laboratório de análise de água',
    concessionaria: 'cedae',
    titulo: 'aperfeicoamento-sistema',
    tipoCustom: 'termo-encerramento',
  },
  {
    id: '3',
    numero: 'SEI-260002/002171/2025',
    tipo: 'Administrativo: Solicitação de Material',
    interessado: 'Laboratório de Engenharia Elétrica - UENF',
    dataGeracao: '15/03/2025',
    protocolos: { total: 23, novos: 0 },
    andamentos: { total: 45, novos: 0 },
    ultimaAtualizacao: '25/06/2025 09:15',
    ultimaUnidade: 'UENF/DGA',
    dataUltimoAndamento: '25/06/2025',
    hasUpdates: false,
  },
  {
    id: '4',
    numero: 'SEI-260002/002170/2025',
    tipo: 'Administrativo: Prestação de Contas',
    interessado: 'Setor de Contabilidade - SETCONT/UENF',
    dataGeracao: '10/03/2025',
    protocolos: { total: 56, novos: 1 },
    andamentos: { total: 89, novos: 2 },
    ultimaAtualizacao: '04/07/2025 10:30',
    ultimaUnidade: 'UENF/DGA',
    dataUltimoAndamento: '04/07/2025',
    hasUpdates: true,
  },
  {
    id: '5',
    numero: 'SEI-260002/002168/2025',
    tipo: 'Administrativo: Convênio Institucional',
    interessado: 'Reitoria - UENF',
    dataGeracao: '08/03/2025',
    protocolos: { total: 78, novos: 4 },
    andamentos: { total: 156, novos: 7 },
    ultimaAtualizacao: '03/07/2025 14:50',
    ultimaUnidade: 'UENF/DGA',
    dataUltimoAndamento: '03/07/2025',
    hasUpdates: true,
  },
]

export function ProcessListPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProcess, setSelectedProcess] = useState<ProcessData | null>(null)
  const [dateFilter, setDateFilter] = useState<'hoje' | 'week' | 'month'>('week')
  const [processes, setProcesses] = useState<ProcessData[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function getDateRange(filter: 'hoje' | 'week' | 'month'): { start: string; end: string } {
    const now = new Date()
    const end = now.toISOString().slice(0, 10)
    const d = new Date(now)
    if (filter === 'hoje') {
      // start = today
    } else if (filter === 'week') {
      d.setDate(d.getDate() - 7)
    } else {
      d.setDate(d.getDate() - 30)
    }
    const start = d.toISOString().slice(0, 10)
    return { start, end }
  }

  function mapApiToProcess(row: any): ProcessData {
    return {
      id: row.id,
      numero: row.numero,
      tipo: row.tipo,
      interessado: row.interessado,
      dataGeracao: row.data_geracao || '',
      protocolos: { total: 0, novos: 0 },
      andamentos: { total: 0, novos: 0 },
      ultimaAtualizacao: '',
      ultimaUnidade: row.ultima_unidade || '',
      dataUltimoAndamento: row.data_ultimo_andamento || '',
      hasUpdates: false,
      assunto: row.assunto || undefined,
      concessionaria: row.concessionaria || undefined,
      titulo: row.titulo || undefined,
      tipoCustom: row.tipo_custom || undefined,
    }
  }

  async function fetchProcesses() {
    try {
      setLoading(true)
      setError(null)
      const { start, end } = getDateRange(dateFilter)
      const params = new URLSearchParams()
      if (searchTerm) params.set('q', searchTerm)
      params.set('start', start)
      params.set('end', end)
      const res = await fetch(`/api/processes?${params.toString()}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Falha ao carregar processos')
      const json = await res.json()
      const items = Array.isArray(json.items) ? json.items : []
      setProcesses(items.map(mapApiToProcess))
    } catch (e: any) {
      setError(e?.message || 'Erro ao carregar')
      setProcesses([])
    } finally {
      setLoading(false)
    }
  }

  async function deleteProcess(id: string) {
    try {
      await fetch(`/api/processes/${id}`, { method: 'DELETE' })
      setProcesses((prev) => prev.filter((p) => p.id !== id))
    } catch {}
  }

  // carregar ao inicializar e quando filtros mudarem
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => { void fetchProcesses() }, [])
  useMemo(() => { void fetchProcesses() }, [dateFilter])

  const filteredProcesses = useMemo(() => {
    return processes.filter((process) => {
      const term = searchTerm.toLowerCase()
      return (
        process.numero.toLowerCase().includes(term) ||
        process.tipo.toLowerCase().includes(term) ||
        process.interessado.toLowerCase().includes(term) ||
        (process.assunto || '').toLowerCase().includes(term)
      )
    })
  }, [processes, searchTerm])

  const processesWithUpdates = filteredProcesses.filter((p) => p.hasUpdates)
    .length
  const totalNewItems = filteredProcesses.reduce(
    (acc, p) => acc + p.protocolos.novos + p.andamentos.novos,
    0
  )

  const handleDelete = (id: string) => {
    setDeletingId(null)
    void deleteProcess(id)
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-5">
        {/* Header Stats (compacto) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="border-pastel-blue-200 bg-pastel-blue-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">
                    Total de Processos
                  </p>
                  <p className="text-2xl font-bold text-pastel-blue-600">
                    {loading ? '…' : filteredProcesses.length}
                  </p>
                </div>
                <div className="h-10 w-10 bg-pastel-blue-200 rounded-lg flex items-center justify-center">
                  <Search className="h-5 w-5 text-pastel-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-pastel-peach-200 bg-pastel-peach-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">
                    Com Atualizações
                  </p>
                  <p className="text-2xl font-bold text-pastel-peach-600">
                    {processesWithUpdates}
                  </p>
                </div>
                <div className="h-10 w-10 bg-pastel-peach-200 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-pastel-peach-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-pastel-green-200 bg-pastel-green-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Novos Itens</p>
                  <p className="text-2xl font-bold text-pastel-green-600">
                    {totalNewItems}
                  </p>
                </div>
                <div className="h-10 w-10 bg-pastel-green-200 rounded-lg flex items-center justify-center">
                  <Eye className="h-5 w-5 text-pastel-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros (compacto) */}
        <Card className="border-pastel-purple-200 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Pesquisar por número, tipo, interessado ou assunto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 text-sm border-pastel-purple-200 focus:border-pastel-purple-300 focus:ring-pastel-purple-200"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                {(['hoje', 'week', 'month'] as const).map((filter) => (
                  <Button
                    key={filter}
                    variant={dateFilter === filter ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDateFilter(filter)}
                    className={
                      dateFilter === filter
                        ? 'h-9 bg-gradient-to-r from-pastel-purple-300 to-pastel-pink-300 text-white border-0'
                        : 'h-9 border-pastel-purple-300 text-pastel-purple-700 hover:bg-pastel-purple-50'
                    }
                  >
                    {filter === 'hoje'
                      ? 'Hoje'
                      : filter === 'week'
                        ? '7 dias'
                        : '30 dias'}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Processos (compacta, com quebras) */}
        <Card className="border-pastel-purple-200 bg-white/90 backdrop-blur-sm">
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-gray-800">
                Lista de Processos
              </CardTitle>
              <div className="hidden md:flex items-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-pastel-blue-200 border border-pastel-blue-300 rounded"></div>
                  <span>Novos Protocolos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-pastel-pink-200 border border-pastel-pink-300 rounded"></div>
                  <span>Novos Andamentos</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {error && (
                <div className="px-3 py-2 text-sm text-red-600">{error}</div>
              )}
              <table className="w-full text-sm">
                <thead className="bg-pastel-purple-50 border-b border-pastel-purple-200">
                  <tr>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">
                      Ações
                    </th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">
                      Processo
                    </th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">
                      Tipo
                    </th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">
                      Interessado
                    </th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">
                      Assunto
                    </th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">
                      Última Unidade
                    </th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">
                      Data Andamento
                    </th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">
                      Protocolos
                    </th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">
                      Andamentos
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProcesses.map((process) => (
                    <tr
                      key={process.id}
                      className={`border-b border-pastel-purple-100 hover:bg-pastel-purple-25 transition-colors ${
                        process.hasUpdates ? 'border-l-4 border-l-pastel-peach-300' : ''
                      }`}
                    >
                      {/* Ações – inicio da linha */}
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5">
                          {/* Detalhar/Editar */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                aria-label="Detalhar e editar"
                                className="h-8 w-8 border-pastel-purple-300 text-pastel-purple-700 hover:bg-pastel-purple-50"
                                onClick={() => setSelectedProcess(process)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Detalhar e editar</TooltipContent>
                          </Tooltip>

                          {/* Abrir SEI */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <a
                                href={`https://sei.rj.gov.br/sei/modulos/pesquisa/md_pesq_processo_exibir.php?${process.numero}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Abrir no SEI"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-pastel-blue-300 text-pastel-blue-700 hover:bg-pastel-blue-50 transition-colors"
                                title="Abrir no SEI"
                              >
                                <ExternalLink className="h-4 w-4" />
                                <span className="sr-only">{'Abrir no SEI'}</span>
                              </a>
                            </TooltipTrigger>
                            <TooltipContent>Abrir no SEI</TooltipContent>
                          </Tooltip>

                          {/* Deletar */}
                          <AlertDialog open={deletingId === process.id} onOpenChange={(open) => setDeletingId(open ? process.id : null)}>
                            <Tooltip>
                              <AlertDialogTrigger asChild>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    aria-label="Deletar processo"
                                    className="h-8 w-8 border-red-200 text-red-600 hover:bg-red-50"
                                    onClick={() => setDeletingId(process.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                              </AlertDialogTrigger>
                              <TooltipContent>Deletar processo</TooltipContent>
                            </Tooltip>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover processo da lista?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação remove o processo {process.numero} da lista local. Você poderá importá-lo novamente quando quiser.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-pastel-purple-300">
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 hover:bg-red-600"
                                  onClick={() => handleDelete(process.id)}
                                >
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>

                      {/* Processo */}
                      <td className="py-2 px-3 align-top">
                        <div className="flex items-start gap-2">
                          <button
                            onClick={() => setSelectedProcess(process)}
                            className="font-mono text-[13px] font-semibold text-pastel-purple-700 hover:text-pastel-purple-800 hover:underline text-left"
                          >
                            {process.numero}
                          </button>
                        </div>
                      </td>

                      {/* Tipo – com quebra */}
                      <td className="py-2 px-3 text-[13px] text-gray-700 whitespace-normal break-words leading-snug">
                        {process.tipo}
                      </td>

                      {/* Interessado – com quebra */}
                      <td className="py-2 px-3 text-[13px] text-gray-700 whitespace-normal break-words leading-snug">
                        {process.interessado}
                      </td>

                      {/* Assunto – novo campo com quebra */}
                      <td className="py-2 px-3 text-[13px] text-gray-700 whitespace-normal break-words leading-snug">
                        {process.assunto ?? '—'}
                      </td>

                      {/* Última Unidade */}
                      <td className="py-2 px-3 text-[13px] text-gray-700">
                        {process.ultimaUnidade}
                      </td>

                      {/* Data Andamento */}
                      <td className="py-2 px-3 text-[13px] text-gray-600">
                        {process.dataUltimoAndamento}
                      </td>

                      {/* Protocolos */}
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          {process.protocolos.novos > 0 ? (
                            <Badge className="bg-pastel-blue-100 text-pastel-blue-700 border-pastel-blue-200 h-5 px-1.5 text-[11px]">
                              +{process.protocolos.novos}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-gray-300 text-gray-500 h-5 px-1.5 text-[11px]"
                            >
                              0
                            </Badge>
                          )}
                          <span className="text-[11px] text-gray-500">
                            {process.protocolos.total} total
                          </span>
                        </div>
                      </td>

                      {/* Andamentos */}
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          {process.andamentos.novos > 0 ? (
                            <Badge className="bg-pastel-pink-100 text-pastel-pink-700 border-pastel-pink-200 h-5 px-1.5 text-[11px]">
                              +{process.andamentos.novos}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-gray-300 text-gray-500 h-5 px-1.5 text-[11px]"
                            >
                              0
                            </Badge>
                          )}
                          <span className="text-[11px] text-gray-500">
                            {process.andamentos.total} total
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-pastel-purple-200">
              <div className="text-xs text-gray-600">
                Exibindo 1-{filteredProcesses.length} de {filteredProcesses.length} processos
              </div>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" disabled className="h-8 border-pastel-purple-300">
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button variant="outline" size="sm" className="h-8 bg-pastel-purple-100 border-pastel-purple-300 text-pastel-purple-700">
                  1
                </Button>
                <Button variant="outline" size="sm" disabled className="h-8 border-pastel-purple-300">
                  Próximo
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal de Detalhes */}
        {selectedProcess && (
          <ProcessDetailModal
            process={selectedProcess}
            onClose={() => setSelectedProcess(null)}
          />
        )}
      </div>
    </TooltipProvider>
  )
}
