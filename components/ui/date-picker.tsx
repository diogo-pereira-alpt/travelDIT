"use client"

import * as React from "react"
import { format } from "date-fns"
import { pt } from "date-fns/locale"
import { CalendarIcon, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onSelect?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
}

export function DatePicker({
  date,
  onSelect,
  placeholder = "Selecionar data",
  className,
  disabled = false,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Criar uma nova data no timezone local para evitar problemas de UTC
      const localDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        12, // Meio-dia para evitar problemas de DST
        0,
        0,
        0
      )
      onSelect?.(localDate)
      setIsOpen(false)
    } else {
      onSelect?.(undefined)
    }
  }

  const handleClear = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation()
    onSelect?.(undefined)
  }

  const formatDate = (date: Date) => {
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: pt })
  }

  const yearRange = React.useMemo(() => ({
    from: new Date().getFullYear() - 1,
    to: new Date().getFullYear() + 2
  }), [])

  const getAriaLabel = () => {
    if (date) {
      return `Data selecionada: ${formatDate(date)}. Pressione Enter para alterar ou Delete para limpar.`
    }
    return `${placeholder}. Pressione Enter para selecionar uma data.`
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal transition-all hover:bg-accent hover:border-primary/50",
            !date && "text-muted-foreground",
            date && "pr-8 relative",
            className
          )}
          disabled={disabled}
          aria-label={getAriaLabel()}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="flex-1 truncate">
            {date ? (
              <span className="font-medium">
                {format(date, "dd/MM/yyyy", { locale: pt })}
              </span>
            ) : (
              placeholder
            )}
          </span>
          {date && !disabled && (
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
              aria-label="Limpar data"
              tabIndex={0}
            >
              <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b bg-muted/50">
          <p className="text-sm font-medium text-center">
            {date ? formatDate(date) : "Selecione uma data"}
          </p>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          disabled={(day) => {
            const dayAtNoon = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 12, 0, 0, 0)
            if (minDate) {
              const minAtNoon = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate(), 12, 0, 0, 0)
              if (dayAtNoon < minAtNoon) return true
            }
            if (maxDate) {
              const maxAtNoon = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate(), 12, 0, 0, 0)
              if (dayAtNoon > maxAtNoon) return true
            }
            return false
          }}
          initialFocus
          captionLayout="dropdown"
          fromYear={yearRange.from}
          toYear={yearRange.to}
        />
        <div className="p-3 border-t bg-muted/50 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => handleSelect(new Date())}
          >
            Hoje
          </Button>
          {date && (
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => handleSelect(undefined)}
            >
              Limpar
            </Button>
          )}
        </div>
        <div className="px-3 pb-3 text-xs text-muted-foreground text-center">
          Use as setas do teclado para navegar
        </div>
      </PopoverContent>
    </Popover>
  )
}