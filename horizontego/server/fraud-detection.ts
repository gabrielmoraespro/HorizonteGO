/**
 * Sistema de verificação de fraudes baseado no guia EURES
 * https://eures.europa.eu/how-spot-fraudulent-job-offers-and-misinformation-2023-06-15_en
 */

export interface FraudCheckResult {
  score: number; // 0-100 (100 = totalmente seguro, 0 = altamente suspeito)
  warnings: string[];
  redFlags: string[];
  isLikelySafe: boolean;
}

const RED_FLAGS = {
  // Sinais de alerta críticos
  MONEY_TRANSFER: 'Solicita transferência ou recebimento de dinheiro',
  BANK_DETAILS_EARLY: 'Pede informações bancárias no início do processo',
  PREMIUM_PHONE: 'Usa número de telefone premium/tarifação especial',
  COMPANY_CANT_BANK: 'Empresa alega não conseguir abrir conta bancária',
  NO_OFFICIAL_DOMAIN: 'Email não é do domínio oficial da empresa',
  SPELLING_ERRORS: 'Erros de ortografia no domínio ou comunicação',
  TOO_GOOD_TO_BE_TRUE: 'Salário ou benefícios irrealisticamente altos',
  UPFRONT_PAYMENT: 'Solicita pagamento antecipado (taxas, vistos, etc)',
  VAGUE_DETAILS: 'Detalhes vagos sobre a empresa ou posição',
};

const WARNING_SIGNS = {
  // Sinais de alerta moderados
  UNKNOWN_SENDER: 'Remetente desconhecido sem contato prévio',
  NO_COMPANY_INFO: 'Informações limitadas sobre a empresa',
  GENERIC_JOB_DESC: 'Descrição de trabalho muito genérica',
  NO_INTERVIEW: 'Oferta sem processo de entrevista',
  SUSPICIOUS_BENEFITS: 'Benefícios suspeitos ou não verificáveis',
  URGENT_PRESSURE: 'Pressão excessiva para decisão rápida',
};

export function checkJobForFraud(job: {
  title?: string | null;
  company?: string | null;
  description?: string | null;
  requirements?: string | null;
  salary?: string | null;
  sourceUrl?: string | null;
  sourceName?: string | null;
}): FraudCheckResult {
  const warnings: string[] = [];
  const redFlags: string[] = [];
  let score = 100;

  const fullText = `
    ${job.title || ''}
    ${job.company || ''}
    ${job.description || ''}
    ${job.requirements || ''}
    ${job.salary || ''}
  `.toLowerCase();

  // Verificar red flags críticos
  if (
    fullText.includes('transfer') ||
    fullText.includes('transferência') ||
    fullText.includes('enviar dinheiro') ||
    fullText.includes('send money')
  ) {
    redFlags.push(RED_FLAGS.MONEY_TRANSFER);
    score -= 40;
  }

  if (
    fullText.includes('bank account') ||
    fullText.includes('conta bancária') ||
    fullText.includes('dados bancários') ||
    fullText.includes('banking details')
  ) {
    redFlags.push(RED_FLAGS.BANK_DETAILS_EARLY);
    score -= 35;
  }

  if (
    fullText.includes('pagamento antecipado') ||
    fullText.includes('upfront payment') ||
    fullText.includes('taxa de') ||
    fullText.includes('processing fee')
  ) {
    redFlags.push(RED_FLAGS.UPFRONT_PAYMENT);
    score -= 40;
  }

  if (
    fullText.includes('urgente') ||
    fullText.includes('urgent') ||
    fullText.includes('imediatamente') ||
    fullText.includes('immediately') ||
    fullText.includes('hoje mesmo')
  ) {
    warnings.push(WARNING_SIGNS.URGENT_PRESSURE);
    score -= 10;
  }

  // Verificar salário suspeito
  if (job.salary) {
    const salaryText = job.salary.toLowerCase();
    if (
      salaryText.includes('$10,000') ||
      salaryText.includes('$20,000') ||
      salaryText.includes('€10,000') ||
      salaryText.includes('muito alto') ||
      salaryText.includes('extremely high')
    ) {
      warnings.push(RED_FLAGS.TOO_GOOD_TO_BE_TRUE);
      score -= 15;
    }
  }

  // Verificar empresa
  if (!job.company || job.company.trim().length < 3) {
    warnings.push(WARNING_SIGNS.NO_COMPANY_INFO);
    score -= 10;
  }

  // Verificar descrição
  if (!job.description || job.description.trim().length < 50) {
    warnings.push(WARNING_SIGNS.GENERIC_JOB_DESC);
    score -= 10;
  }

  // Verificar fonte
  const trustedSources = ['NAV.NO', 'Job Bank Canada', 'PickingJobs.com', 'EURES'];
  if (job.sourceName && trustedSources.includes(job.sourceName)) {
    score += 10; // Bonus para fontes confiáveis
    if (score > 100) score = 100;
  }

  // Verificar URL
  if (job.sourceUrl) {
    const url = job.sourceUrl.toLowerCase();
    const trustedDomains = ['nav.no', 'jobbank.gc.ca', 'pickingjobs.com', 'eures.europa.eu'];
    const isTrusted = trustedDomains.some(domain => url.includes(domain));
    
    if (isTrusted) {
      score += 10;
      if (score > 100) score = 100;
    } else if (url.includes('.xyz') || url.includes('.tk') || url.includes('.ml')) {
      warnings.push('Domínio suspeito detectado');
      score -= 15;
    }
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    warnings,
    redFlags,
    isLikelySafe: score >= 70 && redFlags.length === 0,
  };
}

export function getFraudCheckSummary(result: FraudCheckResult): string {
  if (result.score >= 90) {
    return 'Vaga altamente confiável';
  } else if (result.score >= 70) {
    return 'Vaga parece segura';
  } else if (result.score >= 50) {
    return 'Vaga requer atenção - verifique detalhes';
  } else if (result.score >= 30) {
    return 'Vaga suspeita - proceda com cautela';
  } else {
    return 'Vaga altamente suspeita - NÃO recomendada';
  }
}
