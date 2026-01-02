'use client'

import { useState, useEffect } from 'react'
import { format, differenceInDays, isBefore, startOfToday, isEqual } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon, Copy, Check } from 'lucide-react'
import meoLogo from "@/images/meo.png"

const Header = ({ title }: { title: string }) => {
  return (
    <header className="bg-black text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">{title}</h1>
      <img src={meoLogo.src} alt="logo"/>
    </header>
  )
}

export default function TravelExpenses() {
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [transport, setTransport] = useState<string>("none")
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [expenses, setExpenses] = useState({
    nights: 0,
    accommodation: 0,
    transport: 0,
    total: 0
  })

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date)
    setStartDateOpen(false)
    if (date && endDate && (isBefore(endDate, date))) {
      setEndDate(undefined)
    }
  }

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date)
    setEndDateOpen(false)
  }

  useEffect(() => {
    if (startDate && endDate) {
      const nights = differenceInDays(endDate, startDate)
      const accommodation = nights * 85
      let transportCost = 0

      switch (transport) {
        case 'train-round':
          transportCost = 72
          break
        case 'train-one':
          transportCost = 36
          break
        case 'car':
          transportCost = 0
          break
        case 'none':
        default:
          transportCost = 0
          break
      }

      setExpenses({
        nights,
        accommodation,
        transport: transportCost,
        total: accommodation + transportCost
      })
    }
  }, [startDate, endDate, transport])

  const copyToClipboard = async () => {
    if (!startDate || !endDate) return

    const text = `De ${format(startDate, 'dd/MM/yyyy', { locale: pt })} a ${format(endDate, 'dd/MM/yyyy', { locale: pt })}
Alojamento (${expenses.nights} ${expenses.nights === 1 ? 'noite' : 'noites'}): ${expenses.accommodation.toFixed(2)}€
Transporte (${
  transport === 'train-round' 
    ? 'CP (Porto-Lisboa) Ida/Volta' 
    : transport === 'train-one' 
    ? 'CP (Porto-Lisboa) Só Ida ou Volta' 
    : transport === 'car' 
    ? 'Carro' 
    : 'Não é necessário'
}): ${expenses.transport.toFixed(2)}€
Total: ${expenses.total.toFixed(2)}€`

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Calculadora de Despesas Viagens" />

      <main className="container mx-auto py-8">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="pt-6">
            <div className="grid gap-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date-range" className='font-bold'>
                    Período da Viagem:
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      (Selecione as datas de ida e volta)
                    </span>
                  </Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="start-date" className="text-sm">Data de Ida:</Label>
                      <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            id="start-date"
                            variant="outline"
                            role="combobox"
                            aria-label="Selecionar data de ida"
                            aria-expanded={startDateOpen}
                            aria-haspopup="dialog"
                            className={cn(
                              "justify-start text-left font-normal h-11",
                              !startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, 'dd/MM/yyyy', { locale: pt }) : "Selecione a data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={handleStartDateChange}
                            locale={pt}
                            disabled={(date) => isBefore(date, startOfToday())}
                            initialFocus
                          />
                          {startDate && (
                            <div className="p-3 border-t flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                {format(startDate, 'dd/MM/yyyy', { locale: pt })}
                              </span>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setStartDate(undefined)
                                  setStartDateOpen(false)
                                }}
                                aria-label="Limpar data de ida"
                              >
                                Limpar
                              </Button>
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="end-date" className="text-sm">Data de Volta:</Label>
                      <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            id="end-date"
                            variant="outline"
                            role="combobox"
                            aria-label="Selecionar data de volta"
                            aria-expanded={endDateOpen}
                            aria-haspopup="dialog"
                            disabled={!startDate}
                            className={cn(
                              "justify-start text-left font-normal h-11",
                              !endDate && "text-muted-foreground",
                              !startDate && "cursor-not-allowed"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, 'dd/MM/yyyy', { locale: pt }) : "Selecione a data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={handleEndDateChange}
                            locale={pt}
                            disabled={(date) => 
                              startDate 
                                ? isBefore(date, startDate) && !isEqual(date, startDate)
                                : isBefore(date, startOfToday())
                            }
                            initialFocus
                          />
                          {endDate && (
                            <div className="p-3 border-t flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                {format(endDate, 'dd/MM/yyyy', { locale: pt })}
                              </span>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setEndDate(undefined)
                                  setEndDateOpen(false)
                                }}
                                aria-label="Limpar data de volta"
                              >
                                Limpar
                              </Button>
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  {startDate && !endDate && (
                    <p className="text-sm text-amber-600 mt-1" role="alert">
                      Por favor, selecione a data de volta para continuar
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="transport-select" className='font-bold'>
                  Meio de Transporte:
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    (Opcional)
                  </span>
                </Label>
                <Select value={transport} onValueChange={setTransport}>
                  <SelectTrigger 
                    id="transport-select"
                    aria-label="Selecionar meio de transporte"
                    className="h-11"
                  >
                    <SelectValue placeholder="Selecione o transporte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não é necessário</SelectItem>
                    <SelectItem value="train-round">CP Ida/Volta | Porto-Lisboa 72€</SelectItem>
                    <SelectItem value="train-one">CP Só Ida ou Volta | Porto-Lisboa 36€</SelectItem>
                    <SelectItem value="car">Carro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {startDate && endDate && (
                <Card className="mt-4 bg-gradient-to-br from-gray-50 to-gray-100 border-2" role="region" aria-label="Resumo de despesas calculadas">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-3 flex-1">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                          Resumo de Despesas:
                        </h2>
                        <div className="space-y-2 text-base">
                          <p className="flex justify-between items-center">
                            <span className="text-muted-foreground">Período:</span>
                            <span className="font-semibold">
                              {format(startDate, 'dd/MM/yyyy', { locale: pt })} a {format(endDate, 'dd/MM/yyyy', { locale: pt })}
                            </span>
                          </p>
                          <p className="flex justify-between items-center">
                            <span className="text-muted-foreground">Alojamento ({expenses.nights} {expenses.nights === 1 ? 'noite' : 'noites'}):</span>
                            <span className="font-semibold">{expenses.accommodation.toFixed(2)}€</span>
                          </p>
                          <p className="flex justify-between items-center">
                            <span className="text-muted-foreground">
                              Transporte ({
                                transport === 'train-round' 
                                  ? 'CP Ida/Volta' 
                                  : transport === 'train-one' 
                                  ? 'CP Só Ida ou Volta' 
                                  : transport === 'car' 
                                  ? 'Carro' 
                                  : 'Não é necessário'
                              }):
                            </span>
                            <span className="font-semibold">{expenses.transport.toFixed(2)}€</span>
                          </p>
                          <div className="pt-3 border-t mt-3">
                            <p className="flex justify-between items-center text-lg">
                              <span className="font-bold">Total:</span>
                              <span className="font-bold text-2xl">{expenses.total.toFixed(2)}€</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={copyToClipboard}
                        aria-label="Copiar resumo de despesas para área de transferência"
                        title="Copiar para área de transferência"
                        className="ml-4"
                      >
                        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}