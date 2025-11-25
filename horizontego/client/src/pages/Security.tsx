import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Shield, AlertTriangle, CheckCircle2, Info, ExternalLink, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function Security() {
  const { data: tips, isLoading } = trpc.security.getTips.useQuery();

  const categoryLabels = {
    scam_alert: "Alerta de Golpe",
    verification: "Verificação",
    safety_tip: "Dica de Segurança",
    official_resource: "Recurso Oficial",
  };

  const categoryIcons = {
    scam_alert: AlertTriangle,
    verification: CheckCircle2,
    safety_tip: Shield,
    official_resource: Info,
  };

  const severityColors = {
    low: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    medium: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
    high: "bg-red-500/10 text-red-700 border-red-500/20",
  };

  const groupedTips = tips?.reduce((acc, tip) => {
    if (!acc[tip.category]) {
      acc[tip.category] = [];
    }
    acc[tip.category].push(tip);
    return acc;
  }, {} as Record<string, typeof tips>);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
          <span className="text-xl font-bold text-foreground">Segurança e Antigolpe</span>
          <div className="w-32"></div>
        </div>
      </header>

      <div className="container py-8 max-w-5xl">
        {/* Intro */}
        <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Shield className="h-8 w-8 text-primary" />
              Proteja-se Contra Golpes
            </CardTitle>
            <CardDescription className="text-base">
              Trabalhar no exterior é uma oportunidade incrível, mas é importante estar atento a fraudes e golpes. 
              Aqui você encontra informações essenciais para manter sua segurança durante todo o processo.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Security Tips by Category */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : tips && tips.length > 0 ? (
          <div className="space-y-8">
            {Object.entries(groupedTips || {}).map(([category, categoryTips]) => {
              const Icon = categoryIcons[category as keyof typeof categoryIcons];
              return (
                <div key={category}>
                  <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Icon className="h-6 w-6 text-primary" />
                    {categoryLabels[category as keyof typeof categoryLabels]}
                  </h2>
                  <div className="grid gap-4">
                    {categoryTips?.map((tip) => (
                      <Card
                        key={tip.id}
                        className={`border-2 ${severityColors[tip.severity]}`}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg">{tip.title}</CardTitle>
                            {tip.severity === 'high' && (
                              <Badge variant="destructive">Alta Prioridade</Badge>
                            )}
                            {tip.severity === 'medium' && (
                              <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                                Atenção
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground whitespace-pre-line">{tip.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhuma dica de segurança disponível no momento. Volte mais tarde.
              </p>
            </CardContent>
          </Card>
        )}

        {/* General Safety Checklist */}
        <Card className="mt-8 border-2 border-secondary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-secondary" />
              Checklist de Verificação de Vagas
            </CardTitle>
            <CardDescription>
              Use esta lista para avaliar se uma vaga é legítima
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                "A empresa tem um site oficial e informações de contato verificáveis?",
                "A vaga foi publicada em sites oficiais de emprego do governo?",
                "O salário oferecido está dentro da média do mercado local?",
                "A empresa solicita pagamento antecipado ou taxas de processamento?",
                "As informações sobre visto e permissão de trabalho são claras?",
                "Você consegue encontrar avaliações ou referências da empresa online?",
                "A comunicação é profissional e livre de erros gramaticais graves?",
                "Os benefícios oferecidos parecem realistas e não exagerados?",
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Official Resources */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-6 w-6 text-primary" />
              Recursos Oficiais
            </CardTitle>
            <CardDescription>
              Links para sites governamentais e recursos confiáveis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Canadá</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>
                  <a
                    href="https://www.jobbank.gc.ca"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary underline"
                  >
                    Job Bank Canada - Portal Oficial de Empregos
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary underline"
                  >
                    Immigration Canada - Trabalhar no Canadá
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Noruega</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>
                  <a
                    href="https://www.nav.no"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary underline"
                  >
                    NAV.NO - Serviço de Emprego da Noruega
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.udi.no/en/want-to-apply/work-immigration/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary underline"
                  >
                    UDI - Imigração para Trabalho na Noruega
                  </a>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
