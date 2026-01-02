"use client"

import * as React from "react"
import { Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface TimePickerProps {
  value?: string // Format: "HH:mm"
  onSelect?: (time: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function TimePicker({
  value,
  onSelect,
  placeholder = "00:00",
  className,
  disabled = false
}: TimePickerProps) {
  const [inputValue, setInputValue] = React.useState(value || '')

  React.useEffect(() => {
    setInputValue(value || '')
  }, [value])

  const formatTimeInput = (input: string): string => {
    // Remove tudo que não é dígito
    const digits = input.replace(/\D/g, '')

    if (digits.length === 0) return ''
    if (digits.length === 1) return digits
    if (digits.length === 2) return digits
    if (digits.length === 3) return `${digits.slice(0, 1)}${digits.slice(1, 2)}:${digits.slice(2, 3)}`

    // 4 ou mais dígitos
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`
  }

  const validateAndFormat = (input: string): string => {
    const digits = input.replace(/\D/g, '')

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

  return (
    <div className="relative">
      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={cn("pl-10", className)}
        disabled={disabled}
        maxLength={5}
      />
    </div>
  )
}