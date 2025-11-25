# Guia Completo de Configuração do Stripe para HorizonteGo

Este guia fornece instruções passo a passo para configurar sua conta Stripe e integrar com a plataforma HorizonteGo.

---

## Índice

1. [Criar Conta no Stripe](#1-criar-conta-no-stripe)
2. [Ativar Modo de Produção](#2-ativar-modo-de-produção)
3. [Configurar Produtos e Preços](#3-configurar-produtos-e-preços)
4. [Configurar Webhook](#4-configurar-webhook)
5. [Obter Chaves de API](#5-obter-chaves-de-api)
6. [Testar Integração](#6-testar-integração)

---

## 1. Criar Conta no Stripe

### Passo 1.1: Acessar o Site do Stripe
- Acesse: https://stripe.com
- Clique em **"Start now"** ou **"Sign up"**

### Passo 1.2: Preencher Informações
- **Email**: Seu email profissional
- **Nome completo**: Seu nome ou da empresa
- **País**: Brasil
- **Senha**: Crie uma senha segura

### Passo 1.3: Verificar Email
- Acesse seu email e clique no link de verificação enviado pelo Stripe

### Passo 1.4: Completar Cadastro
- **Tipo de negócio**: Selecione "Individual" ou "Empresa"
- **Nome do negócio**: HorizonteGo (ou seu nome)
- **Setor**: Serviços de Educação/Consultoria
- **Website**: URL do seu site (se tiver)

---

## 2. Ativar Modo de Produção

### Passo 2.1: Completar Informações da Conta
No dashboard do Stripe, você verá um banner solicitando ativação da conta. Clique em **"Activate your account"**.

### Passo 2.2: Fornecer Informações Necessárias
- **Informações pessoais**: Nome, data de nascimento, CPF
- **Informações bancárias**: Dados da conta para receber pagamentos
- **Documentos**: Upload de documento de identidade (RG ou CNH)

### Passo 2.3: Aguardar Aprovação
- O Stripe pode levar de algumas horas a 2 dias úteis para aprovar
- Você receberá um email quando a conta for ativada

**Nota**: Enquanto aguarda aprovação, você pode usar o **Modo de Teste** para desenvolver e testar.

---

## 3. Configurar Produtos e Preços

### Passo 3.1: Acessar Catálogo de Produtos
1. No dashboard do Stripe, clique em **"Products"** no menu lateral
2. Clique em **"+ Add product"**

### Passo 3.2: Criar Produto "Starter"
1. **Nome do produto**: `HorizonteGo Starter`
2. **Descrição**: `Plano Starter com 3 candidaturas/dia e 10 documentos/mês`
3. **Modelo de preço**: Recurring (Recorrente)
4. **Preço**: `29.00` BRL
5. **Frequência de cobrança**: Monthly (Mensal)
6. **ID do preço** (metadata): Anote o `price_id` gerado (ex: `price_1234567890`)
7. Clique em **"Save product"**

### Passo 3.3: Adicionar Metadata ao Produto
1. Na página do produto, role até **"Metadata"**
2. Adicione:
   - **Key**: `plan`
   - **Value**: `starter`
3. Clique em **"Save"**

### Passo 3.4: Criar Produto "Pro"
Repita o processo acima com:
- **Nome**: `HorizonteGo Pro`
- **Descrição**: `Plano Pro com 10 candidaturas/dia e documentos ilimitados`
- **Preço**: `59.00` BRL
- **Metadata**: `plan` = `pro`

### Passo 3.5: Anotar IDs dos Preços
Você precisará dos `price_id` de cada plano:
- **Starter**: `price_xxxxxxxxxxxxx`
- **Pro**: `price_yyyyyyyyyyyyy`

Esses IDs serão usados no arquivo `server/products.ts`.

---

## 4. Configurar Webhook

### Passo 4.1: Acessar Webhooks
1. No dashboard do Stripe, clique em **"Developers"** no menu superior
2. Clique em **"Webhooks"**
3. Clique em **"+ Add endpoint"**

### Passo 4.2: Configurar Endpoint
1. **Endpoint URL**: `https://SEU_DOMINIO.manus.space/api/stripe/webhook`
   - Substitua `SEU_DOMINIO` pelo domínio real do seu projeto
   - Exemplo: `https://horizontego.manus.space/api/stripe/webhook`

2. **Descrição**: `HorizonteGo Payment Webhook`

3. **Eventos a escutar**: Clique em **"Select events"** e selecione:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

4. Clique em **"Add endpoint"**

### Passo 4.3: Obter Signing Secret
1. Após criar o webhook, você verá um **"Signing secret"**
2. Clique em **"Reveal"** e copie o valor (começa com `whsec_`)
3. Anote este valor - você precisará dele nas variáveis de ambiente

---

## 5. Obter Chaves de API

### Passo 5.1: Acessar API Keys
1. No dashboard do Stripe, clique em **"Developers"** > **"API keys"**

### Passo 5.2: Copiar Chaves
Você verá duas chaves:

**Para Teste (Test mode)**:
- **Publishable key**: `pk_test_xxxxxxxxxxxxx`
- **Secret key**: `sk_test_xxxxxxxxxxxxx` (clique em "Reveal" para ver)

**Para Produção (Live mode)**:
- Ative o toggle **"Viewing test data"** para **OFF**
- **Publishable key**: `pk_live_xxxxxxxxxxxxx`
- **Secret key**: `sk_live_xxxxxxxxxxxxx`

### Passo 5.3: Configurar no Projeto
No painel de gerenciamento do HorizonteGo (Management UI):

1. Acesse **Settings** > **Secrets**
2. Atualize as seguintes variáveis:
   - `STRIPE_SECRET_KEY`: Cole a **Secret key** (use test para testar, live para produção)
   - `STRIPE_PUBLISHABLE_KEY`: Cole a **Publishable key**
   - `STRIPE_WEBHOOK_SECRET`: Cole o **Signing secret** do webhook

---

## 6. Testar Integração

### Passo 6.1: Usar Modo de Teste
1. Certifique-se de estar usando as chaves de **teste** (`sk_test_` e `pk_test_`)
2. Acesse seu site e vá para `/pricing`
3. Clique em **"Assinar"** em um dos planos

### Passo 6.2: Usar Cartões de Teste
O Stripe fornece cartões de teste para simular pagamentos:

**Cartão de Sucesso**:
- Número: `4242 4242 4242 4242`
- Data de validade: Qualquer data futura (ex: `12/25`)
- CVC: Qualquer 3 dígitos (ex: `123`)
- CEP: Qualquer CEP válido

**Cartão que Falha**:
- Número: `4000 0000 0000 0002`

### Passo 6.3: Verificar Webhook
1. Após completar um pagamento de teste, acesse **Developers** > **Webhooks**
2. Clique no endpoint que você criou
3. Verifique se o evento `checkout.session.completed` foi enviado com sucesso (status 200)

### Passo 6.4: Verificar no Banco de Dados
1. Acesse o painel **Database** no Management UI
2. Verifique se a tabela `users` foi atualizada:
   - `hasPaid` = `true`
   - `plan` = `starter` ou `pro`
   - `stripeCustomerId` = `cus_xxxxxxxxxxxxx`

---

## 7. Ir para Produção

### Passo 7.1: Ativar Conta (se ainda não fez)
- Complete todos os passos de verificação solicitados pelo Stripe
- Aguarde aprovação

### Passo 7.2: Trocar para Chaves de Produção
1. No Management UI, acesse **Settings** > **Secrets**
2. Atualize:
   - `STRIPE_SECRET_KEY`: Use a chave `sk_live_`
   - `STRIPE_PUBLISHABLE_KEY`: Use a chave `pk_live_`
   - `STRIPE_WEBHOOK_SECRET`: Use o signing secret do webhook de produção

### Passo 7.3: Atualizar Webhook para Produção
1. No Stripe, desative o toggle **"Viewing test data"**
2. Acesse **Developers** > **Webhooks**
3. Crie um novo endpoint com a mesma URL
4. Copie o novo **Signing secret** e atualize no Management UI

### Passo 7.4: Testar com Cartão Real
- Faça um pagamento real de teste (você pode cancelar depois)
- Verifique se tudo funciona corretamente

---

## Troubleshooting

### Problema: Webhook retorna erro 401
**Solução**: Verifique se o `STRIPE_WEBHOOK_SECRET` está correto no Management UI.

### Problema: Pagamento não atualiza plano do usuário
**Solução**: 
1. Verifique se o webhook está recebendo eventos (Stripe Dashboard > Webhooks)
2. Verifique se os metadados `plan: starter/pro` estão configurados nos produtos
3. Verifique os logs do servidor

### Problema: Erro "No such price"
**Solução**: Verifique se os `price_id` no arquivo `server/products.ts` correspondem aos IDs reais no Stripe.

---

## Recursos Adicionais

- **Documentação Oficial**: https://stripe.com/docs
- **Dashboard do Stripe**: https://dashboard.stripe.com
- **Suporte do Stripe**: https://support.stripe.com

---

## Checklist Final

- [ ] Conta Stripe criada e verificada
- [ ] Produtos "Starter" e "Pro" criados com metadata correto
- [ ] Webhook configurado e testado
- [ ] Chaves de API (test/live) obtidas
- [ ] Variáveis de ambiente configuradas no Management UI
- [ ] Teste de pagamento realizado com sucesso
- [ ] Webhook recebendo eventos corretamente
- [ ] Banco de dados atualizando plano do usuário
- [ ] Pronto para produção! 🎉
