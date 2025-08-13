"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Download, FileSpreadsheet, Filter, Loader2 } from 'lucide-react'
import * as XLSX from 'xlsx'

interface ReportData {
  processo: string
  tipo: string
  interessado: string
  dataGeracao: string
  ultimaUnidade: string
  dataUltimoAndamento: string
  protocolos: Array<{
    numero: string
    tipo: string
    data: string
    dataInclusao: string
    unidade: string
  }>
  andamentos: Array<{
    dataHora: string
    unidade: string
    descricao: string
  }>
}

export function UnifiedReport() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportData, setReportData] = useState<ReportData[]>([])

  // Dados mockados para demonstração
  const mockReportData: ReportData[] = [
    {
      processo: 'SEI-260002/002172/2025',
      tipo: 'Administrativo: Elaboração de Correspondência Interna',
      interessado: 'Agência de Inovação da UENF DGA/UENF',
      dataGeracao: '18/03/2025',
      ultimaUnidade: 'UENF/DGA',
      dataUltimoAndamento: '02/07/2025',
      protocolos: [
        { numero: '95725517', tipo: 'Correspondência Interna - NA 11', data: '19/03/2025', dataInclusao: '19/03/2025', unidade: 'UENF/DIRCCH' },
        { numero: '95786972', tipo: 'Anexo 1', data: '24/07/2024', dataInclusao: '18/03/2025', unidade: 'UENF/DIRCCH' },
        { numero: '95787469', tipo: 'Anexo 2', data: '15/08/2024', dataInclusao: '18/03/2025', unidade: 'UENF/DIRCCH' }
      ],
      andamentos: [
        { dataHora: '02/07/2025 12:45', unidade: 'UENF/DGA', descricao: 'Conclusão do processo na unidade' },
        { dataHora: '18/06/2025 18:09', unidade: 'UENF/LEEL', descricao: 'Processo recebido na unidade' },
        { dataHora: '18/06/2025 16:05', unidade: 'UENF/LEEL', descricao: 'Processo remetido pela unidade UENF/AGEINOV' }
      ]
    },
    {
      processo: 'SEI-260002/002175/2025',
      tipo: 'Administrativo: Solicitação de Compras',
      interessado: 'Laboratório de Ciências Químicas',
      dataGeracao: '20/03/2025',
      ultimaUnidade: 'UENF/GERCOMP',
      dataUltimoAndamento: '04/07/2025',
      protocolos: [
        { numero: '95725518', tipo: 'Solicitação de Compras', data: '20/03/2025', dataInclusao: '20/03/2025', unidade: 'UENF/GERCOMP' },
        { numero: '95786973', tipo: 'Orçamento 1', data: '25/03/2025', dataInclusao: '25/03/2025', unidade: 'UENF/GERCOMP' }
      ],
      andamentos: [
        { dataHora: '04/07/2025 15:23', unidade: 'UENF/GERCOMP', descricao: 'Processo em análise' },
        { dataHora: '25/03/2025 10:30', unidade: 'UENF/GERCOMP', descricao: 'Processo recebido na unidade' }
      ]
    }
  ]

  const generateReport = async () => {
    if (!startDate || !endDate) {
      alert('Por favor, selecione as datas de início e fim')
      return
    }

    setIsGenerating(true)
    try {
      const params = new URLSearchParams({ start: startDate, end: endDate })
      const res = await fetch(`/api/report?${params.toString()}`)
      if (res.ok) {
        const json = await res.json()
        // Espera: { processos: ReportData[] }
        setReportData(json.processos as ReportData[])
      } else {
        // Fallback: mock local
        setReportData(mockReportData)
      }
    } catch {
      setReportData(mockReportData)
    } finally {
      setIsGenerating(false)
    }
  }

  const exportToExcel = () => {
    if (reportData.length === 0) {
      alert('Gere o relatório primeiro')
      return
    }

    // Criar planilha unificada
    const unifiedData: Array<Record<string, string>> = []

    reportData.forEach(process => {
      // Protocolos
      process.protocolos.forEach(protocolo => {
        unifiedData.push({
          'Processo': process.processo,
          'Tipo Processo': process.tipo,
          'Interessado': process.interessado,
          'Data Geração': process.dataGeracao,
          'Última Unidade': process.ultimaUnidade,
          'Data Último Andamento': process.dataUltimoAndamento,
          'Tipo Item': 'PROTOCOLO',
          'Número Item': protocolo.numero,
          'Tipo Item Detalhado': protocolo.tipo,
          'Data Item': protocolo.data,
          'Data Inclusão': protocolo.dataInclusao,
          'Unidade': protocolo.unidade,
          'Descrição': '',
          'Data/Hora': ''
        })
      })
      // Andamentos
      process.andamentos.forEach(andamento => {
        unifiedData.push({
          'Processo': process.processo,
          'Tipo Processo': process.tipo,
          'Interessado': process.interessado,
          'Data Geração': process.dataGeracao,
          'Última Unidade': process.ultimaUnidade,
          'Data Último Andamento': process.dataUltimoAndamento,
          'Tipo Item': 'ANDAMENTO',
          'Número Item': '',
          'Tipo Item Detalhado': '',
          'Data Item': '',
          'Data Inclusão': '',
          'Unidade': andamento.unidade,
          'Descrição': andamento.descricao,
          'Data/Hora': andamento.dataHora
        })
      })
    })

    // Criar workbook
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(unifiedData)

    // Largura das colunas
    const colWidths = [
      { wch: 25 }, // Processo
      { wch: 40 }, // Tipo Processo
      { wch: 30 }, // Interessado
      { wch: 15 }, // Data Geração
      { wch: 20 }, // Última Unidade
      { wch: 20 }, // Data Último Andamento
      { wch: 15 }, // Tipo Item
      { wch: 15 }, // Número Item
      { wch: 30 }, // Tipo Item Detalhado
      { wch: 15 }, // Data Item
      { wch: 15 }, // Data Inclusão
      { wch: 20 }, // Unidade
      { wch: 50 }, // Descrição
      { wch: 20 }  // Data/Hora
    ]
    ws['!cols'] = colWidths

    XLSX.utils.book_append_sheet(wb, ws, 'Relatório Unificado')

    // Baixar via Blob (evita Deno.writeFileSync em ambiente browser)
    const fileName = `relatorio_sei_${startDate}_${endDate}.xlsx`
    try {
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 0)
    } catch (e: unknown) {
      console.error('Falha ao gerar Excel:', e)
      alert('Não foi possível gerar o Excel no navegador.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="border-pastel-blue-200 bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-pastel-blue-400" />
            Relatório Unificado de Processos SEI
          </CardTitle>
          <p className="text-sm text-gray-600">
            Exporte todos os andamentos e protocolos a partir de uma data específica
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="start-date">Data Inicial</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-pastel-blue-200 focus:border-pastel-blue-300 focus:ring-pastel-blue-200"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-date">Data Final</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-pastel-blue-200 focus:border-pastel-blue-300 focus:ring-pastel-blue-200"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={generateReport}
                disabled={isGenerating}
                className="bg-gradient-to-r from-pastel-blue-300 to-pastel-purple-300 hover:from-pastel-blue-400 hover:to-pastel-purple-400 text-white border-0"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Filter className="h-4 w-4 mr-2" />
                )}
                {isGenerating ? 'Gerando...' : 'Gerar Relatório'}
              </Button>

              {reportData.length > 0 && (
                <Button
                  onClick={exportToExcel}
                  variant="outline"
                  className="border-pastel-green-300 text-pastel-green-700 hover:bg-pastel-green-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Excel
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados – grid com design próximo da lista de processos */}
      {reportData.length > 0 && (
        <Card className="border-pastel-purple-200 bg-white/90 backdrop-blur-sm">
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-gray-800">Dados do Relatório</CardTitle>
                <p className="text-sm text-gray-600">
                  Período: {startDate} até {endDate}
                </p>
              </div>
              <div className="hidden md:flex items-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-pastel-blue-200 border border-pastel-blue-300 rounded"></div>
                  <span>Protocolos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-pastel-pink-200 border border-pastel-pink-300 rounded"></div>
                  <span>Andamentos</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-pastel-purple-50 border-b border-pastel-purple-200">
                  <tr>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Processo</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Tipo</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Interessado</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Última Unidade</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Data Andamento</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Protocolos</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Andamentos</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((process, index) => (
                    <tr
                      key={index}
                      className="border-b border-pastel-purple-100 hover:bg-pastel-purple-50/50 transition-colors"
                    >
                      <td className="py-2 px-3 align-top">
                        <span className="font-mono text-[13px] font-semibold text-pastel-purple-700">
                          {process.processo}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-[13px] text-gray-700 whitespace-normal break-words leading-snug">
                        {process.tipo}
                      </td>
                      <td className="py-2 px-3 text-[13px] text-gray-700 whitespace-normal break-words leading-snug">
                        {process.interessado}
                      </td>
                      <td className="py-2 px-3 text-[13px] text-gray-700">
                        {process.ultimaUnidade}
                      </td>
                      <td className="py-2 px-3 text-[13px] text-gray-600">
                        {process.dataUltimoAndamento}
                      </td>
                      <td className="py-2 px-3">
                        <Badge className="bg-pastel-blue-100 text-pastel-blue-700 border-pastel-blue-200 h-5 px-1.5 text-[11px]">
                          {process.protocolos.length}
                        </Badge>
                      </td>
                      <td className="py-2 px-3">
                        <Badge className="bg-pastel-pink-100 text-pastel-pink-700 border-pastel-pink-200 h-5 px-1.5 text-[11px]">
                          {process.andamentos.length}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Resumo inferior opcional */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-pastel-purple-200 text-xs text-gray-600">
              <div className="flex gap-2">
                <Badge className="bg-pastel-blue-100 text-pastel-blue-700 border-pastel-blue-200 h-5 px-1.5 text-[11px]">
                  {reportData.reduce((acc, p) => acc + p.protocolos.length, 0)} protocolos
                </Badge>
                <Badge className="bg-pastel-pink-100 text-pastel-pink-700 border-pastel-pink-200 h-5 px-1.5 text-[11px]">
                  {reportData.reduce((acc, p) => acc + p.andamentos.length, 0)} andamentos
                </Badge>
              </div>
              <div>
                Exibindo {reportData.length} processos
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
