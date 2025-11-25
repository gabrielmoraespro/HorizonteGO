import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ExternalLink, Heart, MapPin, DollarSign, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Jobs() {
  const { user } = useAuth();
  const [selectedCountryId, setSelectedCountryId] = useState<number | undefined>();
  const [locationFilter, setLocationFilter] = useState<string | undefined>();
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [languageFilter, setLanguageFilter] = useState<string | undefined>();
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<string | undefined>();
  const [remoteWorkFilter, setRemoteWorkFilter] = useState<boolean | undefined>();
  
  const { data: countries } = trpc.countries.list.useQuery();
  const { data: jobs, isLoading, error } = trpc.jobs.list.useQuery({
    countryId: selectedCountryId,
    isActive: true,
    location: locationFilter,
    category: categoryFilter,
    language: languageFilter,
    employmentType: employmentTypeFilter,
    remoteWork: remoteWorkFilter,
  }, {
    enabled: !!user, // Free users can now view jobs
  });
  const { data: favorites } = trpc.favorites.list.useQuery(undefined, {
    enabled: !!user && (user.hasPaid || user.role === 'admin'),
  });

  const utils = trpc.useUtils();
  const toggleFavoriteMutation = trpc.favorites.toggle.useMutation({
    onSuccess: () => {
      utils.favorites.list.invalidate();
      toast.success("Favoritos atualizados!");
    },
  });

  const isFavorited = (jobId: number) => {
    return favorites?.some(f => f.jobId === jobId) || false;
  };

  const handleToggleFavorite = (jobId: number) => {
    toggleFavoriteMutation.mutate({ jobId });
  };

  const parseBenefits = (benefitsStr: string | null) => {
    if (!benefitsStr) return [];
    try {
      return JSON.parse(benefitsStr);
    } catch {
      return benefitsStr.split(',').map(b => b.trim());
    }
  };

  // Free users can view jobs but cannot apply
  const canApply = user && (user.plan !== 'free') && (user.hasPaid || user.role === 'admin');
  const isFreeUser = user && user.plan === 'free';

  // Removed paywall - free users can now view jobs
  if (false) { // Keep structure but disable
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Acesso Restrito - Plano Pago Necessário</CardTitle>
            <CardDescription>
              A lista de vagas verificadas está disponível apenas para usuários com plano pago.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Com um plano pago, você terá acesso a:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                <span>Vagas reais e verificadas do Canadá e Noruega</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                <span>Filtros avançados por país, área e benefícios</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                <span>Sistema de favoritos e candidatura direta</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                <span>Atualizações regulares de novas vagas</span>
              </li>
            </ul>
            <div className="flex gap-3 pt-4">
              <Button asChild className="flex-1">
                <Link href="/pricing">Ver Planos e Preços</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/dashboard">Voltar ao Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <span className="text-xl font-bold text-foreground">Vagas Verificadas</span>
          <div className="w-32"></div>
        </div>
      </header>

      <div className="container py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Refine sua busca por país e outros critérios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">País</label>
                <Select
                  value={selectedCountryId?.toString() || "all"}
                  onValueChange={(value) => setSelectedCountryId(value === "all" ? undefined : parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os países" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os países</SelectItem>
                    {countries?.map((country) => (
                      <SelectItem key={country.id} value={country.id.toString()}>
                        {country.flagEmoji} {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Localização</label>
                <Select value={locationFilter || "all"} onValueChange={(v) => setLocationFilter(v === "all" ? undefined : v)}>
                  <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {Array.from(new Set(jobs?.map(j => j.location).filter(Boolean))).map(loc => (
                      <SelectItem key={loc} value={loc!}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <Select value={categoryFilter || "all"} onValueChange={(v) => setCategoryFilter(v === "all" ? undefined : v)}>
                  <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {Array.from(new Set(jobs?.map(j => j.category).filter(Boolean))).map(cat => (
                      <SelectItem key={cat} value={cat!}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Idioma</label>
                <Select value={languageFilter || "all"} onValueChange={(v) => setLanguageFilter(v === "all" ? undefined : v)}>
                  <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {Array.from(new Set(jobs?.map(j => j.language).filter(Boolean))).map(lang => (
                      <SelectItem key={lang} value={lang!}>{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Emprego</label>
                <Select value={employmentTypeFilter || "all"} onValueChange={(v) => setEmploymentTypeFilter(v === "all" ? undefined : v)}>
                  <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {Array.from(new Set(jobs?.map(j => j.employmentType).filter(Boolean))).map(type => (
                      <SelectItem key={type} value={type!}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Trabalho Remoto</label>
                <Select value={remoteWorkFilter === undefined ? "all" : remoteWorkFilter.toString()} onValueChange={(v) => setRemoteWorkFilter(v === "all" ? undefined : v === "true")}>
                  <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="true">Sim</SelectItem>
                    <SelectItem value="false">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Free User Banner */}
        {isFreeUser && (
          <Card className="border-amber-500/50 bg-amber-50/50">
            <CardContent className="py-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 mb-1">
                    Plano Gratuito - Visualização Limitada
                  </h3>
                  <p className="text-sm text-amber-800 mb-3">
                    Você pode visualizar todas as vagas, mas precisa de um plano pago para se candidatar.
                  </p>
                  <div className="flex gap-2">
                    <Link href="/pricing">
                      <Button size="sm" variant="default">
                        Ver Planos
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Jobs List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : jobs && jobs.length > 0 ? (
          <div className="grid gap-6">
            {jobs.map((job) => {
              const country = countries?.find(c => c.id === job.countryId);
              const benefits = parseBenefits(job.benefits);
              const favorited = isFavorited(job.id);

              return (
                <Card key={job.id} className="hover:border-primary/50 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {job.isVerified && (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Verificada
                            </Badge>
                          )}
                          {country && (
                            <Badge variant="outline">
                              {country.flagEmoji} {country.name}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-2xl">{job.title}</CardTitle>
                        {job.company && (
                          <CardDescription className="text-base mt-1">{job.company}</CardDescription>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleFavorite(job.id)}
                        className={favorited ? "text-red-500" : ""}
                      >
                        <Heart className={`h-5 w-5 ${favorited ? "fill-current" : ""}`} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {job.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                    )}

                    {job.salary && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>{job.salary}</span>
                      </div>
                    )}

                    {job.description && (
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Descrição</h4>
                        <p className="text-sm text-muted-foreground">{job.description}</p>
                      </div>
                    )}

                    {job.requirements && (
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Requisitos</h4>
                        <p className="text-sm text-muted-foreground">{job.requirements}</p>
                      </div>
                    )}

                    {benefits.length > 0 && (
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Benefícios</h4>
                        <div className="flex flex-wrap gap-2">
                          {benefits.map((benefit: string, idx: number) => (
                            <Badge key={idx} variant="outline">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {job.sourceUrl && (
                      <div className="pt-4 border-t">
                        <a
                          href={job.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block"
                        >
                          <Button variant="default" className="gap-2">
                            Ver Vaga Completa
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                        {job.sourceName && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Fonte: {job.sourceName}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Nenhuma vaga encontrada. Tente ajustar os filtros ou volte mais tarde.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
