import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FileText, Calendar, Users, CheckCircle, RefreshCw, Eye, Download } from 'lucide-react'

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

interface ProcessPreviewProps {
  data: ProcessData
  onSave: () => void
  onClear: () => void
}

export function ProcessPreview({ data, onSave, onClear }: ProcessPreviewProps) {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <Separator className="bg-pastel-purple-200" />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Dados Capturados do Processo</h2>
        <Badge variant="secondary" className="text-sm font-mono px-4 py-2 bg-pastel-purple-100 text-pastel-purple-700 border-pastel-purple-200">
          {data.numero}
        </Badge>
      </div>

      {/* Process Basic Info */}
      <Card className="border-pastel-pink-200 bg-pastel-pink-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-pastel-pink-400" />
            Informações da Autuação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Processo
              </label>
              <p className="text-base font-semibold text-gray-800">{data.numero}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Tipo
              </label>
              <p className="text-base text-gray-800">{data.tipo}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Data de Geração
              </label>
              <p className="text-base text-gray-800 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-pastel-purple-400" />
                {data.dataGeracao}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Interessados
              </label>
              <p className="text-base text-gray-800 flex items-center gap-2">
                <Users className="h-4 w-4 text-pastel-blue-400" />
                {data.interessados}
              </p>
            </div>

            {/* Novos campos */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Assunto
              </label>
              <textarea
                className="w-full min-h-[80px] p-3 border border-pastel-pink-200 rounded-lg focus:border-pastel-pink-300 focus:ring-2 focus:ring-pastel-pink-200 focus:outline-none resize-vertical"
                placeholder="Digite o assunto do processo..."
                defaultValue=""
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Concessionária
              </label>
              <select className="w-full p-3 border border-pastel-pink-200 rounded-lg focus:border-pastel-pink-300 focus:ring-2 focus:ring-pastel-pink-200 focus:outline-none">
                <option value="">Selecione uma concessionária</option>
                <option value="aguas-do-rio">Águas do Rio</option>
                <option value="rio-saneamento">Rio+Saneamento</option>
                <option value="igua-prolagos">Iguá Prolagos</option>
                <option value="aguas-juturnaiba">Águas de Juturnaíba</option>
                <option value="cedae">CEDAE (Companhia Estadual de Águas e Esgotos)</option>
                <option value="naturgy">Naturgy (CEG e CEG Rio)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Títulos
              </label>
              <select className="w-full p-3 border border-pastel-pink-200 rounded-lg focus:border-pastel-pink-300 focus:ring-2 focus:ring-pastel-pink-200 focus:outline-none">
                <option value="">Selecione um título</option>
                <option value="coletor-tempo-seco">COLETOR TEMPO SECO</option>
                <option value="areas-irregulares">ÁREAS IRREGULARES NÃO URBANIZADAS</option>
                <option value="aperfeicoamento-sistema">APERFEIÇOAMENTO DO SISTEMA</option>
                <option value="indicadores-desempenho">INDICADORES DE DESEMPENHO</option>
                <option value="plano-verao">PLANO VERÃO</option>
                <option value="gestao-documental">GESTÃO DOCUMENTAL</option>
                <option value="deliberacao">DELIBERAÇÃO</option>
                <option value="bloco">BLOCO</option>
                <option value="administrativo">ADMINISTRATIVO</option>
                <option value="projeto-executivo">PROJETO EXECUTIVO</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Tipo
              </label>
              <select className="w-full p-3 border border-pastel-pink-200 rounded-lg focus:border-pastel-pink-300 focus:ring-2 focus:ring-pastel-pink-200 focus:outline-none">
                <option value="">Selecione um tipo</option>
                <option value="julgado">JULGADO</option>
                <option value="termo-encerramento">TERMO DE ENCERRAMENTO</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Protocolos */}
      <Card className="border-pastel-green-200 bg-pastel-green-50/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-pastel-green-400" />
              Lista de Protocolos
            </CardTitle>
            <Badge variant="outline" className="border-pastel-green-300 text-pastel-green-700">
              {data.protocolos.length} registros
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-pastel-green-200">
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Processo/Documento
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Tipo
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Data
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Data de Inclusão
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Unidade
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.protocolos.map((protocolo, index) => (
                  <tr key={index} className="border-b border-pastel-green-100 hover:bg-pastel-green-50">
                    <td className="py-3 px-2 text-sm font-mono text-gray-800">
                      {protocolo.numero}
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-800">
                      {protocolo.tipo}
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-800">
                      {protocolo.data}
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-800">
                      {protocolo.dataInclusao}
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-800">
                      {protocolo.unidade}
                    </td>
                  </tr>
                ))}
                {data.protocolos.length > 3 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-sm text-gray-500 italic">
                      ... mais {Math.max(0, 142 - data.protocolos.length)} registros disponíveis ...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Andamentos */}
      <Card className="border-pastel-lavender-200 bg-pastel-lavender-50/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-pastel-lavender-400" />
              Lista de Andamentos
            </CardTitle>
            <Badge variant="outline" className="border-pastel-lavender-300 text-pastel-lavender-700">
              {data.andamentos.length} registros
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-pastel-lavender-200">
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Data/Hora
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Unidade
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Descrição
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.andamentos.map((andamento, index) => (
                  <tr key={index} className="border-b border-pastel-lavender-100 hover:bg-pastel-lavender-50">
                    <td className="py-3 px-2 text-sm font-mono text-gray-800">
                      {andamento.dataHora}
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-800">
                      {andamento.unidade}
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-800">
                      {andamento.descricao}
                    </td>
                  </tr>
                ))}
                {data.andamentos.length > 3 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-sm text-gray-500 italic">
                      ... mais {Math.max(0, 218 - data.andamentos.length)} registros disponíveis ...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6 border-t border-pastel-purple-200">
        <Button 
          onClick={onSave}
          className="flex-1 h-12 bg-gradient-to-r from-pastel-green-300 to-pastel-green-400 hover:from-pastel-green-400 hover:to-pastel-green-500 text-white border-0 shadow-lg"
        >
          <CheckCircle className="h-5 w-5 mr-2" />
          Confirmar e Salvar Processo
        </Button>
        <Button 
          onClick={onClear}
          variant="outline"
          className="h-12 px-8 border-pastel-purple-300 text-pastel-purple-700 hover:bg-pastel-purple-50"
        >
          <RefreshCw className="h-5 w-5 mr-2" />
          Limpar
        </Button>
        <Button 
          variant="outline"
          className="h-12 px-8 border-pastel-blue-300 text-pastel-blue-700 hover:bg-pastel-blue-50"
        >
          <Eye className="h-5 w-5 mr-2" />
          Visualizar
        </Button>
        <Button 
          variant="outline"
          className="h-12 px-8 border-pastel-peach-300 text-pastel-peach-700 hover:bg-pastel-peach-50"
        >
          <Download className="h-5 w-5 mr-2" />
          Exportar
        </Button>
      </div>
    </div>
  )
}
