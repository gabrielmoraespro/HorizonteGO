export function createEmailTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #0891B2 0%, #10B981 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">HorizonteGo</h1>
              <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">Sua jornada internacional começa aqui</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 15px 0; font-size: 14px; color: #6b7280;">
                <a href="https://horizontego.com/profile" style="color: #0891B2; text-decoration: none; margin: 0 10px;">Meu Perfil</a> |
                <a href="https://horizontego.com/jobs" style="color: #0891B2; text-decoration: none; margin: 0 10px;">Vagas</a> |
                <a href="https://horizontego.com/contact" style="color: #0891B2; text-decoration: none; margin: 0 10px;">Suporte</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                © 2025 HorizonteGo. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function createButton(text: string, url: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
      <tr>
        <td align="center">
          <a href="${url}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #0891B2 0%, #10B981 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `.trim();
}

export const emailTemplates = {
  subscriptionCreated: (userName: string, planName: string) => createEmailTemplate(`
    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px;">🎉 Bem-vindo ao ${planName}!</h2>
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Olá <strong>${userName}</strong>,
    </p>
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Sua assinatura foi ativada com sucesso! Agora você tem acesso completo a todos os recursos do plano <strong>${planName}</strong>.
    </p>
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Aproveite para explorar vagas verificadas, gerar documentos profissionais e acompanhar seu progresso rumo ao trabalho internacional.
    </p>
    ${createButton('Acessar Painel', 'https://horizontego.com/dashboard')}
    <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px;">
      Dúvidas? Nossa equipe está pronta para ajudar!
    </p>
  `),

  subscriptionRenewed: (userName: string) => createEmailTemplate(`
    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px;">✅ Assinatura Renovada</h2>
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Olá <strong>${userName}</strong>,
    </p>
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Sua assinatura foi renovada com sucesso. O pagamento foi processado e você continua com acesso total à plataforma.
    </p>
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Obrigado por continuar sua jornada conosco!
    </p>
    ${createButton('Ver Vagas Disponíveis', 'https://horizontego.com/jobs')}
  `),

  subscriptionCanceled: (userName: string) => createEmailTemplate(`
    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px;">😔 Assinatura Cancelada</h2>
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Olá <strong>${userName}</strong>,
    </p>
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Sua assinatura foi cancelada. Você ainda pode acessar recursos gratuitos da plataforma.
    </p>
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Se mudar de ideia, você pode reativar sua assinatura a qualquer momento no seu perfil.
    </p>
    ${createButton('Reativar Assinatura', 'https://horizontego.com/pricing')}
    <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px;">
      Sentiremos sua falta! 💙
    </p>
  `),

  paymentFailed: (userName: string) => createEmailTemplate(`
    <h2 style="margin: 0 0 20px 0; color: #dc2626; font-size: 24px;">⚠️ Falha no Pagamento</h2>
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Olá <strong>${userName}</strong>,
    </p>
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Não conseguimos processar o pagamento da sua assinatura. Isso pode acontecer por diversos motivos:
    </p>
    <ul style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.6; padding-left: 20px;">
      <li>Cartão vencido ou sem saldo</li>
      <li>Dados de cobrança desatualizados</li>
      <li>Limite de crédito atingido</li>
    </ul>
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Por favor, atualize seu método de pagamento para continuar aproveitando todos os recursos.
    </p>
    ${createButton('Atualizar Pagamento', 'https://horizontego.com/profile')}
    <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px;">
      Precisa de ajuda? Entre em contato conosco.
    </p>
  `),
};
