'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Calendar, 
  MapPin, 
  Hotel, 
  Train, 
  User, 
  Mail, 
  Download, 
  Clock,
  Euro,
  FileText,
  Send,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react'
import meoLogo from "@/images/meo.png"
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

// Header Component
const Header = ({ title }: { title: string }) => {
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src={meoLogo.src} 
              alt="logo" 
              className="h-8 w-auto"
            />
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          </div>
        </div>
      </div>
    </header>
  )
}

// Interfaces
interface ColaboradorData {
  apelido: string
  primeiro_nome: string
  num_colaborador: string
  direcao: string
  centro_custo: string
  bi_cc: string
}

interface AlojamentoReserva {
  cidade: string
  hotel: string
  data_chegada: string
  data_partida: string
  tipo_quarto: string
  observacoes: string
}

interface ComboioViagem {
  local_partida: string
  local_chegada: string
  data: string
  hora: string
  tipo: string
  observacoes: string
}

interface TravelFormData {
  colaborador: ColaboradorData
  motivoViagem: string
  alojamento: AlojamentoReserva
  comboio_ida: ComboioViagem
  tem_regresso: boolean
  comboio_regresso: ComboioViagem
}

export default function TravelCalculator() {
  const [formData, setFormData] = useState<TravelFormData>({
    colaborador: {
      apelido: 'Pereira',
      primeiro_nome: 'Diogo',
      num_colaborador: '10059580',
      direcao: 'AIC',
      centro_custo: '001-3751',
      bi_cc: '15469466'
    },
    motivoViagem: 'Hackathon de dia 16, 18 e 19',
    alojamento: {
      cidade: 'Picoas',
      hotel: '',
      data_chegada: '',
      data_partida: '',
      tipo_quarto: '1PAX',
      observacoes: ''
    },
    comboio_ida: {
      local_partida: 'Porto Campanha',
      local_chegada: 'Lisboa Oriente',
      data: '',
      hora: '',
      tipo: 'Alfa Pendular',
      observacoes: ''
    },
    tem_regresso: false,
    comboio_regresso: {
      local_partida: 'Lisboa Oriente',
      local_chegada: 'Porto Campanha',
      data: '',
      hora: '',
      tipo: 'Alfa Pendular',
      observacoes: ''
    }
  })

  const [emailContent, setEmailContent] = useState('')
  const [showOptionalFields, setShowOptionalFields] = useState(false)
  const [error, setError] = useState('')

  // Calculate nights between dates
  const calculateNights = (checkin: string, checkout: string): number => {
    if (!checkin || !checkout) return 0
    const checkinDate = new Date(checkin)
    const checkoutDate = new Date(checkout)
    const diffTime = Math.abs(checkoutDate.getTime() - checkinDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Generate email content
  const generateEmailContent = useCallback(() => {
    const noites = calculateNights(formData.alojamento.data_chegada, formData.alojamento.data_partida)
    const estadiaCusto = noites * 83.30
    const cityTaxCusto = noites * 4.00
    
    let comboinCusto = 0
    if (formData.comboio_ida.local_partida) {
      comboinCusto = 36.00
      if (formData.tem_regresso) {
        comboinCusto = 72.00
      }
    }

    const totalCusto = estadiaCusto + cityTaxCusto + comboinCusto

    // Format dates
    const formatarData = (data: string) => {
      if (!data) return '[Data]'
      const date = new Date(data)
      return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'long' })
    }

    const dataInicioFormatada = formData.alojamento.data_chegada 
      ? formatarData(formData.alojamento.data_chegada)
      : '[Data início]'
    
    const dataFimFormatada = formData.alojamento.data_partida 
      ? formatarData(formData.alojamento.data_partida)
      : '[Data fim]'

    const destino = formData.alojamento.cidade || 'Picoas'

    // Smart text based on what's selected
    const temEstadia = formData.alojamento.data_chegada && formData.alojamento.data_partida
    const temViagem = formData.comboio_ida.local_partida

    let textoSolicitacao = ''
    if (temEstadia && temViagem) {
      textoSolicitacao = `No seguimento da ${formData.motivoViagem}, solicito o OK para pedir estadia e viagem para ${destino} de ${dataInicioFormatada} a ${dataFimFormatada}.`
    } else if (temEstadia && !temViagem) {
      textoSolicitacao = `No seguimento da ${formData.motivoViagem}, solicito o OK para pedir estadia para ${destino} de ${dataInicioFormatada} a ${dataFimFormatada}.`
    } else if (!temEstadia && temViagem) {
      textoSolicitacao = `No seguimento da ${formData.motivoViagem}, solicito o OK para pedir viagem para ${destino}.`
    } else {
      textoSolicitacao = `No seguimento da ${formData.motivoViagem}, solicito o OK para pedir autorização para ${destino}.`
    }

    const content = `Olá Paulo,

${textoSolicitacao}

${noites > 0 ? `Estadia: 83,30 Eur / noite / pessoa ${estadiaCusto.toFixed(2)}€
City Tax: 4,00 Eur / noite / pessoa ${cityTaxCusto.toFixed(2)}€` : ''}${comboinCusto > 0 ? `
Comboio ${comboinCusto.toFixed(0)} Eur (${formData.tem_regresso ? 'ida e volta' : 'apenas ida'})` : ''}
 
Total: ${totalCusto.toFixed(2)}€
 
Obrigado desde já,
Os meus cumprimentos,

${formData.colaborador.primeiro_nome} ${formData.colaborador.apelido}`

    return content
  }, [formData])

  // Update email content when form changes
  useEffect(() => {
    setEmailContent(generateEmailContent())
  }, [generateEmailContent])

  // Send email
  const sendEmail = useCallback(() => {
    const subject = encodeURIComponent('Pedido de Viagem')
    const body = encodeURIComponent(emailContent)
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`
    window.open(mailtoUrl, '_self')
  }, [emailContent])

  // Generate Excel (simplified for now)
  const generateExcel = async () => {
    try {
      setError('')
      // This would contain the Excel generation logic
      console.log('Generating Excel with data:', formData)
      alert('Funcionalidade de Excel em desenvolvimento')
    } catch (err) {
      setError('Erro ao gerar Excel: ' + (err as Error).message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header title="Sistema de Template de Viagem" />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            ✈️ Pedido de Viagem
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ferramenta otimizada para criar pedidos de viagem rapidamente. 
            Normalmente apenas precisa de alterar as <Badge className="mx-1">datas</Badge> e eventualmente o <Badge className="mx-1">comboio</Badge>
          </p>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50/50">
            <CardContent className="pt-6">
              <p className="text-red-600 flex items-center gap-2">
                ❌ {error}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* FORMULÁRIO - Lado Esquerdo (2/3) */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Dados do Colaborador */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">Dados do Colaborador</CardTitle>
                    <p className="text-sm text-gray-600">Informações já preenchidas por defeito</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Primeiro Nome</Label>
                    <Input
                      value={formData.colaborador.primeiro_nome}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        colaborador: { ...prev.colaborador, primeiro_nome: e.target.value }
                      }))}
                      className="bg-white/70"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Apelido</Label>
                    <Input
                      value={formData.colaborador.apelido}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        colaborador: { ...prev.colaborador, apelido: e.target.value }
                      }))}
                      className="bg-white/70"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Nº Colaborador</Label>
                    <Input
                      value={formData.colaborador.num_colaborador}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        colaborador: { ...prev.colaborador, num_colaborador: e.target.value }
                      }))}
                      className="bg-white/70"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Motivo da Viagem */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4 bg-gradient-to-r from-amber-50 to-orange-50">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-100 rounded-xl">
                    <MapPin className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">Motivo da Viagem</CardTitle>
                    <p className="text-sm text-gray-600">Descreva brevemente o motivo</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Motivo</Label>
                  <Input
                    value={formData.motivoViagem}
                    onChange={(e) => setFormData(prev => ({ ...prev, motivoViagem: e.target.value }))}
                    placeholder="Ex: Hackathon de dia 16, 18 e 19"
                    className="bg-white/70"
                  />
                  <p className="text-xs text-gray-500">
                    💡 Apenas o motivo (ex: "Reunião com cliente", "Formação técnica")
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Alojamento & Datas */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Hotel className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">Alojamento & Datas</CardTitle>
                    <p className="text-sm text-gray-600">Principais campos utilizados</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Cidade e Hotel */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Cidade/Destino
                      </Label>
                      <Input
                        value={formData.alojamento.cidade}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          alojamento: { ...prev.alojamento, cidade: e.target.value }
                        }))}
                        placeholder="Picoas"
                        className="bg-white/70"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Hotel className="h-4 w-4" />
                        Hotel (opcional)
                      </Label>
                      <Input
                        value={formData.alojamento.hotel}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          alojamento: { ...prev.alojamento, hotel: e.target.value }
                        }))}
                        placeholder="Ex: Turim Lisboa"
                        className="bg-white/70"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Datas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-green-600" />
                        Data Chegada *
                      </Label>
                      <Input
                        type="date"
                        value={formData.alojamento.data_chegada}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          alojamento: { ...prev.alojamento, data_chegada: e.target.value }
                        }))}
                        className="bg-white/70"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-red-600" />
                        Data Partida *
                      </Label>
                      <Input
                        type="date"
                        value={formData.alojamento.data_partida}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          alojamento: { ...prev.alojamento, data_partida: e.target.value }
                        }))}
                        className="bg-white/70"
                      />
                    </div>
                  </div>

                  {/* Cálculo Automático */}
                  {formData.alojamento.data_chegada && formData.alojamento.data_partida && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                          <Euro className="h-3 w-3 mr-1" />
                          Cálculo Automático
                        </Badge>
                        <span className="text-sm font-medium text-blue-700">
                          {calculateNights(formData.alojamento.data_chegada, formData.alojamento.data_partida)} noites × 87,30€ = {(calculateNights(formData.alojamento.data_chegada, formData.alojamento.data_partida) * 87.30).toFixed(2)}€
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Comboio */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4 bg-gradient-to-r from-orange-50 to-red-50">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <Train className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">Transporte - Comboio</CardTitle>
                    <p className="text-sm text-gray-600">Configuração da viagem</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Viagem de Ida */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-green-700 flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      Viagem de Ida
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Local Partida</Label>
                        <Input
                          value={formData.comboio_ida.local_partida}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            comboio_ida: { ...prev.comboio_ida, local_partida: e.target.value }
                          }))}
                          placeholder="Porto Campanha"
                          className="bg-white/70"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Local Destino</Label>
                        <Input
                          value={formData.comboio_ida.local_chegada}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            comboio_ida: { ...prev.comboio_ida, local_chegada: e.target.value }
                          }))}
                          placeholder="Lisboa Oriente"
                          className="bg-white/70"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Data Viagem</Label>
                        <Input
                          type="date"
                          value={formData.comboio_ida.data}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            comboio_ida: { ...prev.comboio_ida, data: e.target.value }
                          }))}
                          className="bg-white/70"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Tipo Comboio</Label>
                        <Select
                          value={formData.comboio_ida.tipo}
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            comboio_ida: { ...prev.comboio_ida, tipo: value }
                          }))}
                        >
                          <SelectTrigger className="bg-white/70">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Alfa Pendular">Alfa Pendular</SelectItem>
                            <SelectItem value="Intercidades">Intercidades</SelectItem>
                            <SelectItem value="Regional">Regional</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Checkbox para regresso */}
                  <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="regresso"
                      checked={formData.tem_regresso}
                      onChange={(e) => setFormData(prev => ({ ...prev, tem_regresso: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="regresso" className="text-sm font-medium cursor-pointer">
                      🔄 Incluir viagem de regresso (+36€)
                    </Label>
                  </div>

                  {/* Custo do Comboio */}
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                        <Euro className="h-3 w-3 mr-1" />
                        Custo do Comboio
                      </Badge>
                      <span className="text-sm font-medium text-orange-700">
                        {formData.tem_regresso ? '72€ (ida e volta)' : '36€ (apenas ida)'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Campos Opcionais Toggle */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-gray-500" />
                    <div>
                      <h3 className="font-medium text-gray-900">Campos Opcionais</h3>
                      <p className="text-sm text-gray-500">Avião, Automóvel e Outros Serviços (raramente usados)</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowOptionalFields(!showOptionalFields)}
                    className="flex items-center gap-2"
                  >
                    {showOptionalFields ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {showOptionalFields ? 'Ocultar' : 'Mostrar'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Download Button */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <Button 
                  onClick={generateExcel}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3"
                  size="lg"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download Template Excel
                </Button>
                <p className="text-center text-sm text-gray-500 mt-2">
                  Template baseado na estrutura oficial do Excel
                </p>
              </CardContent>
            </Card>
          </div>

          {/* PREVIEW DO EMAIL - Lado Direito (1/3) */}
          <div className="xl:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <Mail className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-gray-900">Preview do Email</CardTitle>
                      <p className="text-sm text-gray-600">Template: "Pedido de Viagem"</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Assunto */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-purple-600" />
                        <Label className="text-sm font-medium">Assunto:</Label>
                      </div>
                      <div className="p-3 bg-purple-50 rounded border text-sm font-medium">
                        Pedido de Viagem
                      </div>
                    </div>

                    {/* Conteúdo */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4 text-purple-600" />
                        Conteúdo:
                      </Label>
                      <Textarea
                        value={emailContent}
                        onChange={(e) => setEmailContent(e.target.value)}
                        className="min-h-[300px] bg-white/70 text-sm"
                        placeholder="O conteúdo do email será gerado automaticamente..."
                      />
                    </div>

                    {/* Botão Enviar */}
                    <Button 
                      onClick={sendEmail}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3"
                      size="lg"
                    >
                      <Send className="h-5 w-5 mr-2" />
                      Enviar Email
                    </Button>

                    <div className="text-center space-y-1">
                      <p className="text-xs text-gray-500">
                        💡 Clique para abrir automaticamente no seu cliente de email
                      </p>
                      <p className="text-xs text-gray-500">
                        (Outlook, Gmail, Mail, etc.)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Funcionalidades Ativas */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-700">✅</Badge>
                    Funcionalidades Ativas
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Cálculo automático de preços
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Template de email personalizado
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Export para Excel disponível
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Interface moderna e responsiva
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
