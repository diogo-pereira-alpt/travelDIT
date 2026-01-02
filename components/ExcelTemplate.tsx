'use client'

import * as ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { format, parse, isValid } from 'date-fns'
import * as XLSX from 'xlsx'

// Helper function to format date strings to dd/MM/yyyy
const formatDateForExcel = (dateString: string): string => {
  if (!dateString) return ''
  
  // Try to parse the date string (assuming it comes in ISO format or similar)
  const date = new Date(dateString)
  
  if (isValid(date)) {
    return format(date, 'dd/MM/yyyy')
  }
  
  return dateString // Return original if can't parse
}

// Toast notification interface
interface ToastMessage {
  type: 'success' | 'error' | 'info'
  title: string
  message: string
  duration?: number
  actionButton?: {
    text: string
    onClick: () => void
  }
}

// Global toast function - this will be passed from the main component
let showToast: (toast: ToastMessage) => void = (toast) => {
  // Fallback to alert if no toast system is connected
  alert(`${toast.title}\n${toast.message}`)
}

// Function to set the toast handler
export const setToastHandler = (handler: (toast: ToastMessage) => void) => {
  showToast = handler
}

// Interfaces baseadas no backup
interface ColaboradorData {
  apelido: string
  primeiro_nome: string
  num_colaborador: string
  direcao: string
  centro_custo: string
  bi_cc: string
  nif: string
  contacto: string
}

interface AviaoViagem {
  origem: string
  destino: string
  data: string
  hora_chegada: string
  hora_partida: string
  observacoes: string
}

interface AlojamentoReserva {
  cidade: string
  hotel: string
  data_chegada: string
  data_partida: string
  tipo_quarto: string
  observacoes: string
}

interface AutomovelAluguer {
  cidade_levantamento: string
  local_levantamento: string
  data_levantamento: string
  hora_levantamento: string
  cidade_devolucao: string
  local_devolucao: string
  data_devolucao: string
  hora_devolucao: string
  tipo_viatura: string
  observacoes: string
}

interface ComboioViagem {
  local_partida: string
  local_destino: string
  data: string
  hora_partida: string
  classe: string
}

interface TravelFormData {
  colaborador: ColaboradorData
  tem_aviao: boolean
  aviao_viagens: AviaoViagem[]
  tem_alojamento: boolean
  alojamentos: AlojamentoReserva[]
  tem_automovel: boolean
  automoveis: AutomovelAluguer[]
  tem_outros: boolean
  outros_servicos: string
  tem_comboio: boolean
  comboio_ida: ComboioViagem
  tem_regresso: boolean
  comboio_regresso: ComboioViagem
  observacoes_ida: string
  observacoes_regresso: string
}

export const generateExcelFromTemplate = async (formData: TravelFormData): Promise<void> => {
  try {
    // Show initial notification
    showToast({
      type: 'info',
      title: '⏳ Gerando Excel...',
      message: 'A preparar o ficheiro de viagem',
      duration: 3000
    })

    // Ler o template original
    const response = await fetch('/TemplateViagens_template.xlsx')
    if (!response.ok) {
      throw new Error('Não foi possível carregar o template Excel')
    }
    
    const buffer = await response.arrayBuffer()
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)
    
    const worksheet = workbook.getWorksheet(1) // Primeira sheet
    if (!worksheet) {
      throw new Error('Não foi possível acessar a worksheet')
    }

    // Preencher dados do colaborador (linha 8, baseado na estrutura)
    worksheet.getCell(8, 2).value = formData.colaborador.apelido
    worksheet.getCell(8, 3).value = formData.colaborador.primeiro_nome
    worksheet.getCell(8, 4).value = formData.colaborador.num_colaborador
    worksheet.getCell(8, 5).value = formData.colaborador.direcao
    worksheet.getCell(8, 6).value = formData.colaborador.centro_custo
    worksheet.getCell(8, 7).value = formData.colaborador.bi_cc
    worksheet.getCell(8, 8).value = formData.colaborador.nif
    worksheet.getCell(8, 9).value = formData.colaborador.contacto

    // Preencher dados do avião (linhas 24-29)
    if (formData.tem_aviao) {
      formData.aviao_viagens.slice(0, 6).forEach((viagem, index) => {
        const row = 24 + index
        worksheet.getCell(row, 2).value = viagem.origem
        worksheet.getCell(row, 3).value = viagem.destino
        worksheet.getCell(row, 4).value = formatDateForExcel(viagem.data)
        worksheet.getCell(row, 5).value = viagem.hora_chegada
        worksheet.getCell(row, 6).value = viagem.hora_partida
        worksheet.getCell(row, 7).value = viagem.observacoes
      })
    }

    // Preencher dados do alojamento (linhas 36-41)
    if (formData.tem_alojamento) {
      formData.alojamentos.slice(0, 6).forEach((alojamento, index) => {
        const row = 36 + index
        worksheet.getCell(row, 2).value = alojamento.cidade
        worksheet.getCell(row, 3).value = alojamento.hotel
        worksheet.getCell(row, 4).value = formatDateForExcel(alojamento.data_chegada)
        worksheet.getCell(row, 5).value = formatDateForExcel(alojamento.data_partida)
        worksheet.getCell(row, 6).value = alojamento.tipo_quarto
        worksheet.getCell(row, 7).value = alojamento.observacoes
      })
    }

    // Preencher dados do automóvel (linhas 49-54)
    if (formData.tem_automovel) {
      formData.automoveis.slice(0, 6).forEach((auto, index) => {
        const row = 49 + index
        worksheet.getCell(row, 2).value = auto.cidade_levantamento
        worksheet.getCell(row, 3).value = auto.local_levantamento
        worksheet.getCell(row, 4).value = formatDateForExcel(auto.data_levantamento)
        worksheet.getCell(row, 5).value = auto.hora_levantamento
        worksheet.getCell(row, 6).value = auto.cidade_devolucao
        worksheet.getCell(row, 7).value = auto.local_devolucao
        worksheet.getCell(row, 8).value = formatDateForExcel(auto.data_devolucao)
        worksheet.getCell(row, 9).value = auto.hora_devolucao
        worksheet.getCell(row, 10).value = auto.tipo_viatura
        worksheet.getCell(row, 11).value = auto.observacoes
      })
    }

    // Preencher outros serviços (linha 60)
    if (formData.tem_outros) {
      worksheet.getCell(60, 2).value = formData.outros_servicos
    }

    // Preencher dados do comboio (linha 92)
    if (formData.tem_comboio) {
      // Ida (colunas 2-6)
      worksheet.getCell(92, 2).value = formData.comboio_ida.local_partida
      worksheet.getCell(92, 3).value = formData.comboio_ida.local_destino
      worksheet.getCell(92, 4).value = formatDateForExcel(formData.comboio_ida.data)
      worksheet.getCell(92, 5).value = formData.comboio_ida.hora_partida
      worksheet.getCell(92, 6).value = formData.comboio_ida.classe

      // Regresso (colunas 7-11) se ativo
      if (formData.tem_regresso) {
        worksheet.getCell(92, 7).value = formData.comboio_regresso.local_partida
        worksheet.getCell(92, 8).value = formData.comboio_regresso.local_destino
        worksheet.getCell(92, 9).value = formatDateForExcel(formData.comboio_regresso.data)
        worksheet.getCell(92, 10).value = formData.comboio_regresso.hora_partida
        worksheet.getCell(92, 11).value = formData.comboio_regresso.classe
      }

      // Observações (linha 102)
      if (formData.observacoes_ida) {
        worksheet.getCell(102, 2).value = formData.observacoes_ida
      }
      if (formData.observacoes_regresso) {
        worksheet.getCell(102, 7).value = formData.observacoes_regresso
      }
    }

    // Gerar nome do ficheiro
    const now = new Date()
    const timestamp = format(now, 'dd_MM_yyyy')
    const filename = `TemplateViagens_${timestamp}.xlsx`

    // Fazer download com feedback melhorado
    const buffer2 = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer2], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    
    // Make the download
    saveAs(blob, filename)
    
    // Show success notification
    showToast({
      type: 'success',
      title: '✅ Download Concluído!',
      message: `Ficheiro: ${filename}`,
      duration: 5000
    })

  } catch (error) {
    console.error('Erro ao gerar Excel:', error)
    showToast({
      type: 'error',
      title: '❌ Erro no Download',
      message: `Erro ao gerar Excel: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      duration: 8000
    })
    throw new Error(`Erro ao gerar Excel: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
  }
}

// Manter a função antiga para compatibilidade
interface TravelData {
  startDate: Date
  endDate: Date
  destination: string
  nights: number
  accommodation: number
  cityTax: number
  transport: number
  total: number
  transportType: string
}

export const createTravelTemplate = (data: TravelData) => {
  // Import necessário para a função antiga
  
  // Dados de identificação (preenchidos por default)
  const identification = [
    ['IDENTIFICAÇÃO'],
    ['Nome:', 'Diogo Pereira'],
    ['Número de Colaborador:', '123456'],
    ['Função:', 'IT Specialist'],
    ['Departamento:', 'Tecnologia'],
    ['Centro de Custo:', 'TEC001'],
    ['NIF/CC:', '123456789'],
    ['']
  ]

  // Dados da viagem
  const travelInfo = [
    ['DADOS DA VIAGEM'],
    ['Destino:', data.destination],
    ['Data de Início:', data.startDate.toLocaleDateString()],
    ['Data de Fim:', data.endDate.toLocaleDateString()],
    ['Duração:', `${data.nights} noites`],
    ['Tipo de Transporte:', data.transportType],
    ['']
  ]

  // Dados de custos
  const costInfo = [
    ['ESTIMATIVA DE CUSTOS'],
    ['Alojamento:', `€${data.accommodation.toFixed(2)}`],
    ['Taxa Turística:', `€${data.cityTax.toFixed(2)}`],
    ['Transporte:', `€${data.transport.toFixed(2)}`],
    ['Total Estimado:', `€${data.total.toFixed(2)}`],
    [''],
    ['Observações:', 'Template gerado automaticamente'],
    ['Data de Criação:', new Date().toLocaleDateString()]
  ]

  const allData = [...identification, ...travelInfo, ...costInfo]
  
  // Criar workbook
  const ws = XLSX.utils.aoa_to_sheet(allData)
  
  // Definir estilos (larguras das colunas)
  ws['!cols'] = [
    { width: 25 }, // Coluna A
    { width: 20 }, // Coluna B
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Solicitação de Viagem')

  // Gerar nome do ficheiro com data atual
  const today = new Date()
  const fileName = `TemplateViagens_${format(today, 'dd_MM_yyyy')}.xlsx`

  // Fazer download
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([wbout], { type: 'application/octet-stream' })
  saveAs(blob, fileName)
}

export const generateEmailContent = (data: TravelData): string => {
  const formatDateForEmail = (date: Date) => format(date, 'dd \'de\' MMMM')
  
  return `Bom dia,

Venho por este meio solicitar aprovação para a seguinte viagem:

DADOS DA VIAGEM:
- Destino: ${data.destination}
- Data de início: ${formatDateForEmail(data.startDate)}
- Data de fim: ${formatDateForEmail(data.endDate)}
- Duração: ${data.nights} noites
- Tipo de transporte: ${data.transportType}

ESTIMATIVA DE CUSTOS:
- Alojamento: €${data.accommodation.toFixed(2)}
- Taxa turística: €${data.cityTax.toFixed(2)}
- Transporte: €${data.transport.toFixed(2)}
- Total estimado: €${data.total.toFixed(2)}

Fico a aguardar aprovação.

Cumprimentos,
[Nome do Colaborador]`
}