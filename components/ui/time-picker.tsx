"use client"

import * as React from "react"
import { Clock, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface TimePickerProps {
  value?: string // Format: "HH:mm"
  onSelect?: (time: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  stepMinutes?: number
}

export function TimePicker({
  value,
  onSelect,
  placeholder = "HH:mm",
  className,
  disabled = false,
  stepMinutes = 15,
}: TimePickerProps) {
  const [inputValue, setInputValue] = React.useState(value || '')
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    setInputValue(value || '')
  }, [value])

  const minutesToTime = (totalMinutes: number): string => {
    const minutesInDay = 24 * 60
    const normalized = ((totalMinutes % minutesInDay) + minutesInDay) % minutesInDay
    const hours = Math.floor(normalized / 60)
    const minutes = normalized % 60
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }

  const parseTimeToMinutes = (time: string): number | null => {
    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time)
    if (!match) return null
    const hours = parseInt(match[1], 10)
    const minutes = parseInt(match[2], 10)
    return hours * 60 + minutes
  }

  const times = React.useMemo(() => {
    const clampedStep = Math.max(1, Math.min(60, stepMinutes))
    const result: string[] = []
    for (let total = 0; total < 24 * 60; total += clampedStep) {
      result.push(minutesToTime(total))
    }
    return result
  }, [stepMinutes])

  // Common times as presets - customized for user's typical travel times
  const presetTimes = ['07:40', '09:00', '12:00', '14:00', '17:09', '18:09']

  const formatTimeInput = (input: string): string => {
    // Remove tudo que não é dígito
    const digits = input.replace(/\D/g, '')

    if (digits.length === 0) return ''
    if (digits.length === 1) return digits
    if (digits.length === 2) return digits
    if (digits.length === 3) return `${digits.slice(0, 1)}:${digits.slice(1, 3)}`

    // 4 ou mais dígitos
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`
  }

  const validateAndFormat = (input: string): string => {
    const digits = input.replace(/\D/g, '')

    // 1-2 dígitos: interpretar como horas (HH:00)
    if (digits.length === 1 || digits.length === 2) {
      const hours = digits.padStart(2, '0')
      const h = parseInt(hours, 10)
      if (!Number.isNaN(h) && h <= 23) {
        return `${hours}:00`
      }
      return input
    }

    if (digits.length >= 3) {
      let hours = ''
      let mins = ''

      if (digits.length === 3) {
        hours = digits.slice(0, 1).padStart(2, '0')
        mins = digits.slice(1, 3)
      } else {
        hours = digits.slice(0, 2)
        mins = digits.slice(2, 4)
      }

      const h = parseInt(hours, 10)
      const m = parseInt(mins, 10)

      if (h <= 23 && m <= 59) {
        return `${hours.padStart(2, '0')}:${mins.padStart(2, '0')}`
      }
    }

    return input
  }

  const adjustTime = (deltaMinutes: number) => {
    const base = validateAndFormat(inputValue)
    const current = parseTimeToMinutes(base)
    const next = minutesToTime((current ?? 0) + deltaMinutes)
    setInputValue(next)
    onSelect?.(next)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    const formatted = formatTimeInput(input)

    // Limitar a 5 caracteres (XX:XX)
    if (formatted.length <= 5) {
      setInputValue(formatted)

      // Se está completo e válido, chama onSelect
      if (formatted.length === 5 && formatted.includes(':')) {
        const validated = validateAndFormat(formatted)
        if (validated.length === 5) {
          onSelect?.(validated)
        }
      }
    }
  }

  const handleBlur = () => {
    const validated = validateAndFormat(inputValue)
    if (validated !== inputValue) {
      setInputValue(validated)
      onSelect?.(validated)
    }
  }

  const commitTime = (time: string) => {
    const validated = validateAndFormat(time)
    setInputValue(validated)
    if (/^([01]\d|2[0-3]):([0-5]\d)$/.test(validated)) {
      onSelect?.(validated)
      setOpen(false)
    }
  }

  const handleClear = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation()
    setInputValue('')
    onSelect?.('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return

    // Prevent form submission when Enter is pressed
    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
      const validated = validateAndFormat(inputValue)
      if (/^([01]\d|2[0-3]):([0-5]\d)$/.test(validated)) {
        commitTime(inputValue)
      }
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      adjustTime(stepMinutes)
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      adjustTime(-stepMinutes)
      return
    }

    if (e.key === 'Escape') {
      setOpen(false)
      return
    }
  }

  const getAriaLabel = () => {
    if (inputValue) {
      return `Hora selecionada: ${inputValue}. Pressione Enter para alterar, setas para ajustar, ou Delete para limpar.`
    }
    return `${placeholder}. Pressione Enter para selecionar uma hora.`
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal transition-all hover:bg-accent hover:border-primary/50",
            !inputValue && "text-muted-foreground",
            inputValue && "pr-8 relative",
            className
          )}
          aria-label={getAriaLabel()}
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <Clock className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="flex-1">
            {inputValue ? (
              <span className="font-medium">{inputValue}</span>
            ) : (
              placeholder
            )}
          </span>
          {inputValue && !disabled && (
            <span
              className="absolute right-2 hover:bg-destructive/10 rounded-sm p-0.5 transition-colors"
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleClear(e)
                }
              }}
              role="button"
              aria-label="Limpar hora"
              tabIndex={0}
            >
              <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(20rem,calc(100vw-2rem))] p-0" align="start">
        <div className="p-3 border-b bg-muted/50">
          <p className="text-sm font-medium text-center mb-2">
            {inputValue || "Selecione uma hora"}
          </p>
          <Input
            type="text"
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={5}
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            className="text-center text-lg font-medium"
            aria-label="Digite a hora no formato HH:mm"
          />
          <p className="text-xs text-muted-foreground text-center mt-2">
            Digite ou use ↑/↓ para ajustar
          </p>
        </div>
        
        {/* Preset times */}
        <div className="p-3 border-b bg-muted/30">
          <p className="text-xs font-medium mb-2 text-muted-foreground">Horários comuns:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {presetTimes.map((time) => (
              <Button
                key={time}
                type="button"
                variant={inputValue === time ? "default" : "outline"}
                size="sm"
                className="text-xs h-8"
                onClick={() => commitTime(time)}
              >
                {time}
              </Button>
            ))}
          </div>
        </div>

        {/* All times list */}
        <ScrollArea className="h-48">
          <div className="p-2">
            <p className="text-xs font-medium mb-2 px-2 text-muted-foreground">Todos os horários:</p>
            {times.map((time) => {
              const selected = time === inputValue
              return (
                <Button
                  key={time}
                  type="button"
                  variant={selected ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start text-sm h-9",
                    selected && "font-semibold bg-primary/10"
                  )}
                  onClick={() => commitTime(time)}
                >
                  <Clock className="mr-2 h-3.5 w-3.5" />
                  {time}
                </Button>
              )
            })}
          </div>
        </ScrollArea>
        
        <div className="p-3 border-t bg-muted/50 text-xs text-muted-foreground text-center">
          Use ↑/↓ para incrementos de {stepMinutes} min • Enter confirma • Esc fecha
        </div>
      </PopoverContent>
    </Popover>
  )
}