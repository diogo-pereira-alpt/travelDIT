# TravelDIT - Assistente de Viagens Corporativas

Uma aplicação Next.js moderna para gerir e automatizar pedidos de viagens corporativas com autenticação segura e integração com ferramentas da empresa.

## 🌟 Funcionalidades

- ✅ **Autenticação Segura**: Login com Google OAuth via NextAuth
- ✅ **Interface Responsiva**: Design otimizado para desktop, tablet e mobile
- ✅ **Horários Integrados**: Sugestões de horários do Alfa Pendular (Porto-Lisboa)
- ✅ **Geração Automática**: Criação de emails e ficheiros Excel
- ✅ **Proteção de Dados**: Dados sensíveis armazenados em variáveis de ambiente
- ✅ **Font Altice**: Interface com tipografia corporativa MEO/Altice
- ✅ **Atalhos de Teclado**: Navegação rápida com teclas de atalho

## 🚀 Getting Started

### Pré-requisitos

- Node.js 18+ 
- Conta Google para OAuth (para produção)

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/diogo-pereira-alpt/travelDIT.git
cd travelDIT
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

Edite `.env.local` com as suas configurações (ver [DEPLOYMENT.md](DEPLOYMENT.md) para detalhes).

4. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu browser.

## 🔒 Autenticação e Segurança

A aplicação utiliza **NextAuth.js** com Google OAuth para autenticação segura:

- **Login com Google**: Utilizadores autenticam-se através das suas contas Google
- **Controlo de Acesso**: Apenas emails autorizados podem aceder (configurável via `ALLOWED_EMAILS`)
- **Dados Protegidos**: Informações sensíveis armazenadas em variáveis de ambiente
- **Sessões Seguras**: Gestão de sessões com tokens encriptados

![Tela de Login](https://github.com/user-attachments/assets/a3e8a3a6-d604-449f-9ff1-b66fade6c518)

## 📋 Funcionalidades Principais

### 1. Gestão de Viagens
- Configuração passo-a-passo intuitiva
- Suporte para comboio, avião, carro e alojamento
- Cálculo automático de custos

### 2. Horários de Comboio
- Horários integrados do Alfa Pendular (Porto ↔ Lisboa)
- Seleção rápida de horários disponíveis
- Preço corporativo fixo (75€ ida/volta, 37,50€ ida)

### 3. Geração Automática
- **Email**: Template otimizado sem assinaturas redundantes
- **Excel**: Ficheiro formatado para submissão

### 4. UI Responsiva
- Design adaptado para todos os dispositivos
- Botões otimizados sem problemas de overflow
- Navegação fluida em dispositivos móveis

## 🎨 Melhorias de UI/UX

- **Font Corporativa**: Altice/MEO Text Extended em toda a aplicação
- **Hover States**: Botões desativados não mostram hover
- **Responsive Layout**: Layouts flexíveis para mobile e desktop
- **Loading States**: Feedback visual durante autenticação
- **Keyboard Shortcuts**: Atalhos para navegação rápida

## 📱 Responsividade

A aplicação adapta-se automaticamente a diferentes tamanhos de ecrã:
- **Desktop**: Layout completo com todas as funcionalidades
- **Tablet**: Layout otimizado com botões adaptados
- **Mobile**: Interface simplificada com navegação vertical

## 🚀 Deployment

Para instruções detalhadas de deployment em Vercel, Netlify ou outros providers, consulte [DEPLOYMENT.md](DEPLOYMENT.md).

### Deploy Rápido na Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/diogo-pereira-alpt/travelDIT)

**Importante**: Configure todas as variáveis de ambiente necessárias no dashboard da Vercel.

## 🛠️ Tecnologias

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18, Tailwind CSS, Framer Motion
- **Autenticação**: NextAuth.js
- **Componentes**: Radix UI
- **Geração Excel**: ExcelJS
- **Tipos**: TypeScript

## 📝 Variáveis de Ambiente

Consulte `.env.example` para a lista completa de variáveis necessárias:

- `NEXTAUTH_URL`: URL da aplicação
- `NEXTAUTH_SECRET`: Secret para NextAuth
- `GOOGLE_CLIENT_ID`: Client ID do Google OAuth
- `GOOGLE_CLIENT_SECRET`: Client Secret do Google OAuth
- `ALLOWED_EMAILS`: Emails autorizados (separados por vírgula)
- `NEXT_PUBLIC_USER_*`: Dados do utilizador padrão

## 🔐 Segurança

- ✅ Autenticação via Google OAuth
- ✅ Controlo de acesso baseado em email
- ✅ Dados sensíveis em variáveis de ambiente
- ✅ Sessões encriptadas com NextAuth
- ✅ Sem dados hardcoded no código

**Nota sobre Dados do Utilizador**: Esta aplicação é desenhada para uso pessoal/single-user. Os dados do utilizador (NIF, BI, etc.) são carregados via `NEXT_PUBLIC_` prefix para facilitar a inicialização do formulário no cliente. Para uma aplicação multi-utilizador, estes dados devem ser servidos via API server-side. A segurança é garantida através de:
- Acesso restrito via Google OAuth
- Whitelist de emails autorizados
- Dados não hardcoded no repositório

## 🤝 Contribuir

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para a sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit as suas alterações (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e destinado a uso interno da empresa.

## 📞 Suporte

Para questões ou suporte, contacte a equipa de desenvolvimento.

---

**Nota**: Esta aplicação requer configuração de Google OAuth para funcionar em produção. Consulte [DEPLOYMENT.md](DEPLOYMENT.md) para instruções detalhadas.
