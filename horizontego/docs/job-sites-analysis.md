# Análise de Sites de Vagas para Scraping

## 1. NAV.NO (arbeidsplassen.nav.no)

### Informações Gerais
- **URL**: https://arbeidsplassen.nav.no/stillinger
- **Total de vagas**: ~29.035 vagas ativas
- **Acesso**: Público (não requer login)
- **Idioma**: Norueguês

### Estrutura da Listagem
- Título da vaga
- Empresa/Empregador
- Localização (cidade)
- Prazo de candidatura
- Categoria (Guide, Sykepleier, etc.)
- Filtros disponíveis:
  - Data de publicação (hoje, últimos 3 dias, última semana)
  - Localização
  - Categoria profissional
  - Nível de educação
  - Idioma de trabalho
  - Tipo de contrato
  - Home office

### Campos Esperados em Detalhes
- Título completo
- Descrição da vaga
- Requisitos
- Responsabilidades
- Salário (quando disponível)
- Benefícios
- Tipo de contrato
- Data de início
- Prazo de candidatura
- Link para aplicação

### Estratégia de Scraping
1. **Listagem**: Acessar página de listagem e extrair links de vagas
2. **Paginação**: Implementar navegação por páginas (29.035 vagas)
3. **Detalhes**: Para cada link, acessar página de detalhes
4. **Frequência**: Scraping diário para capturar novas vagas
5. **Armazenamento**: Salvar no banco com referência ao link original

### Considerações Técnicas
- Site usa JavaScript para renderização
- Necessário usar browser automation (Puppeteer/Playwright)
- Respeitar robots.txt
- Implementar rate limiting (delay entre requisições)
- Armazenar ID único da vaga para evitar duplicatas

---

## 2. WorkInNorway.no

### Informações Gerais
- **URL**: https://workinnorway.no/
- **Tipo**: Guia oficial do governo norueguês
- **Acesso**: Público
- **Idiomas**: Inglês, Norueguês

### Conteúdo
- Guias para cidadãos de países nórdicos
- Guias para cidadãos da UE/EEA
- Guias para cidadãos de fora da UE
- Informações sobre serviços temporários
- Informações para empresas

### Estratégia
1. **Não é site de vagas**: É um guia informativo
2. **Conteúdo educacional**: Extrair informações sobre trabalhar na Noruega
3. **Adicionar ao módulo de segurança**: Links oficiais para referência

---

## 3. PickingJobs.com

### Informações Gerais
- **URL**: https://www.pickingjobs.com/
- **Tipo**: Plataforma de vagas de trabalho sazonal (fazendas, colheitas)
- **Cobertura**: Mundial (Austrália, Canadá, Nova Zelândia, Noruega, EUA, Europa, Japão)
- **Acesso**: Público
- **Tráfego**: ~4.500 visitantes/semana

### Estrutura
- Listagens de fazendas e empregadores por país
- Contato direto com empregadores (sem intermediários)
- Foco em trabalho sazonal: colheita, fazendas, vinícolas

### Estratégia
1. **Scraping de listagens**: Extrair lista de fazendas/empregadores
2. **Dados disponíveis**: Nome da fazenda, localização, tipo de trabalho, contato
3. **Integração**: Adicionar como fonte de vagas verificadas
4. **Frequência**: Semanal (conteúdo não muda diariamente)

---

## 4. GitHub - Lista de Empresas LMIA (Canadá)

### Informações Gerais
- **URL**: https://github.com/zodman/canada_companies_positive_lmia
- **Tipo**: Lista de empresas com LMIA positivo no Canadá
- **Formato**: Provavelmente CSV ou JSON

### Estratégia
1. Clonar repositório ou baixar arquivo
2. Parsear dados de empresas
3. Armazenar no banco como referência
4. Exibir badge "LMIA Positivo" para vagas dessas empresas

---

## 5. EURES - Guia de Identificação de Fraudes

### Informações Gerais
- **URL**: https://eures.europa.eu/how-spot-fraudulent-job-offers-and-misinformation-2023-06-15_en
- **Tipo**: Guia oficial da União Europeia
- **Objetivo**: Educar sobre identificação de fraudes

### Sinais de Alerta Identificados

#### Emails Suspeitos:
1. Remetente desconhecido sem contato prévio
2. Domínio de email falso ou suspeito
3. Erros de ortografia no domínio
4. Não é do domínio oficial da empresa

#### Ofertas Fraudulentas:
1. **Envolve transferência de dinheiro**: Nunca responder a ofertas que pedem para receber/enviar dinheiro
2. **Solicita informações bancárias**: Nenhuma empresa séria pede dados bancários no início do processo
3. **Números de telefone premium**: Verificar se não é número de tarifação especial
4. **Empresa não consegue abrir conta bancária**: Red flag clássico de golpe

#### Redes Sociais:
1. Vídeos no YouTube com informações falsas (ex: "EURES fornece vistos")
2. Contas falsas usando logos oficiais
3. Informações não verificáveis

### Estratégia de Implementação
1. **Criar checklist de verificação**: Adicionar ao módulo de segurança
2. **Sistema de pontuação de risco**: Atribuir score de segurança para cada vaga
3. **Alertas automáticos**: Exibir warnings quando vaga apresentar sinais suspeitos
4. **Educação do usuário**: Adicionar guia educacional no site

---

## Resumo da Análise

### Sites com Vagas (Scraping Necessário)
1. **NAV.NO**: ~29.000 vagas, scraping diário, requer browser automation
2. **PickingJobs.com**: Listagens de fazendas/empregadores, scraping semanal

### Fontes de Dados Estruturados
3. **GitHub LMIA**: Lista de empresas canadenses com LMIA positivo (CSV/JSON)

### Conteúdo Educacional
4. **WorkInNorway.no**: Guia oficial do governo (links de referência)
5. **EURES**: Guia de identificação de fraudes (checklist de segurança)

## Próximos Passos

1. ✅ Analisar todos os sites (completo)
2. ⏳ Implementar scraper NAV.NO (Puppeteer)
3. ⏳ Implementar scraper PickingJobs.com
4. ⏳ Baixar e parsear lista LMIA do GitHub
5. ⏳ Implementar sistema de verificação de fraudes
6. ⏳ Configurar cron jobs para scrapers
7. ⏳ Atualizar frontend para exibir vagas scrapadas
