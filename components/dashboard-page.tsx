"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, TrendingUp, ExternalLink, Download, RefreshCw, Plus, Search, BarChart3, Settings } from 'lucide-react'
import Link from 'next/link'

export function DashboardPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-pastel-purple-400 to-pastel-pink-400 text-white">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard SEI</h1>
              <p className="text-pastel-purple-100">
                Última atualização: 06 de agosto de 2025 às 14:32
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Relatório
              </Button>
              <Button 
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-12 relative z-10">
          <Card className="border-pastel-blue-200 bg-white/95 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Total de Processos
                  </p>
                  <p className="text-3xl font-bold text-pastel-blue-600 mt-2">247</p>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-pastel-green-500 mr-1" />
                    <span className="text-pastel-green-600 font-medium">12 novos esta semana</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-pastel-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-pastel-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-pastel-green-200 bg-white/95 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Processos Atualizados
                  </p>
                  <p className="text-3xl font-bold text-pastel-green-600 mt-2">42</p>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-pastel-green-500 mr-1" />
                    <span className="text-pastel-green-600 font-medium">28% nos últimos 7 dias</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-pastel-green-100 rounded-lg flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 text-pastel-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-pastel-peach-200 bg-white/95 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Novos Protocolos
                  </p>
                  <p className="text-3xl font-bold text-pastel-peach-600 mt-2">89</p>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-pastel-green-500 mr-1" />
                    <span className="text-pastel-green-600 font-medium">15 hoje</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-pastel-peach-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-pastel-peach-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-pastel-lavender-200 bg-white/95 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Novos Andamentos
                  </p>
                  <p className="text-3xl font-bold text-pastel-lavender-600 mt-2">156</p>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-pastel-green-500 mr-1" />
                    <span className="text-pastel-green-600 font-medium">32 hoje</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-pastel-lavender-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-pastel-lavender-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-1 border-pastel-purple-200 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-gray-800">Atividade Recente</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Últimas 24 horas</p>
                </div>
                <Link 
                  href="/processos" 
                  className="text-sm text-pastel-purple-600 hover:text-pastel-purple-700 font-medium"
                >
                  Ver tudo →
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {[
                  { type: 'new', title: 'Novo protocolo adicionado', desc: 'SEI-260002/002172/2025 - Correspondência Interna', time: 'Há 2 horas' },
                  { type: 'update', title: 'Processo atualizado', desc: 'SEI-260002/002175/2025 - 12 novos andamentos', time: 'Há 3 horas' },
                  { type: 'new', title: 'Novo processo criado', desc: 'SEI-260002/002180/2025 - Solicitação de Material', time: 'Há 5 horas' },
                  { type: 'update', title: 'Múltiplas atualizações', desc: '8 processos receberam novos protocolos', time: 'Há 6 horas' },
                  { type: 'update', title: 'Processo concluído', desc: 'SEI-260002/002165/2025 - Relatório de Atividades', time: 'Há 8 horas' }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      item.type === 'new' 
                        ? 'bg-pastel-green-100 text-pastel-green-700' 
                        : 'bg-pastel-blue-100 text-pastel-blue-700'
                    }`}>
                      {item.type === 'new' ? '+' : '↻'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{item.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Process Updates Table */}
          <Card className="lg:col-span-2 border-pastel-blue-200 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-gray-800">Processos com Mais Atualizações</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Últimos 7 dias</p>
                </div>
                <Link 
                  href="/processos" 
                  className="text-sm text-pastel-blue-600 hover:text-pastel-blue-700 font-medium"
                >
                  Ver todos →
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-pastel-blue-200">
                      <th className="text-left py-2 font-medium text-gray-600">Processo</th>
                      <th className="text-left py-2 font-medium text-gray-600">Tipo</th>
                      <th className="text-left py-2 font-medium text-gray-600">Última Unidade</th>
                      <th className="text-left py-2 font-medium text-gray-600">Data Andamento</th>
                      <th className="text-left py-2 font-medium text-gray-600">Atualizações</th>
                      <th className="text-left py-2 font-medium text-gray-600">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { numero: 'SEI-260002/002175/2025', tipo: 'Solicitação de Compras', ultimaUnidade: 'UENF/GERCOMP', dataUltimoAndamento: '04/07/2025', protocolos: 8, andamentos: 12, tempo: 'Há 2 horas' },
                      { numero: 'SEI-260002/002168/2025', tipo: 'Convênio Institucional', ultimaUnidade: 'UENF/DGA', dataUltimoAndamento: '03/07/2025', protocolos: 4, andamentos: 7, tempo: 'Há 5 horas' },
                      { numero: 'SEI-260002/002172/2025', tipo: 'Correspondência Interna', ultimaUnidade: 'UENF/LEEL', dataUltimoAndamento: '02/07/2025', protocolos: 3, andamentos: 5, tempo: 'Há 8 horas' },
                      { numero: 'SEI-260002/002160/2025', tipo: 'Bolsa de Pesquisa', ultimaUnidade: 'UENF/SETCONT', dataUltimoAndamento: '01/07/2025', protocolos: 2, andamentos: 4, tempo: 'Ontem' }
                    ].map((process, index) => (
                      <tr key={index} className="border-b border-pastel-blue-100 hover:bg-pastel-blue-25">
                        <td className="py-3">
                          <Link 
                            href="/processos" 
                            className="font-mono text-pastel-blue-700 hover:text-pastel-blue-800 hover:underline"
                          >
                            {process.numero}
                          </Link>
                        </td>
                        <td className="py-3 text-gray-700 max-w-xs truncate">{process.tipo}</td>
                        <td className="py-3 text-gray-700">{process.ultimaUnidade}</td>
                        <td className="py-3 text-gray-600">{process.dataUltimoAndamento}</td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <Badge className="bg-pastel-blue-100 text-pastel-blue-700 border-pastel-blue-200">
                              +{process.protocolos} prot
                            </Badge>
                            <Badge className="bg-pastel-pink-100 text-pastel-pink-700 border-pastel-pink-200">
                              +{process.andamentos} and
                            </Badge>
                          </div>
                        </td>
                        <td className="py-3">
                          <a
                            href={`https://sei.rj.gov.br/sei/modulos/pesquisa/md_pesq_processo_exibir.php?${process.numero}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pastel-purple-600 hover:text-pastel-purple-700"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Chart */}
          <Card className="border-pastel-green-200 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-800">Atividade por Dia</CardTitle>
              <p className="text-sm text-gray-600">Últimos 30 dias</p>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-end gap-1">
                {Array.from({ length: 21 }, (_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-pastel-green-300 rounded-t opacity-70 hover:opacity-100 transition-opacity"
                    style={{ height: `${Math.random() * 80 + 20}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>30 dias atrás</span>
                <span>Hoje</span>
              </div>
            </CardContent>
          </Card>

          {/* Distribution Chart */}
          <Card className="border-pastel-lavender-200 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-800">Distribuição por Unidade</CardTitle>
              <p className="text-sm text-gray-600">Processos ativos</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'UENF/DGA', value: 42, width: '85%', color: 'pastel-purple' },
                  { label: 'UENF/LEEL', value: 35, width: '70%', color: 'pastel-green' },
                  { label: 'UENF/GERCOMP', value: 28, width: '60%', color: 'pastel-peach' },
                  { label: 'UENF/SETCONT', value: 22, width: '45%', color: 'pastel-pink' },
                  { label: 'Outros', value: 15, width: '30%', color: 'pastel-lavender' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-32 text-sm text-gray-600">{item.label}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r from-${item.color}-300 to-${item.color}-400 rounded-full flex items-center justify-end pr-2 transition-all duration-1000`}
                        style={{ width: item.width }}
                      >
                        <span className="text-xs font-medium text-white">{item.value}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Priority Processes and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Priority Processes */}
          <Card className="lg:col-span-1 border-pastel-peach-200 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-800">Processos Prioritários</CardTitle>
              <p className="text-sm text-gray-600">Requerem atenção</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { numero: 'SEI-260002/002175/2025', priority: 'URGENTE', desc: 'Solicitação de Compras - 20 atualizações pendentes', color: 'red' },
                  { numero: 'SEI-260002/002168/2025', priority: 'MÉDIO', desc: 'Convênio Institucional - Aguardando assinatura', color: 'yellow' },
                  { numero: 'SEI-260002/002172/2025', priority: 'BAIXO', desc: 'Correspondência Interna - Em análise', color: 'green' }
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md ${
                      item.color === 'red' ? 'border-l-red-400 bg-red-50 hover:bg-red-100' :
                      item.color === 'yellow' ? 'border-l-yellow-400 bg-yellow-50 hover:bg-yellow-100' :
                      'border-l-green-400 bg-green-50 hover:bg-green-100'
                    }`}
                    onClick={() => window.open(`https://sei.rj.gov.br/sei/modulos/pesquisa/md_pesq_processo_exibir.php?${item.numero}`, '_blank')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-semibold text-gray-800">{item.numero}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          item.color === 'red' ? 'border-red-300 text-red-700' :
                          item.color === 'yellow' ? 'border-yellow-300 text-yellow-700' :
                          'border-green-300 text-green-700'
                        }`}
                      >
                        {item.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="lg:col-span-2 border-pastel-blue-200 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-800">Ações Rápidas</CardTitle>
              <p className="text-sm text-gray-600">Acesso rápido às funcionalidades</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link
                  href="/"
                  className="p-4 text-center rounded-lg border-2 border-pastel-green-200 hover:border-pastel-green-300 hover:bg-pastel-green-50 transition-all hover:shadow-md group"
                >
                  <div className="w-12 h-12 mx-auto mb-3 bg-pastel-green-100 rounded-lg flex items-center justify-center group-hover:bg-pastel-green-200">
                    <Plus className="h-6 w-6 text-pastel-green-600" />
                  </div>
                  <h3 className="font-medium text-gray-800 mb-1">Novo Processo</h3>
                  <p className="text-xs text-gray-600">Cadastrar processo SEI</p>
                </Link>

                <Link
                  href="/processos"
                  className="p-4 text-center rounded-lg border-2 border-pastel-blue-200 hover:border-pastel-blue-300 hover:bg-pastel-blue-50 transition-all hover:shadow-md group"
                >
                  <div className="w-12 h-12 mx-auto mb-3 bg-pastel-blue-100 rounded-lg flex items-center justify-center group-hover:bg-pastel-blue-200">
                    <Search className="h-6 w-6 text-pastel-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-800 mb-1">Pesquisar</h3>
                  <p className="text-xs text-gray-600">Buscar processos</p>
                </Link>

                <div className="p-4 text-center rounded-lg border-2 border-pastel-peach-200 hover:border-pastel-peach-300 hover:bg-pastel-peach-50 transition-all hover:shadow-md group cursor-pointer">
                  <div className="w-12 h-12 mx-auto mb-3 bg-pastel-peach-100 rounded-lg flex items-center justify-center group-hover:bg-pastel-peach-200">
                    <BarChart3 className="h-6 w-6 text-pastel-peach-600" />
                  </div>
                  <h3 className="font-medium text-gray-800 mb-1">Relatórios</h3>
                  <p className="text-xs text-gray-600">Gerar relatórios</p>
                </div>

                <div className="p-4 text-center rounded-lg border-2 border-pastel-lavender-200 hover:border-pastel-lavender-300 hover:bg-pastel-lavender-50 transition-all hover:shadow-md group cursor-pointer">
                  <div className="w-12 h-12 mx-auto mb-3 bg-pastel-lavender-100 rounded-lg flex items-center justify-center group-hover:bg-pastel-lavender-200">
                    <Settings className="h-6 w-6 text-pastel-lavender-600" />
                  </div>
                  <h3 className="font-medium text-gray-800 mb-1">Configurações</h3>
                  <p className="text-xs text-gray-600">Preferências do sistema</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
