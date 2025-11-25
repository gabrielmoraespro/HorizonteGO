import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, FileText, Calculator, MapPin, Shield, TrendingUp, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not logged in
  if (!authLoading && !user) {
    window.location.href = getLoginUrl();
    return null;
  }

  // Free users can access dashboard but with limited features

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
          <Link href="/">
            <span className="text-xl font-bold text-foreground cursor-pointer">HorizonteGo</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Olá, {user?.name || user?.email}</span>
            <Link href="/profile">
              <div className="flex items-center gap-2 cursor-pointer">
                {user?.profilePhotoUrl ? (
                  <img 
                    src={user.profilePhotoUrl} 
                    alt="Perfil" 
                    className="h-8 w-8 rounded-full object-cover border-2 border-primary"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">
                      {(user?.name || user?.email || "U")[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <Button variant="outline" size="sm">Perfil</Button>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Bem-vindo ao seu Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Aqui você encontra todas as ferramentas para sua jornada internacional.
          </p>
        </div>

        {/* Plan Card */}
        {user && (
          <Card className="mb-8 border-2 border-secondary/20 bg-gradient-to-br from-secondary/5 to-background">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    Plano Atual: {user.plan === 'free' ? 'Gratuito' : user.plan === 'starter' ? 'Starter' : 'Pro'}
                  </CardTitle>
                  <CardDescription>
                    {user.plan === 'free' && 'Faça upgrade para acessar todos os recursos'}
                    {user.plan === 'starter' && '3 candidaturas/dia, 10 documentos/mês'}
                    {user.plan === 'pro' && 'Acesso ilimitado a todos os recursos'}
                  </CardDescription>
                </div>
                {user.plan !== 'pro' && (
                  <Button asChild>
                    <Link href="/pricing">Fazer Upgrade</Link>
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Progress Overview */}
        <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Seu Progresso
            </CardTitle>
            <CardDescription>
              Acompanhe as etapas da sua jornada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {[
                { label: "Preparação", completed: false },
                { label: "Documentação", completed: false },
                { label: "Aplicação", completed: false },
                { label: "Entrevista", completed: false },
                { label: "Aprovação", completed: false },
                { label: "Embarque", completed: false },
              ].map((stage, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    stage.completed ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {stage.completed ? <CheckCircle2 className="h-6 w-6" /> : idx + 1}
                  </div>
                  <span className="text-xs text-center text-muted-foreground">{stage.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/checklist">
            <Card className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <CheckCircle2 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Checklist Guiado</CardTitle>
                <CardDescription>
                  Acompanhe todas as etapas necessárias para trabalhar no exterior
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Acessar Checklist</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/jobs">
            <Card className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <MapPin className="h-10 w-10 text-secondary mb-2" />
                <CardTitle>Vagas Verificadas</CardTitle>
                <CardDescription>
                  Explore oportunidades de trabalho em diversos países
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Ver Vagas</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/calculator">
            <Card className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <Calculator className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Calculadora Financeira</CardTitle>
                <CardDescription>
                  Calcule quanto você pode economizar trabalhando no exterior
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Calcular</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/documents">
            <Card className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <FileText className="h-10 w-10 text-secondary mb-2" />
                <CardTitle>Gerar Documentos</CardTitle>
                <CardDescription>
                  Crie currículos e cartas de apresentação profissionais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Criar Documento</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/security">
            <Card className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Segurança</CardTitle>
                <CardDescription>
                  Aprenda a identificar golpes e trabalhar com segurança
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Ver Dicas</Button>
              </CardContent>
            </Card>
          </Link>

          {user?.role === 'admin' && (
            <Link href="/admin">
              <Card className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg border-2 border-primary/30">
                <CardHeader>
                  <Shield className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Painel Admin</CardTitle>
                  <CardDescription>
                    Gerenciar vagas, conteúdo e usuários
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="secondary">Acessar Admin</Button>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
