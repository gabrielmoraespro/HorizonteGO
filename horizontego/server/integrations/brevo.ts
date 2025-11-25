/**
 * Brevo (ex-Sendinblue) Email Integration
 * Free tier: 300 emails/day
 * https://www.brevo.com/
 */

import * as brevo from "@getbrevo/brevo";

const BREVO_API_KEY = process.env.BREVO_API_KEY || "";
const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || "noreply@horizontego.com";
const FROM_NAME = process.env.BREVO_FROM_NAME || "HorizonteGo";

let apiInstance: brevo.TransactionalEmailsApi | null = null;

function getBrevoClient() {
  if (!apiInstance && BREVO_API_KEY) {
    apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, BREVO_API_KEY);
  }
  return apiInstance;
}

export interface EmailParams {
  to: string;
  toName?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  const client = getBrevoClient();
  
  if (!client) {
    console.warn("[Brevo] API key not configured, skipping email");
    return false;
  }

  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { email: FROM_EMAIL, name: FROM_NAME };
    sendSmtpEmail.to = [{ email: params.to, name: params.toName || params.to }];
    sendSmtpEmail.subject = params.subject;
    sendSmtpEmail.htmlContent = params.htmlContent;
    
    if (params.textContent) {
      sendSmtpEmail.textContent = params.textContent;
    }

    await client.sendTransacEmail(sendSmtpEmail);
    console.log(`[Brevo] Email sent to ${params.to}`);
    return true;
  } catch (error) {
    console.error("[Brevo] Error sending email:", error);
    return false;
  }
}

// ============ Email Templates ============

export async function sendWelcomeEmail(to: string, name: string): Promise<boolean> {
  return await sendEmail({
    to,
    toName: name,
    subject: "Bem-vindo ao HorizonteGo! 🌍",
    htmlContent: `
      <h1>Olá, ${name}!</h1>
      <p>Seja bem-vindo ao <strong>HorizonteGo</strong>, sua plataforma completa para trabalhar como seasonal worker no exterior.</p>
      
      <h2>O que você pode fazer agora:</h2>
      <ul>
        <li>✅ Explorar vagas verificadas no Canadá e Noruega</li>
        <li>✅ Usar o checklist guiado por país</li>
        <li>✅ Calcular sua economia projetada</li>
        <li>✅ Gerar documentos profissionais com IA</li>
      </ul>
      
      <p>Para desbloquear todos os recursos, considere fazer upgrade para um plano pago.</p>
      
      <p><a href="https://horizontego.com/pricing" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Ver Planos</a></p>
      
      <p>Boa sorte na sua jornada internacional!</p>
      <p><strong>Equipe HorizonteGo</strong></p>
    `,
    textContent: `Olá, ${name}!\n\nSeja bem-vindo ao HorizonteGo! Explore vagas, use o checklist guiado e prepare-se para trabalhar no exterior.\n\nEquipe HorizonteGo`,
  });
}

export async function sendChecklistCompletedEmail(to: string, name: string, country: string, stage: string): Promise<boolean> {
  return await sendEmail({
    to,
    toName: name,
    subject: `Parabéns! Etapa "${stage}" concluída 🎉`,
    htmlContent: `
      <h1>Parabéns, ${name}!</h1>
      <p>Você concluiu a etapa <strong>"${stage}"</strong> do seu checklist para ${country}.</p>
      
      <p>Continue assim! Cada etapa concluída te aproxima do seu objetivo de trabalhar no exterior.</p>
      
      <p><a href="https://horizontego.com/checklist" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Ver Progresso</a></p>
      
      <p>Boa sorte!</p>
      <p><strong>Equipe HorizonteGo</strong></p>
    `,
    textContent: `Parabéns, ${name}! Você concluiu a etapa "${stage}" do seu checklist para ${country}.\n\nEquipe HorizonteGo`,
  });
}

export async function sendDocumentGeneratedEmail(to: string, name: string, documentType: string): Promise<boolean> {
  const typeLabel = documentType === "resume" ? "Currículo" : 
                    documentType === "cover_letter" ? "Carta de Apresentação" : "Email";
  
  return await sendEmail({
    to,
    toName: name,
    subject: `Seu ${typeLabel} está pronto! 📄`,
    htmlContent: `
      <h1>Olá, ${name}!</h1>
      <p>Seu <strong>${typeLabel}</strong> foi gerado com sucesso e está disponível na plataforma.</p>
      
      <p><a href="https://horizontego.com/documents" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Ver Documento</a></p>
      
      <p>Lembre-se de revisar e personalizar o documento antes de enviar para empregadores.</p>
      
      <p>Boa sorte!</p>
      <p><strong>Equipe HorizonteGo</strong></p>
    `,
    textContent: `Olá, ${name}! Seu ${typeLabel} foi gerado com sucesso.\n\nEquipe HorizonteGo`,
  });
}

export async function sendApplicationConfirmationEmail(
  to: string, 
  name: string, 
  jobTitle: string, 
  company: string
): Promise<boolean> {
  return await sendEmail({
    to,
    toName: name,
    subject: `Candidatura enviada: ${jobTitle} 📨`,
    htmlContent: `
      <h1>Candidatura Enviada!</h1>
      <p>Olá, ${name}!</p>
      <p>Sua candidatura para a vaga <strong>${jobTitle}</strong> na empresa <strong>${company}</strong> foi registrada com sucesso.</p>
      
      <p>Acompanhe o status das suas candidaturas no painel:</p>
      <p><a href="https://horizontego.com/dashboard" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Ver Dashboard</a></p>
      
      <p>Boa sorte!</p>
      <p><strong>Equipe HorizonteGo</strong></p>
    `,
    textContent: `Candidatura enviada para ${jobTitle} na ${company}!\n\nEquipe HorizonteGo`,
  });
}

export async function sendNewJobAlertEmail(
  to: string, 
  name: string, 
  jobTitle: string, 
  country: string,
  jobUrl: string
): Promise<boolean> {
  return await sendEmail({
    to,
    toName: name,
    subject: `Nova vaga disponível: ${jobTitle} 🔔`,
    htmlContent: `
      <h1>Nova Vaga Disponível!</h1>
      <p>Olá, ${name}!</p>
      <p>Uma nova vaga foi adicionada e pode ser do seu interesse:</p>
      
      <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <h2 style="margin-top: 0;">${jobTitle}</h2>
        <p><strong>País:</strong> ${country}</p>
      </div>
      
      <p><a href="${jobUrl}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Ver Vaga</a></p>
      
      <p>Não perca essa oportunidade!</p>
      <p><strong>Equipe HorizonteGo</strong></p>
    `,
    textContent: `Nova vaga: ${jobTitle} em ${country}!\n\nVeja mais em: ${jobUrl}\n\nEquipe HorizonteGo`,
  });
}
