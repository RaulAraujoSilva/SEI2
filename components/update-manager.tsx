"use client"

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar, Clock, Loader2, RefreshCw, Save, Timer, CheckCircle, XCircle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Mode = 'manual' | 'scheduled'
type ScheduleType = 'daily' | 'interval'

type ScheduleState = {
  mode: Mode
  type: ScheduleType
  dailyTime: string // HH:mm
  intervalHours: number
  nextRun?: string
}

type UpdateStats = {
  totalProcesses: number
  successCount: number
  failureCount: number
  novosProtocolos: number
  novosAndamentos: number
}

const STORAGE_KEY = 'sei:update-schedule:v1'

export function UpdateManager() {
  const [schedule, setSchedule] = useState<ScheduleState>({
    mode: 'manual',
    type: 'daily',
    dailyTime: '09:00',
    intervalHours: 24,
    nextRun: undefined,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateStats, setUpdateStats] = useState<UpdateStats | null>(null)
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info' | null; message: string }>({ type: null, message: '' })

  // Load schedule from backend on mount
  useEffect(() => {
    loadScheduleFromBackend()
  }, [])

  const loadScheduleFromBackend = async () => {
    try {
      // First try to get from backend
      const response = await fetch('/api/schedule/status')
      if (response.ok) {
        const data = await response.json()
        if (data.active) {
          setSchedule({
            mode: data.mode,
            type: data.type || 'daily',
            dailyTime: data.dailyTime || '09:00',
            intervalHours: data.intervalHours || 24,
            nextRun: data.nextRun
          })
          return
        }
      }
    } catch {}
    
    // Fallback to localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as ScheduleState
        setSchedule(parsed)
      }
    } catch {}
  }

  const computeNextRun = (s: ScheduleState): string | undefined => {
    const now = new Date()
    if (s.mode === 'manual') return undefined
    if (s.type === 'daily') {
      const [hh, mm] = s.dailyTime.split(':').map((v) => parseInt(v, 10))
      const next = new Date(now)
      next.setHours(hh || 9, mm || 0, 0, 0)
      if (next <= now) next.setDate(next.getDate() + 1)
      return next.toLocaleString('pt-BR')
    } else {
      const next = new Date(now.getTime() + s.intervalHours * 60 * 60 * 1000)
      return next.toLocaleString('pt-BR')
    }
  }

  const nextRun = useMemo(() => computeNextRun(schedule), [schedule])

  const saveSchedule = async () => {
    setIsSaving(true)
    setStatus({ type: null, message: '' })
    
    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: schedule.mode,
          type: schedule.mode === 'scheduled' ? schedule.type : undefined,
          dailyTime: schedule.mode === 'scheduled' && schedule.type === 'daily' ? schedule.dailyTime : undefined,
          intervalHours: schedule.mode === 'scheduled' && schedule.type === 'interval' ? schedule.intervalHours : undefined,
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        const next = data.nextRun ? new Date(data.nextRun).toLocaleString('pt-BR') : undefined
        const toSave = { ...schedule, nextRun: next }
        
        // Save to localStorage as backup
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
        setSchedule(toSave)
        setStatus({ type: 'success', message: 'Agendamento salvo com sucesso.' })
      } else {
        throw new Error('Falha ao salvar agendamento')
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Erro ao salvar agendamento. Tente novamente.' })
    } finally {
      setIsSaving(false)
    }
  }

  const updateNow = async () => {
    setIsUpdating(true)
    setStatus({ type: 'info', message: 'Atualizando processos... isso pode levar alguns minutos.' })
    setUpdateStats(null)
    
    try {
      const response = await fetch('/api/processes/update-now', {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Set update statistics
        setUpdateStats({
          totalProcesses: data.processes || 0,
          successCount: data.processes || 0,
          failureCount: 0,
          novosProtocolos: data.novosProtocolos || 0,
          novosAndamentos: data.novosAndamentos || 0
        })
        
        setStatus({ 
          type: 'success', 
          message: `Atualização concluída! ${data.processes} processos atualizados.`
        })
      } else {
        throw new Error('Falha na atualização')
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Erro ao atualizar processos. Tente novamente.' })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card className="border-pastel-green-200 bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-pastel-green-500" />
          Atualização de Processos
        </CardTitle>
        <p className="text-sm text-gray-600">
          Atualize todos os processos sob demanda ou configure um agendamento automático.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Modo */}
          <div className="space-y-2">
            <Label>Modo</Label>
            <Select
              value={schedule.mode}
              onValueChange={(v: Mode) => setSchedule((s) => ({ ...s, mode: v }))}
            >
              <SelectTrigger className="border-pastel-green-200">
                <SelectValue placeholder="Selecione o modo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Sob demanda</SelectItem>
                <SelectItem value="scheduled">Agendado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de agenda */}
          <div className="space-y-2">
            <Label>Tipo de agenda</Label>
            <Select
              value={schedule.type}
              onValueChange={(v: ScheduleType) => setSchedule((s) => ({ ...s, type: v }))}
              disabled={schedule.mode !== 'scheduled'}
            >
              <SelectTrigger className="border-pastel-green-200">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diária (por horário)</SelectItem>
                <SelectItem value="interval">Intervalo (em horas)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Próxima execução */}
          <div className="space-y-2">
            <Label>Próxima execução</Label>
            <div className="h-10 px-3 flex items-center rounded-md border border-pastel-green-200 bg-pastel-green-50 text-sm text-gray-700">
              {schedule.mode === 'scheduled' && (schedule.nextRun || nextRun)
                ? (schedule.nextRun || nextRun)
                : '—'}
            </div>
          </div>
        </div>

        {/* Parâmetros do agendamento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Diária */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              Horário diário
            </Label>
            <Input
              type="time"
              value={schedule.dailyTime}
              onChange={(e) =>
                setSchedule((s) => ({ ...s, dailyTime: e.target.value }))
              }
              disabled={!(schedule.mode === 'scheduled' && schedule.type === 'daily')}
              className="border-pastel-green-200"
            />
          </div>

          {/* Intervalo em horas */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-gray-500" />
              Intervalo (horas)
            </Label>
            <Input
              type="number"
              min={1}
              value={schedule.intervalHours}
              onChange={(e) =>
                setSchedule((s) => ({
                  ...s,
                  intervalHours: Math.max(1, Number(e.target.value || 1)),
                }))
              }
              disabled={!(schedule.mode === 'scheduled' && schedule.type === 'interval')}
              className="border-pastel-green-200"
            />
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={updateNow}
            disabled={isUpdating}
            className="flex-1 bg-gradient-to-r from-pastel-green-300 to-pastel-green-400 hover:from-pastel-green-400 hover:to-pastel-green-500 text-white border-0"
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {isUpdating ? 'Atualizando...' : 'Atualizar agora'}
          </Button>

          <Button
            onClick={saveSchedule}
            variant="outline"
            disabled={isSaving || schedule.mode !== 'scheduled'}
            className="flex-1 border-pastel-green-300 text-pastel-green-700 hover:bg-pastel-green-50"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar agendamento
          </Button>
        </div>

        {/* Statistics Display */}
        {updateStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-pastel-green-50 rounded-lg border border-pastel-green-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-pastel-green-700">{updateStats.totalProcesses}</div>
              <div className="text-xs text-gray-600">Processos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                <CheckCircle className="h-5 w-5" />
                {updateStats.successCount}
              </div>
              <div className="text-xs text-gray-600">Sucesso</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pastel-blue-600">{updateStats.novosProtocolos}</div>
              <div className="text-xs text-gray-600">Novos Protocolos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pastel-purple-600">{updateStats.novosAndamentos}</div>
              <div className="text-xs text-gray-600">Novos Andamentos</div>
            </div>
          </div>
        )}

        {status.type && (
          <Alert
            className={`${
              status.type === 'success'
                ? 'border-pastel-green-200 bg-pastel-green-50'
                : status.type === 'error'
                  ? 'border-red-200 bg-red-50'
                  : 'border-pastel-blue-200 bg-pastel-blue-50'
            }`}
          >
            <AlertDescription
              className={`${
                status.type === 'success'
                  ? 'text-pastel-green-700'
                  : status.type === 'error'
                    ? 'text-red-700'
                    : 'text-pastel-blue-700'
              }`}
            >
              {status.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-gray-500 flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5" />
          Dica: com a atualização agendada, você não precisa lembrar de executar manualmente.
        </div>
      </CardContent>
    </Card>
  )
}
