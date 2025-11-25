# Configuração de Cron Jobs - HorizonteGo

Este documento descreve como configurar a execução automática diária dos scrapers de vagas e atualização de taxas de câmbio no servidor de produção.

## Visão Geral

O sistema possui dois cron jobs principais que devem ser executados automaticamente:

1. **Atualização de Taxas de Câmbio** - Executa diariamente às 00:00 UTC
2. **Scraper de Vagas** - Executa diariamente às 02:00 UTC (após taxas de câmbio)

## Comandos Disponíveis

O script `scripts/cron-jobs.mjs` aceita os seguintes comandos:

```bash
# Atualizar apenas taxas de câmbio
pnpm tsx scripts/cron-jobs.mjs exchange

# Executar apenas scrapers de vagas
pnpm tsx scripts/cron-jobs.mjs scrapers

# Executar ambos
pnpm tsx scripts/cron-jobs.mjs all
```

## Configuração no Servidor Linux

### Passo 1: Acessar o Crontab

```bash
crontab -e
```

### Passo 2: Adicionar Entradas de Cron

Adicione as seguintes linhas ao arquivo crontab:

```cron
# HorizonteGo - Atualização de taxas de câmbio (diariamente às 00:00 UTC)
0 0 * * * cd /home/ubuntu/horizontego && pnpm tsx scripts/cron-jobs.mjs exchange >> /home/ubuntu/horizontego/logs/cron-exchange.log 2>&1

# HorizonteGo - Scraper de vagas (diariamente às 02:00 UTC)
0 2 * * * cd /home/ubuntu/horizontego && pnpm tsx scripts/cron-jobs.mjs scrapers >> /home/ubuntu/horizontego/logs/cron-scrapers.log 2>&1
```

### Passo 3: Criar Diretório de Logs

```bash
mkdir -p /home/ubuntu/horizontego/logs
```

### Passo 4: Verificar Configuração

Listar cron jobs ativos:

```bash
crontab -l
```

## Formato do Crontab

O formato do crontab é: `minuto hora dia mês dia-da-semana comando`

Exemplos:
- `0 0 * * *` - Todos os dias à meia-noite (00:00)
- `0 2 * * *` - Todos os dias às 02:00
- `0 */6 * * *` - A cada 6 horas
- `0 0 * * 0` - Todos os domingos à meia-noite

## Monitoramento

### Verificar Logs

```bash
# Logs de taxas de câmbio
tail -f /home/ubuntu/horizontego/logs/cron-exchange.log

# Logs de scrapers
tail -f /home/ubuntu/horizontego/logs/cron-scrapers.log
```

### Testar Manualmente

Antes de configurar o cron, teste os comandos manualmente:

```bash
cd /home/ubuntu/horizontego

# Testar atualização de câmbio
pnpm tsx scripts/cron-jobs.mjs exchange

# Testar scraper (busca 50 vagas)
pnpm tsx scripts/cron-jobs.mjs scrapers
```

## Scraper de Vagas - Detalhes

O scraper `arbeidsplassen-scraper.ts` possui as seguintes características:

- **Paginação automática**: Busca múltiplas páginas até atingir 50 vagas
- **Detecção de duplicatas**: Ignora vagas já existentes no banco
- **Rate limiting**: Delay de 1s entre páginas e 2s entre vagas
- **Limite de páginas**: Máximo de 5 páginas por execução
- **Fonte**: arbeidsplassen.nav.no (site oficial de empregos da Noruega)

### Campos Extraídos

Cada vaga inclui:
- Título
- Empresa
- Localização
- Descrição completa
- Requisitos
- Salário (quando disponível)
- Benefícios
- Categoria/Setor
- Idioma de trabalho
- Tipo de emprego (tempo integral, parcial, etc.)
- Trabalho remoto (sim/não)
- Link original

## Troubleshooting

### Cron não está executando

1. Verificar se o serviço cron está ativo:
```bash
sudo systemctl status cron
```

2. Verificar permissões do diretório:
```bash
ls -la /home/ubuntu/horizontego
```

3. Verificar variáveis de ambiente:
```bash
# Adicionar ao início do crontab
SHELL=/bin/bash
PATH=/usr/local/bin:/usr/bin:/bin
DATABASE_URL=mysql://...
```

### Scraper falhando

1. Verificar conectividade com NAV.NO:
```bash
curl -I https://arbeidsplassen.nav.no
```

2. Verificar logs de erro:
```bash
grep "ERROR" /home/ubuntu/horizontego/logs/cron-scrapers.log
```

3. Executar manualmente com debug:
```bash
cd /home/ubuntu/horizontego
pnpm tsx server/scrapers/arbeidsplassen-scraper.ts
```

## Configuração Alternativa (systemd timer)

Para sistemas que preferem systemd timers ao invés de cron:

### Criar arquivo de serviço

`/etc/systemd/system/horizontego-scrapers.service`:

```ini
[Unit]
Description=HorizonteGo Job Scrapers
After=network.target

[Service]
Type=oneshot
User=ubuntu
WorkingDirectory=/home/ubuntu/horizontego
ExecStart=/usr/bin/pnpm tsx scripts/cron-jobs.mjs scrapers
StandardOutput=append:/home/ubuntu/horizontego/logs/cron-scrapers.log
StandardError=append:/home/ubuntu/horizontego/logs/cron-scrapers.log
```

### Criar arquivo de timer

`/etc/systemd/system/horizontego-scrapers.timer`:

```ini
[Unit]
Description=Run HorizonteGo scrapers daily at 2 AM

[Timer]
OnCalendar=daily
OnCalendar=*-*-* 02:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

### Ativar timer

```bash
sudo systemctl daemon-reload
sudo systemctl enable horizontego-scrapers.timer
sudo systemctl start horizontego-scrapers.timer
sudo systemctl status horizontego-scrapers.timer
```

## Manutenção

### Limpeza de Logs

Adicionar rotação de logs para evitar crescimento excessivo:

```bash
# Criar arquivo de configuração logrotate
sudo nano /etc/logrotate.d/horizontego
```

Conteúdo:

```
/home/ubuntu/horizontego/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
}
```

### Limpeza de Vagas Antigas

Considere adicionar um cron job mensal para remover vagas com mais de 60 dias:

```cron
# Limpeza mensal de vagas antigas (primeiro dia do mês às 03:00)
0 3 1 * * cd /home/ubuntu/horizontego && pnpm tsx scripts/cleanup-old-jobs.mjs >> /home/ubuntu/horizontego/logs/cron-cleanup.log 2>&1
```

## Suporte

Para problemas ou dúvidas, consulte:
- Logs do sistema: `/home/ubuntu/horizontego/logs/`
- Documentação do NAV.NO: https://arbeidsplassen.nav.no
- Repositório do projeto: (adicionar URL quando disponível)

---

**Última atualização:** Janeiro 2025  
**Autor:** Manus AI
