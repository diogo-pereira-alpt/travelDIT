'use client'

import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { format } from "date-fns"
import { pt } from "date-fns/locale"

interface TravelFormData {
  colaborador: {
    nome: string
    nif: string
    funcao: string
    centroCusto: string
    telefone: string
    email: string
  }
  aviao: Array<{
    dataPartida: Date | null
    horaPartida: string
    origem: string
    dataChegada: Date | null
    horaChegada: string
    destino: string
    classe: string
    observacoes: string
  }>
  alojamento: Array<{
    checkin: Date | null
    checkout: Date | null
    local: string
    observacoes: string
  }>
  automovel: Array<{
    dataLevantamento: Date | null
    horaLevantamento: string
    localLevantamento: string
    dataEntrega: Date | null
    horaEntrega: string
    localEntrega: string
    categoria: string
    observacoes: string
  }>
  outros: Array<{
    data: Date | null
    descricao: string
    observacoes: string
  }>
  comboio: Array<{
    dataPartida: Date | null
    horaPartida: string
    origem: string
    dataChegada: Date | null
    horaChegada: string
    destino: string
    classe: string
    observacoes: string
  }>
}

interface EmailPreviewProps {
  formData: TravelFormData
}

export function EmailPreview({ formData }: EmailPreviewProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return ''
    return format(date, 'dd/MM/yyyy', { locale: pt })
  }

  const generateEmailContent = () => {
    const { colaborador, aviao, alojamento, automovel, outros, comboio } = formData
    
    let content = `Bom dia,

Venho por este meio solicitar a reserva de viagem com os seguintes detalhes:

DADOS DO COLABORADOR:
Nome: ${colaborador.nome || '[Nome]'}
NIF: ${colaborador.nif || '[NIF]'}
Função: ${colaborador.funcao || '[Função]'}
Centro de Custo: ${colaborador.centroCusto || '[Centro de Custo]'}
Telefone: ${colaborador.telefone || '[Telefone]'}
Email: ${colaborador.email || '[Email]'}

`

    // Avião
    if (aviao.some(v => v.origem || v.destino)) {
      content += `VIAGENS AÉREAS:\n`
      aviao.forEach((viagem, index) => {
        if (viagem.origem || viagem.destino) {
          content += `${index + 1}. ${viagem.origem || '[Origem]'} → ${viagem.destino || '[Destino]'}\n`
          content += `   Data Partida: ${formatDate(viagem.dataPartida) || '[Data]'} às ${viagem.horaPartida || '[Hora]'}\n`
          content += `   Data Chegada: ${formatDate(viagem.dataChegada) || '[Data]'} às ${viagem.horaChegada || '[Hora]'}\n`
          content += `   Classe: ${viagem.classe || 'Económica'}\n`
          if (viagem.observacoes) content += `   Observações: ${viagem.observacoes}\n`
          content += `\n`
        }
      })
    }

    // Alojamento
    if (alojamento.some(a => a.local)) {
      content += `ALOJAMENTO:\n`
      alojamento.forEach((estadia, index) => {
        if (estadia.local) {
          content += `${index + 1}. ${estadia.local}\n`
          content += `   Check-in: ${formatDate(estadia.checkin) || '[Data]'}\n`
          content += `   Check-out: ${formatDate(estadia.checkout) || '[Data]'}\n`
          if (estadia.observacoes) content += `   Observações: ${estadia.observacoes}\n`
          content += `\n`
        }
      })
    }

    // Automóvel
    if (automovel.some(a => a.localLevantamento || a.localEntrega)) {
      content += `ALUGUER DE AUTOMÓVEL:\n`
      automovel.forEach((aluguer, index) => {
        if (aluguer.localLevantamento || aluguer.localEntrega) {
          content += `${index + 1}. Categoria: ${aluguer.categoria || '[Categoria]'}\n`
          content += `   Levantamento: ${formatDate(aluguer.dataLevantamento) || '[Data]'} às ${aluguer.horaLevantamento || '[Hora]'} - ${aluguer.localLevantamento || '[Local]'}\n`
          content += `   Entrega: ${formatDate(aluguer.dataEntrega) || '[Data]'} às ${aluguer.horaEntrega || '[Hora]'} - ${aluguer.localEntrega || '[Local]'}\n`
          if (aluguer.observacoes) content += `   Observações: ${aluguer.observacoes}\n`
          content += `\n`
        }
      })
    }

    // Comboio
    if (comboio.some(c => c.origem || c.destino)) {
      content += `VIAGENS DE COMBOIO:\n`
      comboio.forEach((viagem, index) => {
        if (viagem.origem || viagem.destino) {
          content += `${index + 1}. ${viagem.origem || '[Origem]'} → ${viagem.destino || '[Destino]'}\n`
          content += `   Data Partida: ${formatDate(viagem.dataPartida) || '[Data]'} às ${viagem.horaPartida || '[Hora]'}\n`
          content += `   Data Chegada: ${formatDate(viagem.dataChegada) || '[Data]'} às ${viagem.horaChegada || '[Hora]'}\n`
          content += `   Classe: ${viagem.classe || '2ª Classe'}\n`
          if (viagem.observacoes) content += `   Observações: ${viagem.observacoes}\n`
          content += `\n`
        }
      })
    }

    // Outros
    if (outros.some(o => o.descricao)) {
      content += `OUTRAS DESPESAS:\n`
      outros.forEach((despesa, index) => {
        if (despesa.descricao) {
          content += `${index + 1}. ${despesa.descricao}\n`
          content += `   Data: ${formatDate(despesa.data) || '[Data]'}\n`
          if (despesa.observacoes) content += `   Observações: ${despesa.observacoes}\n`
          content += `\n`
        }
      })
    }

    content += `Agradeço desde já a vossa disponibilidade.

Cumprimentos,
${colaborador.nome || '[Nome]'}`

    return content
  }

  const handleMailto = () => {
    const subject = "Pedido de Viagem"
    const body = encodeURIComponent(generateEmailContent())
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`
    window.open(mailtoUrl)
  }

  const hasData = () => {
    const { colaborador, aviao, alojamento, automovel, outros, comboio } = formData
    return colaborador.nome || 
           aviao.some(v => v.origem || v.destino) ||
           alojamento.some(a => a.local) ||
           automovel.some(a => a.localLevantamento || a.localEntrega) ||
           outros.some(o => o.descricao) ||
           comboio.some(c => c.origem || c.destino)
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Preview do Email</CardTitle>
        <Badge variant={hasData() ? "default" : "secondary"}>
          {hasData() ? "Com dados" : "Aguarda dados"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-96 overflow-y-auto rounded-md border p-3 bg-muted/50">
          <pre className="text-sm whitespace-pre-wrap font-mono">
            {generateEmailContent()}
          </pre>
        </div>
        <Button 
          onClick={handleMailto} 
          className="w-full"
          disabled={!hasData()}
        >
          📧 Abrir Email
        </Button>
      </CardContent>
    </Card>
  )
}
