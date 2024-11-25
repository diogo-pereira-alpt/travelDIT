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
import { CalendarIcon, Copy } from 'lucide-react'
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

  const copyToClipboard = () => {
    if (!startDate || !endDate) return

    const text = `De ${format(startDate, 'dd/MM/yyyy')} a ${format(endDate, 'dd/MM/yyyy')}
Alojamento (${expenses.nights} noites): ${expenses.accommodation.toFixed(2)}€
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

    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Calculadora de Despesas Viagens" />

      <main className="container mx-auto py-8">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="pt-6">
            <div className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                <Label htmlFor="start-date" className='font-bold'>Data de Ida:</Label>
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'dd/MM/yyyy') : "Selecione a data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={handleStartDateChange}
                        locale={pt}
                        disabled={(date) => isBefore(date, startOfToday())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="end-date" className='font-bold'>Data de Volta:</Label>
                  <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'dd/MM/yyyy') : "Selecione a data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
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
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid gap-2">
                <Label className='font-bold'>Meio de Transporte:</Label>
                <Select value={transport} onValueChange={setTransport}>
                  <SelectTrigger>
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
                <Card className="mt-4 bg-gray-50">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h2 className="text-xl font-bold mb-4">Resumo de Despesas:</h2>
                        <p>De {format(startDate, 'dd/MM/yyyy')} a {format(endDate, 'dd/MM/yyyy')}</p>
                        <p>Alojamento ({expenses.nights} noites): {expenses.accommodation.toFixed(2)}€</p>
                        <p>Transporte ({
                          transport === 'train-round' 
                            ? 'CP (Porto-Lisboa) Ida/Volta' 
                            : transport === 'train-one' 
                            ? 'CP (Porto-Lisboa) Só Ida ou Volta' 
                            : transport === 'car' 
                            ? 'Carro' 
                            : 'Não é necessário'
                        }): {expenses.transport.toFixed(2)}€</p>
                        <p className="font-bold">Total: {expenses.total.toFixed(2)}€</p>
                      </div>
                      <Button variant="outline" size="icon" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4" />
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