'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { TimePicker } from "@/components/ui/time-picker"
import { Checkbox } from "@/components/ui/checkbox"
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
  EyeOff,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  Plane,
  Car
} from 'lucide-react'
import meoLogo from "@/images/meo.png"
import { generateExcelFromTemplate, setToastHandler } from "@/components/ExcelTemplate"
import Auth from "@/components/Auth"
import { ToastContainer, useToasts } from "@/components/ui/toast"

// Header Component
const Header = ({ title }: { title: string }) => {
  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-sm border-b sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.img
              src={meoLogo.src}
              alt="logo"
              className="h-8 w-auto"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            <motion.h1
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-xl font-semibold text-gray-900"
            >
              {title}
            </motion.h1>
          </div>
        </div>
      </div>
    </motion.header>
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
  nif: string
  contacto: string
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
  tem_transporte: boolean
  tipo_transporte: 'comboio' | 'aviao' | 'carro' | 'nenhum'
  tem_hotel: boolean
}

// Quiz Steps
type QuizStep = 'inicio' | 'motivo' | 'transporte' | 'comboio_detalhes' | 'hotel' | 'datas' | 'preview'

export default function TravelCalculator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { toasts, addToast, removeToast } = useToasts()
  
  // Setup toast handler for Excel generation
  useEffect(() => {
    setToastHandler(addToast)
  }, [addToast])
  const [currentStep, setCurrentStep] = useState<QuizStep>('inicio')
  const [formData, setFormData] = useState<TravelFormData>({
    colaborador: {
      apelido: 'Pereira',
      primeiro_nome: 'Diogo',
      num_colaborador: '10059580',
      direcao: 'AIC',
      centro_custo: '001-3751',
      bi_cc: '15469466',
      nif: '233530509',
      contacto: '936439706'
    },
    motivoViagem: '',
    alojamento: {
      cidade: 'Lisboa',
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
    },
    tem_transporte: false,
    tipo_transporte: 'nenhum',
    tem_hotel: false
  })

  const [emailContent, setEmailContent] = useState('')
  const [error, setError] = useState('')

  // Verificar se já está autenticado no localStorage
  useEffect(() => {
    const authStatus = localStorage.getItem('travel_app_authenticated')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  // Função para lidar com autenticação bem-sucedida
  const handleAuthenticated = () => {
    localStorage.setItem('travel_app_authenticated', 'true')
    setIsAuthenticated(true)
  }

  // Calculate nights between dates
  const calculateNights = (checkin: string, checkout: string): number => {
    if (!checkin || !checkout) return 0
    const checkinDate = new Date(checkin)
    const checkoutDate = new Date(checkout)
    const diffTime = Math.abs(checkoutDate.getTime() - checkinDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Calculate costs
  const calculateCosts = () => {
    const noites = formData.tem_hotel ? calculateNights(formData.alojamento.data_chegada, formData.alojamento.data_partida) : 0
    const estadiaCusto = noites * 83.30
    const cityTaxCusto = noites * 4.00
    
    let transporteCusto = 0
    if (formData.tem_transporte && formData.tipo_transporte === 'comboio') {
      transporteCusto = formData.tem_regresso ? 72.00 : 36.00
    }

    const totalCusto = estadiaCusto + cityTaxCusto + transporteCusto

    return {
      noites,
      estadiaCusto,
      cityTaxCusto,
      transporteCusto,
      totalCusto
    }
  }

  // Generate email content
  const generateEmailContent = useCallback(() => {
    const { noites, estadiaCusto, cityTaxCusto, transporteCusto, totalCusto } = calculateCosts()

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
    const temEstadia = formData.tem_hotel && formData.alojamento.data_chegada && formData.alojamento.data_partida
    const temViagem = formData.tem_transporte

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
City Tax: 4,00 Eur / noite / pessoa ${cityTaxCusto.toFixed(2)}€` : ''}${transporteCusto > 0 ? `
Comboio ${transporteCusto.toFixed(0)} Eur (${formData.tem_regresso ? 'ida e volta' : 'apenas ida'})` : ''}
 
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

  // Load data from localStorage on mount
  useEffect(() => {
    const savedColaborador = localStorage.getItem('travelCalculator_colaborador')
    if (savedColaborador) {
      setFormData(prev => ({ ...prev, colaborador: JSON.parse(savedColaborador) }))
    }
  }, [])

  // Save colaborador data to localStorage
  useEffect(() => {
    localStorage.setItem('travelCalculator_colaborador', JSON.stringify(formData.colaborador))
  }, [formData.colaborador])

  // Send email
  const sendEmail = useCallback(() => {
    const subject = encodeURIComponent('Pedido de Viagem')
    const body = encodeURIComponent(emailContent)
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`
    window.open(mailtoUrl, '_self')
  }, [emailContent])

  // Loading state for Excel generation
  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false)
  
  // Generate Excel
  const generateExcel = async () => {
    if (isGeneratingExcel) return // Prevent multiple clicks
    
    try {
      setIsGeneratingExcel(true)
      setError('')
      
      // Show loading toast
      addToast({
        type: 'info',
        title: '📄 A Gerar Excel...',
        message: 'Por favor aguarde enquanto o ficheiro está a ser criado.',
        duration: 0 // Don't auto-remove
      })
      
      const templateData = {
        colaborador: formData.colaborador,
        tem_aviao: formData.tipo_transporte === 'aviao',
        aviao_viagens: [],
        tem_alojamento: formData.tem_hotel,
        alojamentos: formData.tem_hotel ? [{
          cidade: formData.alojamento.cidade,
          hotel: formData.alojamento.hotel,
          data_chegada: formData.alojamento.data_chegada,
          data_partida: formData.alojamento.data_partida,
          tipo_quarto: formData.alojamento.tipo_quarto,
          observacoes: formData.alojamento.observacoes
        }] : [],
        tem_automovel: formData.tipo_transporte === 'carro',
        automoveis: [],
        tem_outros: false,
        outros_servicos: '',
        tem_comboio: formData.tipo_transporte === 'comboio',
        comboio_ida: {
          local_partida: formData.comboio_ida.local_partida,
          local_destino: formData.comboio_ida.local_chegada,
          data: formData.comboio_ida.data,
          hora_partida: formData.comboio_ida.hora,
          classe: formData.comboio_ida.tipo
        },
        tem_regresso: formData.tem_regresso,
        comboio_regresso: {
          local_partida: formData.comboio_regresso.local_partida,
          local_destino: formData.comboio_regresso.local_chegada,
          data: formData.comboio_regresso.data,
          hora_partida: formData.comboio_regresso.hora,
          classe: formData.comboio_regresso.tipo
        },
        observacoes_ida: '',
        observacoes_regresso: ''
      }
      
      await generateExcelFromTemplate(templateData)
      
    } catch (err) {
      const errorMessage = 'Erro ao gerar Excel: ' + (err as Error).message
      setError(errorMessage)
      addToast({
        type: 'error',
        title: '❌ Erro no Download',
        message: errorMessage,
        duration: 8000
      })
    } finally {
      setIsGeneratingExcel(false)
    }
  }

  // Navigation functions
  const nextStep = () => {
    const steps: QuizStep[] = ['inicio', 'motivo', 'transporte', 'comboio_detalhes', 'hotel', 'datas', 'preview']
    const currentIndex = steps.indexOf(currentStep)

    // Se estamos no passo transporte e não escolhemos comboio, pular o step de detalhes do comboio
    if (currentStep === 'transporte' && formData.tipo_transporte !== 'comboio') {
      setCurrentStep('hotel')
      return
    }

    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const prevStep = () => {
    const steps: QuizStep[] = ['inicio', 'motivo', 'transporte', 'comboio_detalhes', 'hotel', 'datas', 'preview']
    const currentIndex = steps.indexOf(currentStep)

    // Se estamos no hotel e o transporte não é comboio, voltar direto para transporte
    if (currentStep === 'hotel' && formData.tipo_transporte !== 'comboio') {
      setCurrentStep('transporte')
      return
    }

    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  const goToStep = (step: QuizStep) => {
    setCurrentStep(step)
  }

  // Step progress
  const getStepNumber = (step: QuizStep): number => {
    const steps: QuizStep[] = ['inicio', 'motivo', 'transporte', 'comboio_detalhes', 'hotel', 'datas', 'preview']
    // Se não escolheu comboio, não contar o step comboio_detalhes
    if (formData.tipo_transporte !== 'comboio' && step !== 'comboio_detalhes') {
      const filteredSteps = steps.filter(s => s !== 'comboio_detalhes')
      return filteredSteps.indexOf(step) + 1
    }
    return steps.indexOf(step) + 1
  }

  const getTotalSteps = (): number => {
    // Se não escolheu comboio, são 6 steps (sem comboio_detalhes)
    return formData.tipo_transporte === 'comboio' ? 7 : 6
  }

  const isStepCompleted = (step: QuizStep): boolean => {
    switch (step) {
      case 'inicio':
        // Verificar se todos os campos obrigatórios do colaborador estão preenchidos
        return formData.colaborador.primeiro_nome.trim() !== '' &&
               formData.colaborador.apelido.trim() !== '' &&
               formData.colaborador.num_colaborador.trim() !== '' &&
               formData.colaborador.direcao.trim() !== '' &&
               formData.colaborador.centro_custo.trim() !== '' &&
               formData.colaborador.bi_cc.trim() !== ''
      case 'motivo':
        return formData.motivoViagem.trim() !== ''
      case 'transporte':
        return true // Always completed as it's a choice
      case 'comboio_detalhes':
        return formData.comboio_ida.data !== ''
      case 'hotel':
        return true // Always completed as it's a choice
      case 'datas':
        if (formData.tem_hotel) {
          return formData.alojamento.data_chegada !== '' && formData.alojamento.data_partida !== ''
        }
        return true
      case 'preview':
        return true
      default:
        return false
    }
  }

  // Render progress bar
  const renderProgressBar = () => {
    const currentStepNumber = getStepNumber(currentStep)
    const totalSteps = getTotalSteps()
    const progress = (currentStepNumber / totalSteps) * 100

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4"
      >
        <div className="flex justify-between items-center mb-2">
          <motion.h2
            key={currentStepNumber}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="text-base font-semibold text-gray-700"
          >
            Passo {currentStepNumber} de {totalSteps}
          </motion.h2>
          <motion.span
            key={progress}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-xs text-gray-500"
          >
            {Math.round(progress)}% concluído
          </motion.span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1.5 rounded-full"
          />
        </div>
      </motion.div>
    )
  }

  // Render navigation buttons
  const renderNavigation = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="flex justify-between mt-4 pt-4 border-t border-gray-200"
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 'inicio'}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
      </motion.div>

      {currentStep !== 'preview' ? (
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={nextStep}
            disabled={!isStepCompleted(currentStep)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
          >
            Próximo
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      ) : (
        <div className="flex gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={sendEmail}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Send className="h-4 w-4" />
              Enviar Email
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={generateExcel}
              disabled={isGeneratingExcel}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50"
            >
              {isGeneratingExcel ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-4 w-4"
                  >
                    ⏳
                  </motion.div>
                  A Gerar...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download Excel
                </>
              )}
            </Button>
          </motion.div>
        </div>
      )}
    </motion.div>
  )

  // Render step content
  const renderStepContent = () => {
    return (
      <div className="w-full h-full overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="h-full w-full absolute inset-0 overflow-hidden"
          >
            {renderStepSwitch()}
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  const renderStepSwitch = () => {
    switch (currentStep) {
      case 'inicio':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm h-full flex flex-col">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="p-3 bg-blue-100 rounded-xl"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <User className="h-6 w-6 text-blue-600" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-2xl text-gray-900">Bem-vindo ao Assistente de Viagens</CardTitle>
                      <p className="text-sm text-gray-600">Vamos configurar a sua viagem corporativa passo a passo</p>
                    </div>
                  </div>
                </CardHeader>
              </motion.div>
              <CardContent className="p-6">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'primeiro_nome', label: 'Primeiro Nome *', value: formData.colaborador.primeiro_nome, required: true },
                      { key: 'apelido', label: 'Apelido (último nome) *', value: formData.colaborador.apelido, required: true },
                      { key: 'num_colaborador', label: 'Nº Colaborador *', value: formData.colaborador.num_colaborador, required: true },
                      { key: 'direcao', label: 'Direção *', value: formData.colaborador.direcao, required: true },
                      { key: 'centro_custo', label: 'Centro Custo *', value: formData.colaborador.centro_custo, required: true },
                      { key: 'bi_cc', label: 'BI/Cartão Cidadão *', value: formData.colaborador.bi_cc, required: true },
                      { key: 'nif', label: 'NIF', value: formData.colaborador.nif, required: false },
                      { key: 'contacto', label: 'Contacto', value: formData.colaborador.contacto, required: false }
                    ].map((field, index) => (
                      <motion.div
                        key={field.key}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                        className="space-y-2"
                      >
                        <Label className={`text-sm font-medium ${field.required ? 'text-gray-900' : 'text-gray-700'}`}>
                          {field.label}
                        </Label>
                        <motion.div
                          whileFocus={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Input
                            value={field.value}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              colaborador: { ...prev.colaborador, [field.key]: e.target.value }
                            }))}
                            className={`bg-white/70 transition-all duration-200 focus:bg-white ${
                              field.required && !field.value ? 'border-red-300 focus:border-red-500' : ''
                            }`}
                            placeholder={field.required ? 'Campo obrigatório' : 'Opcional'}
                            required={field.required}
                          />
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                    className="space-y-3"
                  >
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        ✨ Os seus dados são guardados automaticamente e serão utilizados em futuras viagens.
                      </p>
                    </div>
                    {!isStepCompleted('inicio') && (
                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-sm text-amber-700">
                          ⚠️ Preencha todos os campos obrigatórios (*) para continuar.
                        </p>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )

      case 'motivo':
        return (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm h-full flex flex-col">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <CardHeader className="pb-4 bg-gradient-to-r from-amber-50 to-orange-50">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="p-3 bg-amber-100 rounded-xl"
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <FileText className="h-6 w-6 text-amber-600" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-2xl text-gray-900">Motivo da Viagem</CardTitle>
                      <p className="text-sm text-gray-600">Descreva brevemente o objetivo da sua viagem</p>
                    </div>
                  </div>
                </CardHeader>
              </motion.div>
              <CardContent className="p-6">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Motivo</Label>
                    <motion.div
                      whileFocus={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Input
                        value={formData.motivoViagem}
                        onChange={(e) => setFormData(prev => ({ ...prev, motivoViagem: e.target.value }))}
                        placeholder="Ex: Hackathon de dia 16, 18 e 19"
                        className="bg-white/70 text-lg p-4 transition-all duration-200 focus:bg-white"
                      />
                    </motion.div>
                    <p className="text-xs text-gray-500">
                      💡 Apenas o motivo (ex: "Reunião com cliente", "Formação técnica", "Conferência")
                    </p>
                  </div>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6"
                  >
                    {[
                      { emoji: '📊', text: 'Reunião com cliente' },
                      { emoji: '🎓', text: 'Formação técnica' },
                      { emoji: '🎤', text: 'Conferência' },
                      { emoji: '🔧', text: 'Workshop' },
                      { emoji: '💻', text: 'Hackathon' },
                      { emoji: '🏢', text: 'Evento corporativo' }
                    ].map((option, index) => (
                      <motion.div
                        key={option.text}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="outline"
                          onClick={() => setFormData(prev => ({ ...prev, motivoViagem: option.text }))}
                          className="text-left justify-start h-auto p-3 transition-all duration-200 hover:bg-amber-50"
                        >
                          {option.emoji} {option.text}
                        </Button>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )

      case 'transporte':
        return (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm h-full flex flex-col">
            <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Train className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-gray-900">Precisa de Transporte?</CardTitle>
                  <p className="text-xs text-gray-600">Selecione o tipo de transporte necessário</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col min-h-0">
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="grid grid-cols-2 gap-3 mb-4 mt-4 p-1">
                  <Card
                    className={`cursor-pointer transition-all duration-200 ${
                      !formData.tem_transporte ? 'ring-2 ring-red-500 bg-red-50' : 'hover:shadow-md'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, tem_transporte: false, tipo_transporte: 'nenhum' }))}
                  >
                    <CardContent className="p-3 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-2 bg-red-100 rounded-full">
                          <X className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">Não preciso</h3>
                          <p className="text-xs text-gray-600">Transporte próprio</p>
                        </div>
                        {!formData.tem_transporte && (
                          <Badge className="bg-red-100 text-red-700 text-xs">Selecionado</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-all duration-200 ${
                      formData.tem_transporte && formData.tipo_transporte === 'comboio' ? 'ring-2 ring-green-500 bg-green-50' : 'hover:shadow-md'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, tem_transporte: true, tipo_transporte: 'comboio' }))}
                  >
                    <CardContent className="p-3 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-2 bg-green-100 rounded-full">
                          <Train className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">Comboio</h3>
                          <p className="text-xs text-gray-600">36€ ida | 72€ volta</p>
                        </div>
                        {formData.tem_transporte && formData.tipo_transporte === 'comboio' && (
                          <Badge className="bg-green-100 text-green-700 text-xs">Selecionado</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 p-1">
                  <Card
                    className={`cursor-pointer transition-all duration-200 ${
                      formData.tem_transporte && formData.tipo_transporte === 'aviao' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, tem_transporte: true, tipo_transporte: 'aviao' }))}
                  >
                    <CardContent className="p-3 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Plane className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">Avião</h3>
                          <p className="text-xs text-gray-600">A definir</p>
                        </div>
                        {formData.tem_transporte && formData.tipo_transporte === 'aviao' && (
                          <Badge className="bg-blue-100 text-blue-700 text-xs">Selecionado</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-all duration-200 ${
                      formData.tem_transporte && formData.tipo_transporte === 'carro' ? 'ring-2 ring-orange-500 bg-orange-50' : 'hover:shadow-md'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, tem_transporte: true, tipo_transporte: 'carro' }))}
                  >
                    <CardContent className="p-3 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-2 bg-orange-100 rounded-full">
                          <Car className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">Carro/Aluguer</h3>
                          <p className="text-xs text-gray-600">A definir</p>
                        </div>
                        {formData.tem_transporte && formData.tipo_transporte === 'carro' && (
                          <Badge className="bg-orange-100 text-orange-700 text-xs">Selecionado</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

              </div>
            </CardContent>
          </Card>
        )

      case 'comboio_detalhes':
        return (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm h-full flex flex-col">
            <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Train className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-gray-900">Detalhes da Viagem de Comboio</CardTitle>
                  <p className="text-xs text-gray-600">Configure os detalhes da sua viagem</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto space-y-4">
                {/* Toggle para viagem de regresso */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🔄</span>
                    <div>
                      <h3 className="font-medium text-gray-800">Viagem de Regresso</h3>
                      <p className="text-xs text-gray-600">Incluir bilhete de volta</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-green-600 font-bold">+36€</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="toggle-regresso"
                        checked={formData.tem_regresso}
                        onChange={(e) => setFormData(prev => ({ ...prev, tem_regresso: e.target.checked }))}
                        className="sr-only"
                      />
                      <div
                        className={`w-12 h-6 rounded-full cursor-pointer transition-colors duration-200 ${
                          formData.tem_regresso ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, tem_regresso: !prev.tem_regresso }))}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 mt-0.5 ml-0.5 ${
                            formData.tem_regresso ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Percurso - sempre visível */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="p-3 bg-white rounded-lg border border-green-200"
                >
                  <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Train className="h-4 w-4 text-green-600" />
                    Percurso da Viagem
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-gray-600">De onde parte?</Label>
                      <Input
                        value={formData.comboio_ida.local_partida}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          comboio_ida: { ...prev.comboio_ida, local_partida: e.target.value },
                          comboio_regresso: { ...prev.comboio_regresso, local_chegada: e.target.value }
                        }))}
                        placeholder="Porto Campanha"
                        className="text-sm h-9 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Para onde vai?</Label>
                      <Input
                        value={formData.comboio_ida.local_chegada}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          comboio_ida: { ...prev.comboio_ida, local_chegada: e.target.value },
                          comboio_regresso: { ...prev.comboio_regresso, local_partida: e.target.value }
                        }))}
                        placeholder="Lisboa Oriente"
                        className="text-sm h-9 mt-1"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Boxes de viagem - ida sempre visível, volta aparece se selecionado */}
                <div className={`grid gap-4 transition-all duration-300 ${formData.tem_regresso ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {/* Box de Ida */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="p-4 bg-white rounded-lg border border-green-200"
                  >
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold text-sm">→</span>
                      </div>
                      Viagem de Ida
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-600">Data de Partida</Label>
                        <DatePicker
                          date={formData.comboio_ida.data ? new Date(formData.comboio_ida.data) : undefined}
                          onSelect={(date) => setFormData(prev => ({
                            ...prev,
                            comboio_ida: { ...prev.comboio_ida, data: date ? date.toISOString().split('T')[0] : '' }
                          }))}
                          placeholder="Selecionar data"
                          className="text-sm h-9 mt-1 w-full"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Hora de Partida</Label>
                        <TimePicker
                          value={formData.comboio_ida.hora}
                          onSelect={(time) => setFormData(prev => ({
                            ...prev,
                            comboio_ida: { ...prev.comboio_ida, hora: time }
                          }))}
                          placeholder="Selecionar hora"
                          className="text-sm h-9 mt-1 w-full"
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Box de Volta - aparece quando selecionado */}
                  <AnimatePresence>
                    {formData.tem_regresso && (
                      <motion.div
                        initial={{ opacity: 0, x: 20, width: 0 }}
                        animate={{ opacity: 1, x: 0, width: 'auto' }}
                        exit={{ opacity: 0, x: 20, width: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 bg-white rounded-lg border border-blue-200"
                      >
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-sm">←</span>
                          </div>
                          Viagem de Volta
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs text-gray-600">Data de Regresso</Label>
                            <DatePicker
                              date={formData.comboio_regresso.data ? new Date(formData.comboio_regresso.data) : undefined}
                              onSelect={(date) => setFormData(prev => ({
                                ...prev,
                                comboio_regresso: { ...prev.comboio_regresso, data: date ? date.toISOString().split('T')[0] : '' }
                              }))}
                              placeholder="Selecionar data"
                              className="text-sm h-9 mt-1 w-full"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-gray-600">Hora de Partida</Label>
                            <TimePicker
                              value={formData.comboio_regresso.hora}
                              onSelect={(time) => setFormData(prev => ({
                                ...prev,
                                comboio_regresso: { ...prev.comboio_regresso, hora: time }
                              }))}
                              placeholder="Selecionar hora"
                              className="text-sm h-9 mt-1 w-full"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Resumo total */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-200 rounded-full">
                        <Euro className="h-5 w-5 text-green-700" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-800">
                          Total da Viagem
                        </h3>
                        <p className="text-sm text-green-600">
                          {formData.tem_regresso ? 'Ida + Volta' : 'Apenas Ida'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-700">
                        {formData.tem_regresso ? '72€' : '36€'}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        )

      case 'hotel':
        return (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm h-full flex flex-col">
            <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Hotel className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-gray-900">Precisa de Alojamento?</CardTitle>
                  <p className="text-sm text-gray-600">Selecione se necessita de reserva de hotel</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card 
                  className={`cursor-pointer transition-all duration-200 ${
                    !formData.tem_hotel ? 'ring-2 ring-red-500 bg-red-50' : 'hover:shadow-md'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, tem_hotel: false }))}
                >
                  <CardContent className="p-6 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-red-100 rounded-full">
                        <X className="h-8 w-8 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Não preciso</h3>
                        <p className="text-sm text-gray-600">Viagem de um dia ou já tenho alojamento</p>
                      </div>
                      {!formData.tem_hotel && (
                        <Badge className="bg-red-100 text-red-700">Selecionado</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all duration-200 ${
                    formData.tem_hotel ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:shadow-md'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, tem_hotel: true }))}
                >
                  <CardContent className="p-6 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-purple-100 rounded-full">
                        <Hotel className="h-8 w-8 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Sim, preciso</h3>
                        <p className="text-sm text-gray-600">83,30€ + 4€ taxa por noite</p>
                      </div>
                      {formData.tem_hotel && (
                        <Badge className="bg-purple-100 text-purple-700">Selecionado</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {formData.tem_hotel && (
                <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Cidade/Destino</Label>
                      <Input
                        value={formData.alojamento.cidade}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          alojamento: { ...prev.alojamento, cidade: e.target.value }
                        }))}
                        placeholder="Lisboa"
                        className="bg-white/70"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Hotel (opcional)</Label>
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Data de Chegada</Label>
                      <DatePicker
                        date={formData.alojamento.data_chegada ? new Date(formData.alojamento.data_chegada) : undefined}
                        onSelect={(date) => setFormData(prev => ({
                          ...prev,
                          alojamento: { ...prev.alojamento, data_chegada: date ? date.toISOString().split('T')[0] : '' }
                        }))}
                        placeholder="Selecionar chegada"
                        className="bg-white/70"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Data de Partida</Label>
                      <DatePicker
                        date={formData.alojamento.data_partida ? new Date(formData.alojamento.data_partida) : undefined}
                        onSelect={(date) => setFormData(prev => ({
                          ...prev,
                          alojamento: { ...prev.alojamento, data_partida: date ? date.toISOString().split('T')[0] : '' }
                        }))}
                        placeholder="Selecionar partida"
                        className="bg-white/70"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Tipo de Quarto</Label>
                      <Select
                        value={formData.alojamento.tipo_quarto}
                        onValueChange={(value) => setFormData(prev => ({
                          ...prev,
                          alojamento: { ...prev.alojamento, tipo_quarto: value }
                        }))}
                      >
                        <SelectTrigger className="bg-white/70">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1PAX">1PAX</SelectItem>
                          <SelectItem value="2PAX">2PAX</SelectItem>
                          <SelectItem value="Suite">Suite</SelectItem>
                          <SelectItem value="Executivo">Executivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {formData.alojamento.data_chegada && formData.alojamento.data_partida && (
                    <div className="p-3 bg-purple-100 rounded-lg border border-purple-300">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-purple-700">
                          {calculateNights(formData.alojamento.data_chegada, formData.alojamento.data_partida)} noites × 87,30€
                        </span>
                        <span className="text-lg font-bold text-purple-700">
                          {(calculateNights(formData.alojamento.data_chegada, formData.alojamento.data_partida) * 87.30).toFixed(2)}€
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )

      case 'datas':
        return (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm h-full flex flex-col">
            <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-cyan-50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Check className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-gray-900">Resumo das Datas</CardTitle>
                  <p className="text-sm text-gray-600">Configuração concluída nos passos anteriores</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {formData.tem_hotel && (formData.alojamento.data_chegada || formData.alojamento.data_partida) && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
                      <Hotel className="h-5 w-5 text-purple-600" />
                      Alojamento
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Chegada:</span>
                        <p className="font-medium">
                          {formData.alojamento.data_chegada ? new Date(formData.alojamento.data_chegada).toLocaleDateString('pt-PT') : 'Por definir'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Partida:</span>
                        <p className="font-medium">
                          {formData.alojamento.data_partida ? new Date(formData.alojamento.data_partida).toLocaleDateString('pt-PT') : 'Por definir'}
                        </p>
                      </div>
                    </div>
                    {formData.alojamento.data_chegada && formData.alojamento.data_partida && (
                      <div className="mt-3 p-2 bg-purple-100 rounded border">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-purple-700">
                            {calculateNights(formData.alojamento.data_chegada, formData.alojamento.data_partida)} noites × 87,30€
                          </span>
                          <span className="font-bold text-purple-700">
                            {(calculateNights(formData.alojamento.data_chegada, formData.alojamento.data_partida) * 87.30).toFixed(2)}€
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {formData.tem_transporte && formData.tipo_transporte === 'comboio' && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
                      <Train className="h-5 w-5 text-green-600" />
                      Comboio
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ida ({formData.comboio_ida.local_partida} → {formData.comboio_ida.local_chegada}):</span>
                        <span className="font-medium">
                          {formData.comboio_ida.data ? new Date(formData.comboio_ida.data).toLocaleDateString('pt-PT') : 'Por definir'}
                          {formData.comboio_ida.hora && ` às ${formData.comboio_ida.hora}`}
                        </span>
                      </div>
                      {formData.tem_regresso && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Regresso ({formData.comboio_regresso.local_partida} → {formData.comboio_regresso.local_chegada}):</span>
                          <span className="font-medium">
                            {formData.comboio_regresso.data ? new Date(formData.comboio_regresso.data).toLocaleDateString('pt-PT') : 'Por definir'}
                            {formData.comboio_regresso.hora && ` às ${formData.comboio_regresso.hora}`}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 p-2 bg-green-100 rounded border">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-green-700">
                          Comboio {formData.tem_regresso ? '(ida e volta)' : '(apenas ida)'}
                        </span>
                        <span className="font-bold text-green-700">
                          {formData.tem_regresso ? '72€' : '36€'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {!formData.tem_hotel && (!formData.tem_transporte || formData.tipo_transporte !== 'comboio') && (
                  <div className="text-center p-8">
                    <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4">
                      <Check className="h-8 w-8 text-gray-600 mx-auto mt-2" />
                    </div>
                    <p className="text-gray-600">Não há datas configuradas para esta viagem.</p>
                    <p className="text-xs text-gray-500 mt-2">As datas são configuradas nos passos de Transporte e Alojamento.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )

      case 'preview':
        const costs = calculateCosts()
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Resumo da Viagem */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm h-full flex flex-col">
              <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">Resumo da Viagem</CardTitle>
                    <p className="text-sm text-gray-600">Configuração finalizada</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Colaborador</h4>
                    <p className="text-sm text-gray-600">
                      {formData.colaborador.primeiro_nome} {formData.colaborador.apelido} ({formData.colaborador.num_colaborador})
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Motivo</h4>
                    <p className="text-sm text-gray-600">{formData.motivoViagem}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Transporte</h4>
                    {formData.tem_transporte ? (
                      <div className="text-sm text-gray-600">
                        <p>{formData.tipo_transporte === 'comboio' ? '🚅 Comboio' : 
                             formData.tipo_transporte === 'aviao' ? '✈️ Avião' : 
                             '🚗 Carro/Aluguer'}</p>
                        {formData.tipo_transporte === 'comboio' && (
                          <p>{formData.comboio_ida.local_partida} → {formData.comboio_ida.local_chegada}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">❌ Não necessário</p>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Alojamento</h4>
                    {formData.tem_hotel ? (
                      <div className="text-sm text-gray-600">
                        <p>🏨 {formData.alojamento.cidade}</p>
                        {formData.alojamento.hotel && <p>{formData.alojamento.hotel}</p>}
                        {formData.alojamento.data_chegada && formData.alojamento.data_partida && (
                          <p>{new Date(formData.alojamento.data_chegada).toLocaleDateString('pt-PT')} → {new Date(formData.alojamento.data_partida).toLocaleDateString('pt-PT')}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">❌ Não necessário</p>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Custos</h4>
                    <div className="space-y-2 text-sm">
                      {costs.noites > 0 && (
                        <>
                          <div className="flex justify-between">
                            <span>Estadia ({costs.noites} noites)</span>
                            <span>{costs.estadiaCusto.toFixed(2)}€</span>
                          </div>
                          <div className="flex justify-between">
                            <span>City Tax</span>
                            <span>{costs.cityTaxCusto.toFixed(2)}€</span>
                          </div>
                        </>
                      )}
                      {costs.transporteCusto > 0 && (
                        <div className="flex justify-between">
                          <span>Transporte</span>
                          <span>{costs.transporteCusto.toFixed(2)}€</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>{costs.totalCusto.toFixed(2)}€</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview do Email */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm h-full flex flex-col">
              <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Mail className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">Preview do Email</CardTitle>
                    <p className="text-sm text-gray-600">Pedido de autorização</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Assunto:</Label>
                    <div className="p-3 bg-purple-50 rounded border text-sm font-medium">
                      Pedido de Viagem
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Conteúdo:</Label>
                    <Textarea
                      value={emailContent}
                      onChange={(e) => setEmailContent(e.target.value)}
                      className="min-h-[300px] bg-white/70 text-sm"
                      readOnly
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  // Se não estiver autenticado, mostrar tela de login
  if (!isAuthenticated) {
    return <Auth onAuthenticated={handleAuthenticated} />
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col overflow-hidden w-full">
      <Header title="Assistente de Viagens Corporativas" />

      <main className="flex-1 container mx-auto px-4 py-4 max-w-6xl flex flex-col overflow-hidden min-h-0 w-full">
        {/* Hero Section - Compact */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-4"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2"
          >
            ✈️ Pedido de Viagem Simplificado
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
            className="text-sm text-gray-600 max-w-2xl mx-auto"
          >
            Configure a sua viagem corporativa passo a passo.
          </motion.p>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="mb-6 border-red-200 bg-red-50/50">
                <CardContent className="pt-6">
                  <motion.p
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="text-red-600 flex items-center gap-2"
                  >
                    ❌ {error}
                  </motion.p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Bar */}
        {renderProgressBar()}

        {/* Step Content - Flexible container */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          {renderNavigation()}
        </div>

        {/* Step Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex justify-center mt-2"
        >
          <div className="flex space-x-2">
            {['inicio', 'motivo', 'transporte', 'comboio_detalhes', 'hotel', 'datas', 'preview']
              .filter(step => step !== 'comboio_detalhes' || formData.tipo_transporte === 'comboio')
              .map((step, index) => (
              <motion.button
                key={step}
                onClick={() => goToStep(step as QuizStep)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                  currentStep === step
                    ? 'bg-blue-600'
                    : isStepCompleted(step as QuizStep)
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                }`}
                title={`Passo ${index + 1}`}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                animate={{
                  scale: currentStep === step ? 1.25 : 1
                }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            ))}
          </div>
        </motion.div>
      </main>
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}