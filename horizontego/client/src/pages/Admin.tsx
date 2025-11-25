import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Plus, Trash2, Edit, Shield, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not admin
  if (!authLoading && user?.role !== 'admin') {
    setLocation("/dashboard");
    return null;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
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
          <span className="text-xl font-bold text-foreground">Painel Administrativo</span>
          <div className="w-32"></div>
        </div>
      </header>

      <div className="container py-8 max-w-6xl">
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="jobs">Vagas</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="countries">Países</TabsTrigger>
          </TabsList>

          {/* Jobs Management */}
          <TabsContent value="jobs">
            <JobsManagement />
          </TabsContent>

          {/* Security Tips Management */}
          <TabsContent value="security">
            <SecurityManagement />
          </TabsContent>

          {/* Countries Management */}
          <TabsContent value="countries">
            <CountriesManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function JobsManagement() {
  const [isCreating, setIsCreating] = useState(false);
  const { data: jobs, isLoading } = trpc.jobs.list.useQuery({});
  const { data: countries } = trpc.countries.list.useQuery();

  const utils = trpc.useUtils();
  const deleteMutation = trpc.jobs.delete.useMutation({
    onSuccess: () => {
      utils.jobs.list.invalidate();
      toast.success("Vaga excluída");
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gerenciar Vagas</CardTitle>
              <CardDescription>Adicione, edite ou remova vagas de trabalho</CardDescription>
            </div>
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Vaga
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Vaga</DialogTitle>
                  <DialogDescription>Preencha os detalhes da vaga</DialogDescription>
                </DialogHeader>
                <CreateJobForm countries={countries || []} onSuccess={() => setIsCreating(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : jobs && jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map((job) => {
                const country = countries?.find(c => c.id === job.countryId);
                return (
                  <Card key={job.id} className="border">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{job.title}</CardTitle>
                          <CardDescription className="text-xs">
                            {country?.flagEmoji} {country?.name} • {job.company || "N/A"}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate({ id: job.id })}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Nenhuma vaga cadastrada</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CreateJobForm({ countries, onSuccess }: { countries: any[]; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    countryId: "",
    title: "",
    company: "",
    location: "",
    description: "",
    requirements: "",
    benefits: "",
    salary: "",
    sourceUrl: "",
    sourceName: "",
    isVerified: true,
  });

  const utils = trpc.useUtils();
  const createMutation = trpc.jobs.create.useMutation({
    onSuccess: () => {
      utils.jobs.list.invalidate();
      toast.success("Vaga criada com sucesso!");
      onSuccess();
    },
    onError: () => {
      toast.error("Erro ao criar vaga");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.countryId || !formData.title) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    createMutation.mutate({
      countryId: parseInt(formData.countryId),
      title: formData.title,
      company: formData.company || undefined,
      location: formData.location || undefined,
      description: formData.description || undefined,
      requirements: formData.requirements || undefined,
      benefits: formData.benefits || undefined,
      salary: formData.salary || undefined,
      sourceUrl: formData.sourceUrl || undefined,
      sourceName: formData.sourceName || undefined,
      isVerified: formData.isVerified,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>País *</Label>
        <Select value={formData.countryId} onValueChange={(v) => setFormData({ ...formData, countryId: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o país" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((c) => (
              <SelectItem key={c.id} value={c.id.toString()}>
                {c.flagEmoji} {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Título da Vaga *</Label>
        <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
      </div>

      <div className="space-y-2">
        <Label>Empresa</Label>
        <Input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
      </div>

      <div className="space-y-2">
        <Label>Localização</Label>
        <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
      </div>

      <div className="space-y-2">
        <Label>Descrição</Label>
        <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
      </div>

      <div className="space-y-2">
        <Label>Requisitos</Label>
        <Textarea value={formData.requirements} onChange={(e) => setFormData({ ...formData, requirements: e.target.value })} rows={3} />
      </div>

      <div className="space-y-2">
        <Label>Benefícios (separados por vírgula)</Label>
        <Input value={formData.benefits} onChange={(e) => setFormData({ ...formData, benefits: e.target.value })} placeholder="Moradia, Refeições, Transporte" />
      </div>

      <div className="space-y-2">
        <Label>Salário</Label>
        <Input value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} placeholder="CAD 3000/mês" />
      </div>

      <div className="space-y-2">
        <Label>URL da Fonte</Label>
        <Input value={formData.sourceUrl} onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })} placeholder="https://..." />
      </div>

      <div className="space-y-2">
        <Label>Nome da Fonte</Label>
        <Input value={formData.sourceName} onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })} placeholder="Job Bank Canada" />
      </div>

      <Button type="submit" className="w-full" disabled={createMutation.isPending}>
        {createMutation.isPending ? "Criando..." : "Criar Vaga"}
      </Button>
    </form>
  );
}

function SecurityManagement() {
  const [isCreating, setIsCreating] = useState(false);
  const { data: tips, isLoading } = trpc.security.getTips.useQuery();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Dicas de Segurança</CardTitle>
              <CardDescription>Gerencie alertas e dicas de segurança</CardDescription>
            </div>
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Dica
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Adicionar Dica de Segurança</DialogTitle>
                </DialogHeader>
                <CreateSecurityTipForm onSuccess={() => setIsCreating(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : tips && tips.length > 0 ? (
            <div className="space-y-3">
              {tips.map((tip) => (
                <Card key={tip.id} className="border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{tip.title}</CardTitle>
                    <CardDescription className="text-xs">{tip.category} • {tip.severity}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Nenhuma dica cadastrada</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CreateSecurityTipForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    category: "safety_tip" as const,
    title: "",
    description: "",
    severity: "medium" as const,
  });

  const utils = trpc.useUtils();
  const createMutation = trpc.security.createTip.useMutation({
    onSuccess: () => {
      utils.security.getTips.invalidate();
      toast.success("Dica criada!");
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error("Preencha todos os campos");
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Categoria</Label>
        <Select value={formData.category} onValueChange={(v: any) => setFormData({ ...formData, category: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scam_alert">Alerta de Golpe</SelectItem>
            <SelectItem value="verification">Verificação</SelectItem>
            <SelectItem value="safety_tip">Dica de Segurança</SelectItem>
            <SelectItem value="official_resource">Recurso Oficial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Título</Label>
        <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
      </div>

      <div className="space-y-2">
        <Label>Descrição</Label>
        <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} />
      </div>

      <div className="space-y-2">
        <Label>Severidade</Label>
        <Select value={formData.severity} onValueChange={(v: any) => setFormData({ ...formData, severity: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Baixa</SelectItem>
            <SelectItem value="medium">Média</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={createMutation.isPending}>
        {createMutation.isPending ? "Criando..." : "Criar Dica"}
      </Button>
    </form>
  );
}

function CountriesManagement() {
  const [isCreating, setIsCreating] = useState(false);
  const { data: countries, isLoading } = trpc.countries.list.useQuery();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gerenciar Países</CardTitle>
              <CardDescription>Adicione novos países à plataforma</CardDescription>
            </div>
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo País
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo País</DialogTitle>
                </DialogHeader>
                <CreateCountryForm onSuccess={() => setIsCreating(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : countries && countries.length > 0 ? (
            <div className="grid gap-4">
              {countries.map((country) => (
                <Card key={country.id} className="border">
                  <CardHeader>
                    <CardTitle className="text-base">
                      {country.flagEmoji} {country.name}
                    </CardTitle>
                    <CardDescription>{country.code} • {country.currency}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Nenhum país cadastrado</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CreateCountryForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    currency: "",
    flagEmoji: "",
    description: "",
  });

  const utils = trpc.useUtils();
  const createMutation = trpc.admin.createCountry.useMutation({
    onSuccess: () => {
      utils.countries.list.invalidate();
      toast.success("País criado!");
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.currency) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Nome do País *</Label>
        <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
      </div>

      <div className="space-y-2">
        <Label>Código (3 letras) *</Label>
        <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} maxLength={3} />
      </div>

      <div className="space-y-2">
        <Label>Moeda *</Label>
        <Input value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })} maxLength={3} />
      </div>

      <div className="space-y-2">
        <Label>Emoji da Bandeira</Label>
        <Input value={formData.flagEmoji} onChange={(e) => setFormData({ ...formData, flagEmoji: e.target.value })} />
      </div>

      <div className="space-y-2">
        <Label>Descrição</Label>
        <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
      </div>

      <Button type="submit" className="w-full" disabled={createMutation.isPending}>
        {createMutation.isPending ? "Criando..." : "Criar País"}
      </Button>
    </form>
  );
}
