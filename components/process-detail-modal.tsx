"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, ExternalLink, Calendar, Users, FileText, Edit, CheckCircle } from 'lucide-react'
import { useState } from 'react'

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
  // Novos campos
  assunto?: string
  concessionaria?: string
  titulo?: string
  tipoCustom?: string
}

interface ProcessDetailModalProps {
  process: ProcessData
  onClose: () => void
}

export function ProcessDetailModal({ process, onClose }: ProcessDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    assunto: process.assunto || '',
    concessionaria: process.concessionaria || '',
    titulo: process.titulo || '',
    tipoCustom: process.tipoCustom || ''
  })

  const mockProtocolos = [
    { numero: '95725517', tipo: 'Correspondência Interna - NA 11', data: '19/03/2025', dataInclusao: '19/03/2025', unidade: 'UENF/DIRCCH', isNew: true },
    { numero: '95786972', tipo: 'Anexo 1', data: '24/07/2024', dataInclusao: '18/03/2025', unidade: 'UENF/DIRCCH', isNew: true },
    { numero: '95787469', tipo: 'Anexo 2', data: '15/08/2024', dataInclusao: '18/03/2025', unidade: 'UENF/DIRCCH', isNew: true },
    { numero: '95787037', tipo: 'Anexo 3', data: '15/08/2024', dataInclusao: '18/03/2025', unidade: 'UENF/DIRCCH', isNew: false },
    { numero: '95787080', tipo: 'Anexo 4', data: '30/08/2024', dataInclusao: '18/03/2025', unidade: 'UENF/DIRCCH', isNew: false }
  ]

  const mockAndamentos = [
    { dataHora: '02/07/2025 12:45', unidade: 'UENF/DGA', descricao: 'Conclusão do processo na unidade', isNew: true },
    { dataHora: '18/06/2025 18:09', unidade: 'UENF/LEEL', descricao: 'Processo recebido na unidade', isNew: true },
    { dataHora: '18/06/2025 16:05', unidade: 'UENF/LEEL', descricao: 'Processo remetido pela unidade UENF/AGEINOV', isNew: true },
    { dataHora: '03/06/2025 08:44', unidade: 'UENF/GERCOMP', descricao: 'Processo recebido na unidade', isNew: true },
    { dataHora: '02/06/2025 20:03', unidade: 'UENF/GERCOMP', descricao: 'Processo remetido pela unidade UENF/ASSCONT', isNew: true },
    { dataHora: '20/05/2025 16:43', unidade: 'UENF/GERCOMP', descricao: 'Processo recebido na unidade', isNew: false },
    { dataHora: '20/05/2025 15:54', unidade: 'UENF/GERCOMP', descricao: 'Processo remetido pela unidade UENF/SETCONT', isNew: false }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-pastel-purple-200 bg-gradient-to-r from-pastel-pink-50 to-pastel-purple-50">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-pastel-purple-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">Detalhes do Processo</h2>
              <p className="text-sm text-gray-600 font-mono">{process.numero}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`https://sei.rj.gov.br/sei/modulos/pesquisa/md_pesq_processo_exibir.php?${process.numero}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-pastel-blue-100 text-pastel-blue-600 hover:bg-pastel-blue-200 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-pastel-purple-300 text-pastel-purple-700 hover:bg-pastel-purple-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-6">
          {/* Basic Info */}
          <Card className="border-pastel-pink-200 bg-pastel-pink-50/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-pastel-pink-400" />
                  Informações da Autuação
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className={isEditing 
                    ? "border-pastel-green-300 text-pastel-green-700 hover:bg-pastel-green-50" 
                    : "border-pastel-pink-300 text-pastel-pink-700 hover:bg-pastel-pink-50"
                  }
                >
                  {isEditing ? <CheckCircle className="h-4 w-4 mr-1" /> : <Edit className="h-4 w-4 mr-1" />}
                  {isEditing ? 'Salvar' : 'Editar'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Processo</label>
                  <p className="text-base font-semibold text-gray-800 font-mono">{process.numero}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Tipo</label>
                  <p className="text-base text-gray-800">{process.tipo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Data de Geração</label>
                  <p className="text-base text-gray-800 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-pastel-purple-400" />
                    {process.dataGeracao}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Interessados</label>
                  <p className="text-base text-gray-800 flex items-center gap-2">
                    <Users className="h-4 w-4 text-pastel-blue-400" />
                    {process.interessado}
                  </p>
                </div>

                {/* Novos campos editáveis */}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Assunto</label>
                  {isEditing ? (
                    <textarea
                      value={editData.assunto}
                      onChange={(e) => setEditData({...editData, assunto: e.target.value})}
                      className="w-full min-h-[80px] p-3 border border-pastel-pink-200 rounded-lg focus:border-pastel-pink-300 focus:ring-2 focus:ring-pastel-pink-200 focus:outline-none resize-vertical mt-1"
                      placeholder="Digite o assunto do processo..."
                    />
                  ) : (
                    <p className="text-base text-gray-800 mt-1 min-h-[80px] p-3 bg-gray-50 rounded-lg border">
                      {editData.assunto || 'Não informado'}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Concessionária</label>
                  {isEditing ? (
                    <select 
                      value={editData.concessionaria}
                      onChange={(e) => setEditData({...editData, concessionaria: e.target.value})}
                      className="w-full p-3 border border-pastel-pink-200 rounded-lg focus:border-pastel-pink-300 focus:ring-2 focus:ring-pastel-pink-200 focus:outline-none mt-1"
                    >
                      <option value="">Selecione uma concessionária</option>
                      <option value="aguas-do-rio">Águas do Rio</option>
                      <option value="rio-saneamento">Rio+Saneamento</option>
                      <option value="igua-prolagos">Iguá Prolagos</option>
                      <option value="aguas-juturnaiba">Águas de Juturnaíba</option>
                      <option value="cedae">CEDAE (Companhia Estadual de Águas e Esgotos)</option>
                      <option value="naturgy">Naturgy (CEG e CEG Rio)</option>
                    </select>
                  ) : (
                    <p className="text-base text-gray-800 mt-1 p-3 bg-gray-50 rounded-lg border">
                      {editData.concessionaria ? 
                        editData.concessionaria.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                        'Não informado'
                      }
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Títulos</label>
                  {isEditing ? (
                    <select 
                      value={editData.titulo}
                      onChange={(e) => setEditData({...editData, titulo: e.target.value})}
                      className="w-full p-3 border border-pastel-pink-200 rounded-lg focus:border-pastel-pink-300 focus:ring-2 focus:ring-pastel-pink-200 focus:outline-none mt-1"
                    >
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
                  ) : (
                    <p className="text-base text-gray-800 mt-1 p-3 bg-gray-50 rounded-lg border">
                      {editData.titulo ? 
                        editData.titulo.replace(/-/g, ' ').toUpperCase() : 
                        'Não informado'
                      }
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Tipo</label>
                  {isEditing ? (
                    <select 
                      value={editData.tipoCustom}
                      onChange={(e) => setEditData({...editData, tipoCustom: e.target.value})}
                      className="w-full p-3 border border-pastel-pink-200 rounded-lg focus:border-pastel-pink-300 focus:ring-2 focus:ring-pastel-pink-200 focus:outline-none mt-1"
                    >
                      <option value="">Selecione um tipo</option>
                      <option value="julgado">JULGADO</option>
                      <option value="termo-encerramento">TERMO DE ENCERRAMENTO</option>
                    </select>
                  ) : (
                    <p className="text-base text-gray-800 mt-1 p-3 bg-gray-50 rounded-lg border">
                      {editData.tipoCustom ? 
                        editData.tipoCustom.replace(/-/g, ' ').toUpperCase() : 
                        'Não informado'
                      }
                    </p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="mt-6 pt-4 border-t border-pastel-pink-200 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false)
                      // Reset para valores originais se necessário
                    }}
                    className="border-pastel-pink-300 text-pastel-pink-700 hover:bg-pastel-pink-50"
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      // Aqui você salvaria os dados
                      console.log('Salvando dados:', editData)
                      setIsEditing(false)
                      // Mostrar mensagem de sucesso
                    }}
                    className="bg-gradient-to-r from-pastel-green-300 to-pastel-green-400 hover:from-pastel-green-400 hover:to-pastel-green-500 text-white border-0"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Salvar Alterações
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Protocolos */}
          <Card className="border-pastel-blue-200 bg-pastel-blue-50/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-pastel-blue-400" />
                  Lista de Protocolos
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className="bg-pastel-blue-100 text-pastel-blue-700 border-pastel-blue-200">
                    {process.protocolos.novos} novos
                  </Badge>
                  <Badge variant="outline" className="border-pastel-blue-300 text-pastel-blue-700">
                    {process.protocolos.total} total
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-pastel-blue-200">
                      <th className="text-left py-2 px-2 font-medium text-gray-600">Processo/Documento</th>
                      <th className="text-left py-2 px-2 font-medium text-gray-600">Tipo</th>
                      <th className="text-left py-2 px-2 font-medium text-gray-600">Data</th>
                      <th className="text-left py-2 px-2 font-medium text-gray-600">Data de Inclusão</th>
                      <th className="text-left py-2 px-2 font-medium text-gray-600">Unidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockProtocolos.map((protocolo, index) => (
                      <tr 
                        key={index} 
                        className={`border-b border-pastel-blue-100 ${
                          protocolo.isNew ? 'bg-pastel-yellow-50' : 'hover:bg-pastel-blue-25'
                        }`}
                      >
                        <td className="py-2 px-2 font-mono">{protocolo.numero}</td>
                        <td className="py-2 px-2">{protocolo.tipo}</td>
                        <td className="py-2 px-2">{protocolo.data}</td>
                        <td className="py-2 px-2">{protocolo.dataInclusao}</td>
                        <td className="py-2 px-2">{protocolo.unidade}</td>
                      </tr>
                    ))}
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
                <div className="flex items-center gap-2">
                  <Badge className="bg-pastel-pink-100 text-pastel-pink-700 border-pastel-pink-200">
                    {process.andamentos.novos} novos
                  </Badge>
                  <Badge variant="outline" className="border-pastel-lavender-300 text-pastel-lavender-700">
                    {process.andamentos.total} total
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-pastel-lavender-200">
                      <th className="text-left py-2 px-2 font-medium text-gray-600">Data/Hora</th>
                      <th className="text-left py-2 px-2 font-medium text-gray-600">Unidade</th>
                      <th className="text-left py-2 px-2 font-medium text-gray-600">Descrição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockAndamentos.map((andamento, index) => (
                      <tr 
                        key={index} 
                        className={`border-b border-pastel-lavender-100 ${
                          andamento.isNew ? 'bg-pastel-yellow-50' : 'hover:bg-pastel-lavender-25'
                        }`}
                      >
                        <td className="py-2 px-2 font-mono">{andamento.dataHora}</td>
                        <td className="py-2 px-2">{andamento.unidade}</td>
                        <td className="py-2 px-2">{andamento.descricao}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          <Card className="border-pastel-yellow-200 bg-pastel-yellow-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-pastel-yellow-400" />
                Observações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Adicionar observação sobre este processo:
                  </label>
                  <textarea
                    className="w-full min-h-[100px] p-3 border border-pastel-yellow-200 rounded-lg focus:border-pastel-yellow-300 focus:ring-2 focus:ring-pastel-yellow-200 focus:outline-none resize-vertical"
                    placeholder="Digite suas observações sobre este processo..."
                    defaultValue=""
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-pastel-yellow-300 text-pastel-yellow-700 hover:bg-pastel-yellow-50"
                  >
                    Limpar
                  </Button>
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-pastel-yellow-300 to-pastel-peach-300 hover:from-pastel-yellow-400 hover:to-pastel-peach-400 text-white border-0"
                  >
                    Salvar Observação
                  </Button>
                </div>
                
                {/* Observações existentes */}
                <div className="border-t border-pastel-yellow-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Observações anteriores:</h4>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-lg border border-pastel-yellow-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">João Silva</span>
                        <span className="text-xs text-gray-500">05/08/2025 14:30</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        Processo requer atenção especial devido ao prazo apertado. Coordenar com a equipe de compras.
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-pastel-yellow-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">Maria Santos</span>
                        <span className="text-xs text-gray-500">03/08/2025 09:15</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        Documentação complementar foi solicitada ao interessado.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
