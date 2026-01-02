"use client"

import * as React from "react"
import { Clock } from "lucide-react"

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return

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

    if (e.key === 'Enter') {
      e.preventDefault()
      commitTime(inputValue)
      return
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !inputValue && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
          {inputValue ? inputValue : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <div className="space-y-2">
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
          />
          <ScrollArea className="h-56 rounded-md border">
            <div className="p-1">
              {times.map((time) => {
                const selected = time === inputValue
                return (
                  <Button
                    key={time}
                    type="button"
                    variant={selected ? "secondary" : "ghost"}
                    className={cn("w-full justify-start", selected && "font-semibold")}
                    onClick={() => commitTime(time)}
                  >
                    {time}
                  </Button>
                )
              })}
            </div>
          </ScrollArea>
          <p className="text-xs text-muted-foreground">
            ↑/↓ ajusta {stepMinutes} min, Enter confirma
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}