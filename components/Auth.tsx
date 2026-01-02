'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Lock, Shield, AlertTriangle, CheckCircle, X } from 'lucide-react'
import meoLogo from "@/images/meo.png"

interface AuthProps {
  onAuthenticated: () => void
}

// Função para encriptar/hash o código (simples para demo)
const hashCode = (code: string): string => {
  let hash = 0
  for (let i = 0; i < code.length; i++) {
    const char = code.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString()
}

// Código correto encriptado (1337 -> hash)
const CORRECT_CODE_HASH = hashCode('1337')
const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 30000 // 30 segundos

export default function Auth({ onAuthenticated }: AuthProps) {
  const [inputCode, setInputCode] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutTimer, setLockoutTimer] = useState(0)
  const [showError, setShowError] = useState(false)
  const [isValidating, setIsValidating] = useState(false)

  // Carregar tentativas e estado de bloqueio do localStorage
  useEffect(() => {
    const savedAttempts = localStorage.getItem('auth_attempts')
    const savedLockout = localStorage.getItem('auth_lockout')

    if (savedAttempts) {
      setAttempts(parseInt(savedAttempts))
    }

    if (savedLockout) {
      const lockoutTime = parseInt(savedLockout)
      const now = Date.now()
      if (now < lockoutTime) {
        setIsLocked(true)
        setLockoutTimer(Math.ceil((lockoutTime - now) / 1000))
      } else {
        localStorage.removeItem('auth_lockout')
        localStorage.removeItem('auth_attempts')
      }
    }
  }, [])

  // Timer para countdown do bloqueio
  useEffect(() => {
    if (isLocked && lockoutTimer > 0) {
      const timer = setTimeout(() => {
        setLockoutTimer(prev => {
          if (prev <= 1) {
            setIsLocked(false)
            setAttempts(0)
            localStorage.removeItem('auth_lockout')
            localStorage.removeItem('auth_attempts')
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isLocked, lockoutTimer])


  const handleSubmit = async () => {
    if (isLocked || inputCode.length !== 4) return

    setIsValidating(true)

    // Simular delay de validação
    await new Promise(resolve => setTimeout(resolve, 1000))

    const inputHash = hashCode(inputCode)

    if (inputHash === CORRECT_CODE_HASH) {
      // Código correto - limpar tentativas e autenticar
      localStorage.removeItem('auth_attempts')
      localStorage.removeItem('auth_lockout')
      setIsValidating(false)
      onAuthenticated()
    } else {
      // Código incorreto
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      localStorage.setItem('auth_attempts', newAttempts.toString())

      if (newAttempts >= MAX_ATTEMPTS) {
        // Bloquear acesso
        const lockoutTime = Date.now() + LOCKOUT_DURATION
        localStorage.setItem('auth_lockout', lockoutTime.toString())
        setIsLocked(true)
        setLockoutTimer(LOCKOUT_DURATION / 1000)
      }

      setShowError(true)
      setInputCode('')
      setIsValidating(false)

      // Remover erro após 3 segundos
      setTimeout(() => setShowError(false), 3000)
    }
  }


  const renderCodeInputs = () => {
    return (
      <div className="flex justify-center gap-3 mb-6">
        {Array.from({ length: 4 }, (_, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <Input
              type="text"
              maxLength={1}
              value={inputCode[index] ? '*' : ''}
              onChange={(e) => {
                const value = e.target.value
                if (value && value !== '*') {
                  // Usuário digitou um número
                  const numericValue = value.replace(/\D/g, '').slice(-1)
                  if (numericValue) {
                    const newCode = inputCode.split('')
                    newCode[index] = numericValue
                    const newCodeString = newCode.join('')
                    setInputCode(newCodeString)
                    setShowError(false)

                    // Auto-focus no próximo input
                    if (index < 3) {
                      const nextInput = document.getElementById(`code-input-${index + 1}`)
                      nextInput?.focus()
                    }
                  }
                } else if (!value) {
                  // Campo foi limpo
                  const newCode = inputCode.split('')
                  newCode[index] = ''
                  const newCodeString = newCode.join('')
                  setInputCode(newCodeString)
                  setShowError(false)
                }
              }}
              onKeyDown={(e) => {
                // Backspace - voltar para input anterior
                if (e.key === 'Backspace' && !inputCode[index] && index > 0) {
                  const prevInput = document.getElementById(`code-input-${index - 1}`)
                  prevInput?.focus()
                }
                // Enter - submeter se código completo
                if (e.key === 'Enter' && inputCode.length === 4) {
                  handleSubmit()
                }
              }}
              id={`code-input-${index}`}
              disabled={isLocked}
              className="w-14 h-14 text-center text-2xl font-bold border-2 rounded-lg bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-300"
              autoFocus={index === 0}
            />
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex justify-center mb-4"
            >
              <img
                src={meoLogo.src}
                alt="logo"
                className="h-12 w-auto"
              />
            </motion.div>

            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                <Lock className="h-6 w-6 inline mr-2" />
                Acesso Seguro
              </CardTitle>
              <p className="text-sm text-gray-600">
                Introduza o código de 4 dígitos para aceder à aplicação
              </p>
            </motion.div>
          </CardHeader>

          <CardContent className="pb-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {/* Estado de bloqueio */}
              <AnimatePresence>
                {isLocked && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div className="flex items-center justify-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="font-semibold">Acesso Bloqueado</span>
                    </div>
                    <p className="text-sm text-red-600 text-center mt-2">
                      Muitas tentativas falhadas. Tente novamente em {lockoutTimer}s
                    </p>
                    <div className="w-full bg-red-200 rounded-full h-2 mt-3">
                      <motion.div
                        className="bg-red-500 h-2 rounded-full"
                        initial={{ width: "100%" }}
                        animate={{ width: `${(lockoutTimer / 30) * 100}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Erro de código incorreto */}
              <AnimatePresence>
                {showError && !isLocked && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <p className="text-sm text-red-600 text-center">
                      ❌ Código incorreto ({MAX_ATTEMPTS - attempts} tentativas restantes)
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Inputs individuais do código */}
              {renderCodeInputs()}

              <p className="text-xs text-gray-500 text-center mb-6">
                💡 Digite o código de 4 dígitos e pressione Enter
              </p>

              {/* Botão de submissão */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleSubmit}
                  disabled={isLocked || inputCode.length !== 4 || isValidating}
                  className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
                >
                  {isValidating ? (
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Shield className="h-5 w-5" />
                      </motion.div>
                      Validando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Entrar
                    </div>
                  )}
                </Button>
              </motion.div>

              {/* Indicador de tentativas */}
              <div className="mt-4 flex justify-center">
                <Badge variant="outline" className="text-xs">
                  {attempts}/{MAX_ATTEMPTS} tentativas
                </Badge>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}