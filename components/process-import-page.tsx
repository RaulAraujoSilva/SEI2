"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Search, FileText, Loader2 } from 'lucide-react'
import { ProcessPreview } from '@/components/process-preview'
import { RecentProcesses } from '@/components/recent-processes'
import { BatchImport } from '@/components/batch-import'
import { UpdateManager } from '@/components/update-manager'

interface ProcessData {
  numero: string
  tipo: string
  dataGeracao: string
  interessados: string
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

export function ProcessImportPage() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [processData, setProcessData] = useState<ProcessData | null>(null)
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info' | null
    message: string
  }>({ type: null, message: '' })

  const validateUrl = (value: string): boolean => {
    try {
      const u = new URL(value)
      return u.hostname.includes('sei')
    } catch {
      return false
    }
  }

  const captureProcess = async () => {
    if (!url.trim()) {
      setStatus({
        type: 'error',
        message: 'Por favor, insira uma URL válida do SEI'
      })
      return
    }

    if (!validateUrl(url)) {
      setStatus({
        type: 'error',
        message: 'URL inválida. Por favor, insira uma URL do sistema SEI'
      })
      return
    }

    setIsLoading(true)
    setStatus({ type: 'info', message: 'Conectando ao SEI e capturando dados...' })
    try {
      const res = await fetch('/api/import/capture', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url })
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.message || 'Falha ao capturar dados')
      }
      const data = await res.json()
      const mapped: ProcessData = {
        numero: data.numero,
        tipo: data.tipo,
        dataGeracao: data.dataGeracao || '',
        interessados: data.interessado || data.interessados || '',
        protocolos: (data.protocolos || []).map((p: { numero?: string; tipo?: string; data?: string; dataInclusao?: string; unidade?: string }) => ({
          numero: p.numero,
          tipo: p.tipo,
          data: p.data || '',
          dataInclusao: p.dataInclusao || '',
          unidade: p.unidade || ''
        })),
        andamentos: (data.andamentos || []).map((a: { dataHora?: string; unidade?: string; descricao?: string }) => ({
          dataHora: a.dataHora || '',
          unidade: a.unidade || '',
          descricao: a.descricao || ''
        }))
      }
      setProcessData(mapped)
      setStatus({ type: 'success', message: 'Dados capturados com sucesso!' })
    } catch (e: unknown) {
      const err = e as { message?: string }
      setStatus({ type: 'error', message: err?.message || 'Erro ao capturar dados' })
    } finally {
      setIsLoading(false)
    }
  }

  const saveProcess = () => {
    setStatus({
      type: 'success',
      message: 'Processo salvo com sucesso no banco de dados!'
    })

    setTimeout(() => {
      clearForm()
    }, 3000)
  }

  const clearForm = () => {
    setUrl('')
    setProcessData(null)
    setStatus({ type: null, message: '' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-pink-50 via-pastel-purple-50 to-pastel-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm border-pastel-pink-100">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3">
              <FileText className="h-8 w-8 text-pastel-pink-400" />
              Sistema de Importação de Processos SEI
            </CardTitle>
            <p className="text-gray-600 text-lg">
              Capture automaticamente dados de processos do SEI através da URL
            </p>
          </CardHeader>
        </Card>

        {/* Main Import Section */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm border-pastel-purple-100">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* URL Input */}
              <div className="space-y-3">
                <Label htmlFor="url-input" className="text-base font-semibold text-gray-700">
                  URL do Processo SEI
                </Label>
                <div className="flex gap-3">
                  <Input
                    id="url-input"
                    type="url"
                    placeholder="https://sei.rj.gov.br/sei/modulos/pesquisa/md_pesq_processo_exibir.php?..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 h-11 text-base border-pastel-purple-200 focus:border-pastel-purple-300 focus:ring-pastel-purple-200"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={captureProcess}
                    disabled={isLoading}
                    className="h-11 px-6 bg-gradient-to-r from-pastel-pink-300 to-pastel-purple-300 hover:from-pastel-pink-400 hover:to-pastel-purple-400 text-white border-0 shadow-lg"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <Search className="h-5 w-5 mr-2" />
                    )}
                    {isLoading ? 'Capturando...' : 'Capturar Dados'}
                  </Button>
                </div>

                {/* Status Message */}
                {status.type && (
                  <Alert className={`${
                    status.type === 'success' ? 'border-pastel-green-200 bg-pastel-green-50' :
                    status.type === 'error' ? 'border-red-200 bg-red-50' :
                    'border-pastel-blue-200 bg-pastel-blue-50'
                  }`}>
                    {status.type === 'success' ? null : null}
                    <AlertDescription className={`${
                      status.type === 'success' ? 'text-pastel-green-700' :
                      status.type === 'error' ? 'text-red-700' :
                      'text-pastel-blue-700'
                    }`}>
                      {status.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Process Preview */}
              {processData && (
                <ProcessPreview 
                  data={processData} 
                  onSave={saveProcess}
                  onClear={clearForm}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Batch Import */}
        <BatchImport />

        {/* Update Manager */}
        <UpdateManager />

        {/* Recent Processes */}
        <RecentProcesses />
      </div>
    </div>
  )
}
