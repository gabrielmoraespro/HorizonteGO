# HorizonteGo - TODO List

## Backend & Database
- [x] Schema de banco de dados com tabelas: countries, jobs, user_progress, documents, payment_status
- [x] Helpers de query no server/db.ts
- [x] Sistema de autenticação e controle de acesso baseado em pagamento
- [x] API tRPC para gerenciamento de vagas (CRUD admin + listagem usuário)
- [x] API tRPC para checklist de progresso por país
- [x] API tRPC para calculadora financeira
- [x] API tRPC para gerador de documentos (currículo, cover letter, email)
- [x] API tRPC para módulo de segurança antigolpe

## Integrações Externas
- [ ] Integração com API de câmbio (ExchangeRate API)
- [ ] Integração com Job Bank Canada API
- [ ] Integração com serviço de email (SendGrid/Brevo)
- [ ] Sistema de atualização diária de taxas de câmbio

## Sistema de Pagamento
- [x] Integração com Stripe para pagamento único
- [x] Controle de acesso baseado em status de pagamento
- [x] Página de checkout e confirmação

## Frontend - Landing Page
- [x] Design responsivo com cores suaves (azul, verde, neutros)
- [x] Seção hero com proposta de valor clara
- [x] Seção de benefícios da plataforma
- [x] Seção de como funciona (passo a passo)
- [x] Seção de depoimentos/confiança
- [x] Call-to-action para cadastro/pagamento
- [x] Footer com links úteis

## Frontend - Dashboard do Usuário
- [x] Layout de dashboard com navegação lateral
- [x] Painel de progresso visual (etapas: Preparação → Documentação → Aplicação → Entrevista → Aprovação → Embarque)
- [x] Acesso rápido às funcionalidades principais

## Frontend - Checklist Guiado
- [x] Seleção de país alvo (Noruega, Canadá)
- [x] Lista de tarefas marcáveis por etapa
- [x] Indicador de progresso visual
- [x] Dicas e orientações por etapa

## Frontend - Calculadora Financeira
- [x] Entrada de dados: salário esperado, custo de vida, despesas
- [x] Conversão automática de moedas (BRL ↔ CAD ↔ NOK)
- [x] Visualização de economia projetada
- [x] Comparação de cenários

## Frontend - Lista de Vagas Verificadas
- [x] Listagem de vagas com filtros (país, área, benefícios)
- [x] Detalhes da vaga (requisitos, salário, benefícios, link oficial)
- [x] Indicador de vagas verificadas manualmente
- [x] Sistema de favoritos

## Frontend - Gerador de Documentos
- [x] Formulário para dados pessoais e profissionais
- [x] Templates personalizáveis (currículo, cover letter, email)
- [x] Geração com IA (usando invokeLLM)
- [x] Download de documentos gerados

## Frontend - Módulo de Segurança
- [x] Lista de sinais de alerta (golpes comuns)
- [x] Checklist de verificação de vagas
- [x] Dicas de segurança por país
- [x] Links para recursos oficiais

## Painel Administrativo
- [x] CRUD de vagas (adicionar, editar, remover)
- [x] CRUD de conteúdo de guias por país
- [x] Visualização de usuários e status de pagamento
- [x] Dashboard com métricas básicas

## Testes & Qualidade
- [x] Testes vitest para rotas críticas (auth, payment, jobs)
- [x] Validação de integrações de API
- [x] Testes de geração de documentos
- [x] Testes de sistema de candidaturas
- [x] Testes de integração com Brevo

## Documentação
- [ ] README com instruções de setup
- [ ] Documentação de APIs tRPC
- [ ] Guia de uso para administradores

## Novas Funcionalidades Solicitadas

### Integrações com APIs Gratuitas
- [x] Integração com Job Bank Canada API para buscar vagas
- [x] Integração com ExchangeRate API para conversão de moedas
- [x] Integração com ESCO/O*NET para equivalência de profissões
- [ ] Atualização diária automática de taxas de câmbio

### Sistema de Planos
- [x] Criar 3 planos: Free, Starter, Pro
- [x] Definir limites e benefícios por plano
- [x] Atualizar schema do banco com campo de plano
- [x] Atualizar Stripe para suportar múltiplos planos
- [x] Implementar controle de acesso baseado em plano

### Upload de Currículo e Candidatura
- [x] Sistema de upload de currículo (PDF)
- [x] Armazenamento de currículos no S3
- [x] Sistema de candidatura direta para vagas
- [x] Limite de candidaturas por dia baseado no plano
- [x] Tracking de candidaturas enviadas

### Notificações por Email
- [x] Integração com SendGrid/Brevo
- [x] Email de confirmação de cadastro
- [x] Email de notificação de etapa concluída
- [x] Email de envio de documentos gerados
- [x] Email de confirmação de candidatura

### Módulo de Curadoria de Vagas
- [x] Interface admin para adicionar vagas manualmente
- [x] Campos para vagas espelhadas (site original, país, requisitos)
- [x] Sistema de verificação de vagas
- [ ] Scraper leve respeitando robots.txt (opcional - não implementado)

## Transformação para Produto Real (Produção)

### Dados Reais
- [x] Popular banco com vagas reais do Canadá (Job Bank Canada)
- [x] Popular banco com vagas reais da Noruega (NAV.NO, WorkInNorway)
- [x] Adicionar taxas de câmbio atuais no banco

### Interface do Usuário
- [x] Atualizar landing page com botões para /pricing
- [x] Atualizar Dashboard para mostrar plano atual
- [x] Adicionar banners de upgrade em páginas restritas
- [x] Implementar bloqueio visual em recursos pagos

### Sistema de Pagamento
- [x] Atualizar webhook do Stripe para gerenciar mudanças de plano
- [ ] Testar fluxo completo de pagamento (Starter e Pro)
- [x] Implementar atualização automática de plano após pagamento

### Controle de Acesso
- [x] Bloquear acesso a vagas para usuários free
- [x] Bloquear geração de documentos além do limite
- [x] Bloquear candidaturas para plano free
- [x] Mostrar mensagens claras de upgrade quando necessário

## Novas Funcionalidades - Integração de Scrapers e Melhorias

### Scrapers de Vagas
- [x] Analisar estrutura do site NAV.NO (arbeidsplassen.nav.no)
- [x] Implementar scraper diário para NAV.NO com detalhes completos das vagas
- [x] Analisar estrutura do site WorkInNorway.no (guia educacional, não tem vagas)
- [x] Analisar estrutura do site PickingJobs.com
- [x] Implementar scraper semanal para PickingJobs.com
- [x] Integrar lista de empresas LMIA do GitHub (Canadá)
- [x] Criar sistema de verificação de fraudes baseado no guia EURES
- [ ] Implementar cron job para executar scrapers diariamente
- [x] Armazenar vagas completas no banco (título, descrição, requisitos, salário, benefícios, link original)

### Busca de Equivalência de Profissões
- [x] Criar página de busca de profissões
- [x] Integrar API ESCO para busca de equivalências
- [x] Exibir resultados com título, setor, descrição e equivalentes internacionais
- [ ] Adicionar filtros por país/região (opcional)

### Atualização Automática de Câmbio
- [x] Criar script de atualização de taxas de câmbio
- [x] Configurar cron job para executar diariamente às 00:00 UTC
- [x] Atualizar tabela exchangeRates automaticamente
- [x] Adicionar log de atualizações

### Configuração do Stripe
- [x] Criar guia passo a passo de configuração do Stripe
- [x] Documentar como criar conta no Stripe
- [x] Documentar como configurar webhook /api/stripe/webhook
- [x] Documentar como obter API keys (test e production)
- [x] Documentar como ativar modo de produção

## Página de Perfil do Usuário

### Backend
- [x] Criar rota tRPC para atualizar nome do usuário
- [x] Criar rota tRPC para atualizar email do usuário
- [x] Criar rota tRPC para buscar histórico de candidaturas
- [x] Criar rota tRPC para buscar estatísticas do usuário

### Frontend
- [x] Criar página de perfil (/profile)
- [x] Seção de informações pessoais com edição (nome, email)
- [x] Seção de plano atual com botão de upgrade
- [x] Seção de estatísticas (candidaturas restantes, documentos gerados)
- [x] Seção de histórico de candidaturas
- [x] Seção de vagas salvas (favoritos)
- [x] Tornar botão de perfil no Dashboard clicável
- [x] Adicionar rota /profile no App.tsx

## Upload de Foto e Currículo

### Backend
- [x] Adicionar campos profilePhotoUrl e resumeUrl ao schema de users
- [x] Criar rota tRPC para upload de foto de perfil
- [x] Criar rota tRPC para remover foto de perfil
- [x] Criar rota tRPC para upload de currículo (PDF)
- [x] Criar rota tRPC para remover currículo

### Frontend
- [x] Adicionar seção de upload de foto na página de perfil
- [x] Implementar preview de foto antes do upload
- [x] Adicionar botão de remover foto
- [x] Exibir foto de perfil no header do Dashboard
- [x] Adicionar seção de upload de currículo na página de perfil
- [x] Mostrar status do currículo (enviado/não enviado)

## Clarificação de Limites por Plano

### Limites por Tier
- [ ] Free: 0 candidaturas/dia, 1 documento/mês, visualiza vagas
- [ ] Starter: 3 candidaturas/dia, 10 documentos/mês, upload de currículo
- [ ] Pro: 10 candidaturas/dia, documentos ilimitados, suporte prioritário

### Frontend
- [x] Atualizar página de Pricing com limites claros
- [x] Adicionar badges de limite em todas as páginas relevantes
- [x] Permitir usuários Free acessarem página de vagas
- [x] Bloquear botão de candidatura para usuários Free
- [x] Mostrar mensagem de upgrade ao tentar candidatar (Free)
- [ ] Atualizar Dashboard com indicadores de uso/limites

## Importação de Vagas e Scraper Automático

### Backend
- [x] Criar script de importação de vagas do arquivo JSON
- [x] Executar importação inicial de vagas
- [x] Converter scraper Python (scraper_noruega.py) para TypeScript
- [x] Integrar scraper ao sistema de cron jobs
- [x] Configurar execução automática diária do scraper

### Testes
- [x] Testar importação de vagas do JSON
- [x] Testar scraper convertido
- [x] Verificar vagas no banco de dados
- [ ] Verificar vagas aparecendo no site

## Atualização de Checklist com Links

- [x] Atualizar página de checklist com links externos
- [x] Adicionar botões elegantes para cada link
- [ ] Testar links e navegação

## Sistema de Visualização de Links no Checklist

### Backend
- [x] Adicionar campo 'viewedAt' ao schema de userProgress
- [x] Criar rota tRPC para marcar link como visualizado
- [x] Atualizar query de progresso para incluir status de visualização

### Frontend
- [x] Adicionar barra de progresso no topo do checklist
- [x] Marcar automaticamente como visualizado ao clicar em "Acessar"
- [x] Diferenciar visualmente itens visualizados vs. concluídos
- [x] Mostrar estatísticas (X/Y visualizados, X/Y concluídos)
- [x] Adicionar indicador visual no botão "Acessar" para links já visualizados

### Testes
- [x] Testar marcação automática de visualização
- [x] Testar cálculo de progresso

## Melhorias de Scraping e Filtros

- [x] Aumentar scraper de 5 para 50 vagas/dia
- [x] Adicionar campos de filtro ao schema (location, category, education, language, employmentType, remoteWork)
- [x] Atualizar rota tRPC de vagas com filtros avançados
- [x] Adicionar UI de filtros na página de vagas

## Automação do Scraper

- [x] Implementar paginação no scraper para buscar múltiplas páginas
- [x] Garantir coleta de mínimo 50 vagas por execução
- [x] Atualizar cron job para executar scraper diariamente
- [x] Criar documentação de configuração do cron job

## Conversão para Assinaturas Recorrentes Stripe

- [x] Criar tabela subscriptions no schema
- [x] Atualizar products.ts para preços recorrentes (recurring)
- [x] Atualizar payment.ts para mode: 'subscription'
- [x] Atualizar webhook para eventos de assinatura
- [x] Criar endpoint de Billing Portal
- [x] Atualizar frontend com botão "Gerenciar Assinatura"

## Configuração Final do Stripe e Notificações Brevo

- [ ] Criar produtos Starter e Pro no dashboard do Stripe com preços recorrentes
- [ ] Atualizar server/products.ts com priceIds reais
- [ ] Testar fluxo completo de assinatura (Free→Starter→Pro, cancelamento, falha)
- [x] Implementar notificações por email via Brevo para eventos de assinatura
- [ ] Testar envio de emails em todos os eventos (criação, renovação, cancelamento, falha)

## Finalização de Configuração Stripe e Emails

- [x] Atualizar server/products.ts com priceIds reais do Stripe
- [x] Melhorar templates HTML dos emails Brevo (logo, cores, botões CTA, footer)
- [x] Criar teste de envio de email (brevo-notifications.test.ts)

## Elevação do Frontend para Nível Profissional

- [x] Analisar estrutura de client/src/pages e identificar padrões
- [x] Criar/ajustar componentes compartilhados (PageHeader, EmptyState, LoadingSpinner, ErrorState, Section)
- [x] Refinar páginas principais (Home, Dashboard, Jobs, Pricing)
- [x] Refinar páginas secundárias (NotFound, PaymentSuccess, PaymentCancel)
- [x] Aplicar otimizações de performance (componentes reutilizáveis, estados consistentes)

## Design System Profissional SaaS

- [x] Diagnóstico visual das páginas (hierarquia, tipografia, cores, feedback)
- [x] Definir design system mínimo (tipografia, cores, espaçamentos)
- [x] Criar arquivo de tokens (design-system.ts)
- [x] Adicionar escala tipográfica ao index.css

## Aplicação de UI/UX Design Profissional

- [x] Refinar App.tsx com lazy loading e Toaster estilizado
- [x] Páginas já utilizam shadcn/ui + Tailwind CSS
- [x] Design system aplicado (tipografia, cores, espaçamentos)
- [x] Componentes reutilizáveis criados (PageHeader, EmptyState, LoadingSpinner, ErrorState)
- [x] Responsividade mobile-first implementada
- [x] Acessibilidade básica (semântica HTML, contraste, foco visível)

## Redesign UI/UX - Tema Escuro Profissional

- [x] Criar paleta de cores escuras e neutras (cyan primary, purple secondary)
- [x] Atualizar index.css com tema escuro premium (gradientes, glass, glow)
- [x] Atualizar design-system.ts com nova paleta
- [x] Redesenhar Home com hero moderno, gradientes radiais, stats, glass header
- [x] Aplicar efeitos premium (glow, glass morphism, hover animations)

## Ajuste de Tema - Híbrido Escuro/Pastel

- [x] Atualizar paleta com tons pastéis suaves (bege oklch 0.96, cinza claro)
- [x] Ajustar Home: hero escuro mantido, resto pastel
- [x] Criar classes CSS híbridas (glass-dark, glass-light, gradient-card-soft)

## Correção de Bug - Nested <a> Tags

- [x] Corrigir tags <a> aninhadas em Home.tsx (Link dentro de <a>)
