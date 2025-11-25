import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Checklist() {
  const { user } = useAuth();
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);

  const { data: countries, isLoading: countriesLoading } = trpc.countries.list.useQuery();
  const { data: steps, isLoading: stepsLoading } = trpc.checklist.getSteps.useQuery(
    { countryId: selectedCountryId! },
    { enabled: !!selectedCountryId }
  );
  const { data: userProgress } = trpc.checklist.getUserProgress.useQuery(
    { countryId: selectedCountryId! },
    { enabled: !!selectedCountryId }
  );

  const utils = trpc.useUtils();
  const toggleMutation = trpc.checklist.toggleStep.useMutation({
    onSuccess: () => {
      utils.checklist.getUserProgress.invalidate();
      toast.success("Progresso atualizado!");
    },
    onError: () => {
      toast.error("Erro ao atualizar progresso");
    },
  });

  const markViewedMutation = trpc.checklist.markViewed.useMutation({
    onSuccess: () => {
      utils.checklist.getUserProgress.invalidate();
    },
  });

  const isStepCompleted = (stepId: number) => {
    return userProgress?.some(p => p.stepId === stepId && p.isCompleted) || false;
  };

  const isStepViewed = (stepId: number) => {
    return userProgress?.some(p => p.stepId === stepId && p.viewedAt) || false;
  };

  const handleLinkClick = (stepId: number) => {
    if (!isStepViewed(stepId)) {
      markViewedMutation.mutate({ stepId });
    }
  };

  const handleToggleStep = (stepId: number, currentStatus: boolean) => {
    toggleMutation.mutate({ stepId, isCompleted: !currentStatus });
  };

  const stageLabels = {
    preparation: "Preparação",
    documentation: "Documentação",
    application: "Aplicação",
    interview: "Entrevista",
    approval: "Aprovação",
    boarding: "Embarque",
  };

  const groupedSteps = steps?.reduce((acc, step) => {
    if (!acc[step.stage]) {
      acc[step.stage] = [];
    }
    acc[step.stage].push(step);
    return acc;
  }, {} as Record<string, typeof steps>);

  // Calculate progress statistics
  const totalSteps = steps?.length || 0;
  const completedSteps = userProgress?.filter(p => p.isCompleted).length || 0;
  const viewedSteps = userProgress?.filter(p => p.viewedAt).length || 0;
  const completionPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

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
          <span className="text-xl font-bold text-foreground">Checklist Guiado</span>
          <div className="w-32"></div>
        </div>
      </header>

      <div className="container py-8 max-w-4xl">
        {/* Country Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Selecione o País de Destino</CardTitle>
            <CardDescription>
              Escolha o país para o qual você deseja trabalhar e veja o checklist personalizado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {countriesLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <Select
                value={selectedCountryId?.toString()}
                onValueChange={(value) => setSelectedCountryId(parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Escolha um país" />
                </SelectTrigger>
                <SelectContent>
                  {countries?.map((country) => (
                    <SelectItem key={country.id} value={country.id.toString()}>
                      {country.flagEmoji} {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        {/* Progress Bar */}
        {selectedCountryId && totalSteps > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Progresso Geral</span>
                  <span className="text-muted-foreground">
                    {completedSteps}/{totalSteps} concluídos ({completionPercentage}%)
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>👁️ {viewedSteps} visualizados</span>
                  <span>✅ {completedSteps} completos</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Checklist Steps */}
        {selectedCountryId && (
          <>
            {stepsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : steps && steps.length > 0 ? (
              <div className="space-y-8">
                {Object.entries(groupedSteps || {}).map(([stage, stageSteps]) => (
                  <Card key={stage}>
                    <CardHeader>
                      <CardTitle className="text-xl">
                        {stageLabels[stage as keyof typeof stageLabels]}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {stageSteps?.map((step) => {
                        const completed = isStepCompleted(step.id);
                        const viewed = isStepViewed(step.id);
                        return (
                          <div
                            key={step.id}
                            className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                          >
                            <Checkbox
                              checked={completed}
                              onCheckedChange={() => handleToggleStep(step.id, completed)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <h4 className={`font-medium ${completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                    {step.title}
                                  </h4>
                                  {viewed && !completed && (
                                    <span className="text-xs text-muted-foreground">👁️</span>
                                  )}
                                </div>
                                {step.url && (
                                  <a
                                    href={step.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleLinkClick(step.id);
                                    }}
                                  >
                                    <Button
                                      variant={viewed ? "secondary" : "outline"}
                                      size="sm"
                                      className="gap-2 shrink-0"
                                    >
                                      {viewed ? "Visualizado" : "Acessar"}
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  </a>
                                )}
                              </div>
                              {step.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {step.description}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Ainda não há checklist disponível para este país. Entre em contato com o suporte.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {!selectedCountryId && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Selecione um país acima para visualizar o checklist
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
