import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Clock } from 'lucide-react'

const recentProcesses = [
  {
    id: 'SEI-260002/002172/2025',
    date: '05/08/2025 às 14:32',
    status: 'captured' as const
  },
  {
    id: 'SEI-260002/002171/2025',
    date: '05/08/2025 às 14:28',
    status: 'captured' as const
  },
  {
    id: 'SEI-260002/002170/2025',
    date: '05/08/2025 às 14:25',
    status: 'error' as const
  },
  {
    id: 'SEI-260002/002169/2025',
    date: '05/08/2025 às 14:20',
    status: 'captured' as const
  },
  {
    id: 'SEI-260002/002168/2025',
    date: '05/08/2025 às 14:15',
    status: 'pending' as const
  }
]

const statusConfig = {
  captured: {
    label: 'Capturado',
    className: 'bg-pastel-green-50 text-pastel-green-600 border-pastel-green-200'
  },
  pending: {
    label: 'Pendente',
    className: 'bg-pastel-yellow-50 text-pastel-yellow-600 border-pastel-yellow-200'
  },
  error: {
    label: 'Erro',
    className: 'bg-red-50 text-red-600 border-red-200'
  }
}

export function RecentProcesses() {
  return (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm border-pastel-lavender-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-pastel-lavender-400" />
            Processos Recentes
          </CardTitle>
          <Badge variant="secondary" className="bg-pastel-lavender-100 text-pastel-lavender-700 border-pastel-lavender-200">
            Últimos 5
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentProcesses.map((process, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-pastel-lavender-50/50 rounded-lg border border-pastel-lavender-100 hover:bg-white hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-pastel-lavender-400" />
                <div>
                  <p className="font-semibold text-gray-800 font-mono text-sm">
                    {process.id}
                  </p>
                  <p className="text-sm text-gray-600">
                    Capturado em {process.date}
                  </p>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={statusConfig[process.status].className}
              >
                {statusConfig[process.status].label}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
