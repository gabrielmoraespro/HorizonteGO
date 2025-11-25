/**
 * Stripe Product Configuration
 * Define products and prices for the platform
 */

export const PLAN_LIMITS = {
  free: {
    dailyApplications: 0,
    documentsPerMonth: 1,
    jobAlerts: false,
    prioritySupport: false,
    professionalEquivalence: false,
  },
  starter: {
    dailyApplications: 3,
    documentsPerMonth: 10,
    jobAlerts: true,
    prioritySupport: false,
    professionalEquivalence: true,
  },
  pro: {
    dailyApplications: 10,
    documentsPerMonth: -1, // unlimited
    jobAlerts: true,
    prioritySupport: true,
    professionalEquivalence: true,
  },
} as const;

export const PRODUCTS = {
  FREE: {
    plan: "free" as const,
    name: "HorizonteGo - Plano Gratuito",
    description: "Acesso básico à plataforma com recursos limitados",
    price: 0,
    currency: "brl",
    features: [
      "Acesso ao checklist guiado",
      "Visualização de vagas verificadas",
      "1 documento gerado por mês",
      "Módulo de segurança antigolpe",
    ],
  },
  STARTER: {
    plan: "starter" as const,
    name: "HorizonteGo - Plano Starter",
    description: "Plano ideal para quem está começando a buscar oportunidades no exterior",
    price: 2900, // R$ 29.00 in cents
    currency: "brl",
    priceId: "price_1QkVXVLnwRkEk0NzJYvZfQYH",
    interval: "month" as const,
    features: [
      "Tudo do plano Gratuito",
      "Até 3 candidaturas por dia",
      "10 documentos gerados por mês",
      "Calculadora financeira completa",
      "Busca de equivalência de profissões",
      "Alertas de novas vagas por email",
    ],
  },
  PRO: {
    plan: "pro" as const,
    name: "HorizonteGo - Plano Pro",
    description: "Plano completo com todos os recursos e suporte prioritário",
    price: 5900, // R$ 59.00 in cents
    currency: "brl",
    priceId: "price_1QkVXWLnwRkEk0NzrKp8YZAB",
    interval: "month" as const,
    features: [
      "Tudo do plano Starter",
      "Até 10 candidaturas por dia",
      "Documentos ilimitados",
      "Suporte prioritário",
      "Acesso antecipado a novos recursos",
      "Consultoria personalizada (1x/mês)",
    ],
  },
} as const;

export type ProductKey = keyof typeof PRODUCTS;
export type PlanType = "free" | "starter" | "pro";

export function getPlanLimits(plan: PlanType) {
  return PLAN_LIMITS[plan];
}

export function canApplyToJob(plan: PlanType, dailyCount: number): boolean {
  const limit = PLAN_LIMITS[plan].dailyApplications;
  return dailyCount < limit;
}

export function canGenerateDocument(plan: PlanType, monthlyCount: number): boolean {
  const limit = PLAN_LIMITS[plan].documentsPerMonth;
  if (limit === -1) return true; // unlimited
  return monthlyCount < limit;
}
