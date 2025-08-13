"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Package, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export function BatchImport() {
  const [batchUrls, setBatchUrls] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info' | null
    message: string
  }>({ type: null, message: '' })

  const processBatch = async () => {
    const urls = batchUrls.split('\n').filter(url => url.trim())
    
    if (urls.length === 0) {
      setStatus({
        type: 'error',
        message: 'Por favor, insira pelo menos uma URL'
      })
      return
    }

    setIsProcessing(true)
    setStatus({
      type: 'info',
      message: `Processando ${urls.length} URLs em lote...`
    })

    // Simula processamento
    setTimeout(() => {
      setStatus({
        type: 'success',
        message: `${urls.length} processos capturados e salvos com sucesso!`
      })
      setBatchUrls('')
      setIsProcessing(false)
    }, 3000)
  }

  return (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm border-pastel-peach-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-6 w-6 text-pastel-peach-400" />
          Importação em Lote
        </CardTitle>
        <p className="text-gray-600">
          Cole múltiplas URLs (uma por linha) para captura automática em sequência
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder={`https://sei.rj.gov.br/sei/modulos/pesquisa/md_pesq_processo_exibir.php?...
https://sei.rj.gov.br/sei/modulos/pesquisa/md_pesq_processo_exibir.php?...
https://sei.rj.gov.br/sei/modulos/pesquisa/md_pesq_processo_exibir.php?...`}
          value={batchUrls}
          onChange={(e) => setBatchUrls(e.target.value)}
          className="min-h-[120px] font-mono text-sm border-pastel-peach-200 focus:border-pastel-peach-300 focus:ring-pastel-peach-200"
          disabled={isProcessing}
        />
        
        <Button 
          onClick={processBatch}
          disabled={isProcessing}
          className="w-full h-12 bg-gradient-to-r from-pastel-peach-300 to-pastel-yellow-300 hover:from-pastel-peach-400 hover:to-pastel-yellow-400 text-white border-0 shadow-lg"
        >
          {isProcessing ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <Package className="h-5 w-5 mr-2" />
          )}
          {isProcessing ? 'Processando...' : 'Processar Lote'}
        </Button>

        {status.type && (
          <Alert className={`${
            status.type === 'success' ? 'border-pastel-green-200 bg-pastel-green-50' :
            status.type === 'error' ? 'border-red-200 bg-red-50' :
            'border-pastel-blue-200 bg-pastel-blue-50'
          }`}>
            {status.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-pastel-green-500" />
            ) : status.type === 'error' ? (
              <AlertCircle className="h-4 w-4 text-red-500" />
            ) : (
              <Loader2 className="h-4 w-4 text-pastel-blue-500 animate-spin" />
            )}
            <AlertDescription className={`${
              status.type === 'success' ? 'text-pastel-green-700' :
              status.type === 'error' ? 'text-red-700' :
              'text-pastel-blue-700'
            }`}>
              {status.message}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
