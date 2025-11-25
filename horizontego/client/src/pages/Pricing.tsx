import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, CreditCard, Loader2, ArrowLeft, Zap } from "lucide-react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { useState } from "react";

const PLANS = [
  {
    key: "FREE" as const,
    name: "Gratuito",
    price: "R$ 0",
    period: "sempre",
    description: "Ideal para explorar a plataforma",
    features: [
      "Acesso ao checklist guiado",
      "Visualização de vagas verificadas",
      "1 documento gerado por mês",
      "Módulo de segurança antigolpe",
      "Calculadora financeira básica",
    ],
    limitations: [
      "0 candidaturas por dia",
      "Sem upload de currículo",
      "Sem alertas de vagas",
    ],
    cta: "Começar Grátis",
    highlighted: false,
  },
  {
    key: "STARTER" as const,
    name: "Starter",
    price: "R$ 29",
    period: "/mês",
    description: "Para quem está começando a buscar",
    features: [
      "Tudo do plano Gratuito",
      "Até 3 candidaturas por dia",
      "10 documentos gerados por mês",
      "Upload de currículo (PDF)",
      "Calculadora financeira completa",
      "Busca de equivalência de profissões",
      "Alertas de novas vagas por email",
    ],
    cta: "Assinar Starter",
    highlighted: true,
  },
  {
    key: "PRO" as const,
    name: "Pro",
    price: "R$ 59",
    period: "/mês",
    description: "Acesso completo e suporte prioritário",
    features: [
      "Tudo do plano Starter",
      "Até 10 candidaturas por dia",
      "Documentos ilimitados",
      "Suporte prioritário",
      "Acesso antecipado a novos recursos",
      "Consultoria personalizada (1x/mês)",
    ],
    cta: "Assinar Pro",
    highlighted: false,
  },
];

export default function Pricing() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<"FREE" | "STARTER" | "PRO" | null>(null);

  const createCheckoutMutation = trpc.payment.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Redirecionando para o checkout...");
        window.open(data.url, "_blank");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar sessão de pagamento");
      setSelectedPlan(null);
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const handleSelectPlan = (planKey: "FREE" | "STARTER" | "PRO") => {
    if (planKey === "FREE") {
      toast.success("Você já tem acesso ao plano gratuito!");
      setLocation("/dashboard");
      return;
    }

    setSelectedPlan(planKey);
    createCheckoutMutation.mutate({ productKey: planKey });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <span className="text-xl font-bold text-foreground">Escolha seu Plano</span>
          <div className="w-32"></div>
        </div>
      </header>

      <div className="container py-12">
        {/* Header Section */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Escolha o Plano Ideal para Você
          </h1>
          <p className="text-lg text-muted-foreground">
            Comece gratuitamente ou escolha um plano pago para desbloquear recursos avançados e
            aumentar suas chances de conseguir trabalho no exterior.
          </p>
        </div>

        {/* Current Plan Badge */}
        {user && (
          <div className="text-center mb-8">
            <Badge variant="secondary" className="text-sm py-1 px-3">
              Plano Atual: {user.plan === "free" ? "Gratuito" : user.plan === "starter" ? "Starter" : "Pro"}
            </Badge>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PLANS.map((plan) => (
            <Card
              key={plan.key}
              className={`relative ${
                plan.highlighted
                  ? "border-2 border-primary shadow-lg scale-105"
                  : "border"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1 gap-1">
                    <Zap className="h-3 w-3" />
                    Mais Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription className="text-base">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {plan.limitations && plan.limitations.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Limitações:</p>
                    {plan.limitations.map((limitation, idx) => (
                      <p key={idx} className="text-xs text-muted-foreground">
                        • {limitation}
                      </p>
                    ))}
                  </div>
                )}

                <Button
                  className="w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                  size="lg"
                  onClick={() => handleSelectPlan(plan.key)}
                  disabled={
                    selectedPlan === plan.key ||
                    (user?.plan === plan.key.toLowerCase())
                  }
                >
                  {selectedPlan === plan.key ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : user?.plan === plan.key.toLowerCase() ? (
                    "Plano Atual"
                  ) : (
                    plan.cta
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Perguntas Frequentes</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Posso mudar de plano depois?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">O que acontece se eu atingir o limite de candidaturas?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  O limite de candidaturas é resetado diariamente. Se precisar de mais candidaturas, considere fazer upgrade para um plano superior.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Como funciona o pagamento?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Processamos pagamentos de forma segura através do Stripe. Você pode pagar com cartão de crédito e cancelar a qualquer momento.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
