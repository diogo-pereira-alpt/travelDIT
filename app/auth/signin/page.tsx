'use client'

import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, Chrome } from 'lucide-react'
import meoLogo from "@/images/meo.png"

export default function SignIn() {
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
                Assistente de Viagens
              </CardTitle>
              <p className="text-sm text-gray-600">
                Inicie sessão para aceder à aplicação
              </p>
            </motion.div>
          </CardHeader>

          <CardContent className="pb-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="space-y-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => signIn('google', { callbackUrl: '/' })}
                    className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center gap-3"
                  >
                    <Chrome className="h-5 w-5" />
                    Entrar com Google
                  </Button>
                </motion.div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700 text-center">
                    🔒 Esta aplicação utiliza autenticação segura via Google para proteger os seus dados.
                  </p>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-xs text-amber-700 text-center">
                    ⚠️ Apenas utilizadores autorizados podem aceder à aplicação.
                  </p>
                </div>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
