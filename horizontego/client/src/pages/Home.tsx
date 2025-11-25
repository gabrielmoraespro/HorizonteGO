import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { CheckCircle2, Globe, Calculator, FileText, Shield, TrendingUp, MapPin, Clock, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user?.hasPaid) {
    window.location.href = "/dashboard";
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* DARK HERO SECTION */}
      <div className="gradient-hero-dark text-white">
        {/* Premium Glass Header */}
        <header className="glass-dark sticky top-0 z-50 border-b border-white/10">
          <div className="container py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Globe className="h-7 w-7 text-cyan-400" />
                <div className="absolute inset-0 blur-lg bg-cyan-400/30 -z-10"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                HorizonteGo
              </span>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <Link href="/dashboard">
                  <Button size="lg" className="glow-primary bg-cyan-500 hover:bg-cyan-600 text-white">
                    Ir para Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <a href={getLoginUrl()}>
                    <Button variant="ghost" size="lg" className="hidden sm:inline-flex text-white hover:bg-white/10">
                      Entrar
                    </Button>
                  </a>
                  <a href={getLoginUrl()}>
                    <Button size="lg" className="glow-primary bg-cyan-500 hover:bg-cyan-600 text-white">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Começar Agora
                    </Button>
                  </a>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section with Dark Gradient */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.65_0.19_195/0.15),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,oklch(0.62_0.18_280/0.15),transparent_50%)]"></div>
          
          <div className="container relative">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4" />
                Plataforma #1 para Seasonal Workers
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                Trabalhe no Exterior com{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">
                  Segurança
                </span>{" "}
                e{" "}
                <span className="bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
                  Clareza
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed">
                A plataforma completa para brasileiros que desejam trabalhar como seasonal workers no Canadá, Noruega e outros países.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <Link href="/pricing">
                  <Button size="lg" className="text-lg px-10 py-6 glow-primary bg-cyan-500 hover:bg-cyan-600 text-white">
                    Ver Planos e Preços
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/jobs">
                  <Button size="lg" variant="outline" className="text-lg px-10 py-6 border-2 border-white/20 text-white hover:bg-white/10">
                    Ver Vagas Disponíveis
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-cyan-400">500+</div>
                  <div className="text-sm text-white/60 mt-1">Vagas Verificadas</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-purple-400">1000+</div>
                  <div className="text-sm text-white/60 mt-1">Usuários Ativos</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-cyan-300">95%</div>
                  <div className="text-sm text-white/60 mt-1">Taxa de Sucesso</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* SOFT PASTEL SECTIONS */}
      
      {/* Features Grid - Soft Pastel Cards */}
      <section className="py-24 bg-background relative">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Tudo que Você Precisa em{" "}
              <span className="bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                Um Só Lugar
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ferramentas completas para tornar sua jornada mais simples, segura e organizada.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: CheckCircle2,
                title: "Checklist Guiado",
                description: "Passo a passo completo por país, desde a preparação até o embarque.",
                color: "text-cyan-600",
                bgColor: "bg-cyan-50",
              },
              {
                icon: MapPin,
                title: "Vagas Verificadas",
                description: "Acesso a vagas reais e verificadas do Canadá e Noruega.",
                color: "text-purple-600",
                bgColor: "bg-purple-50",
              },
              {
                icon: Calculator,
                title: "Calculadora Financeira",
                description: "Calcule quanto você pode economizar e projeções realistas.",
                color: "text-cyan-600",
                bgColor: "bg-cyan-50",
              },
              {
                icon: FileText,
                title: "Gerador de Documentos",
                description: "Crie currículos e cartas de apresentação profissionais.",
                color: "text-purple-600",
                bgColor: "bg-purple-50",
              },
              {
                icon: Shield,
                title: "Módulo Antigolpe",
                description: "Dicas de segurança e checklists de verificação contra fraudes.",
                color: "text-emerald-600",
                bgColor: "bg-emerald-50",
              },
              {
                icon: TrendingUp,
                title: "Acompanhamento",
                description: "Visualize seu progresso e próximas etapas.",
                color: "text-amber-600",
                bgColor: "bg-amber-50",
              },
            ].map((feature, i) => (
              <Card
                key={i}
                className="gradient-card-soft border border-border p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Soft Background */}
      <section className="py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Como Funciona</h2>
            <p className="text-xl text-muted-foreground">
              Em poucos passos, você estará pronto para iniciar sua jornada internacional.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: "1", title: "Cadastre-se", description: "Crie sua conta e escolha o país de destino.", color: "from-cyan-500 to-cyan-600" },
              { step: "2", title: "Acesse o Conteúdo", description: "Com um pagamento único, tenha acesso completo a todas as ferramentas.", color: "from-purple-500 to-purple-600" },
              { step: "3", title: "Comece Sua Jornada", description: "Siga o checklist, aplique para vagas e prepare-se para mudar de vida.", color: "from-emerald-500 to-emerald-600" },
            ].map((item, i) => (
              <div key={i} className="text-center relative">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${item.color} text-white text-2xl font-bold mb-6 shadow-lg`}>
                  {item.step}
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-foreground">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                {i < 2 && (
                  <ArrowRight className="hidden md:block absolute top-8 -right-4 h-6 w-6 text-muted-foreground/40" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Soft Gradient */}
      <section className="py-24 bg-gradient-to-r from-cyan-50 to-purple-50 relative overflow-hidden">
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Pronto para Mudar de Vida?
            </h2>
            <p className="text-xl text-muted-foreground">
              Junte-se a centenas de brasileiros que estão realizando o sonho de trabalhar no exterior com segurança e clareza.
            </p>
            <Link href="/pricing">
              <Button size="lg" className="text-lg px-12 py-7 glow-primary bg-cyan-500 hover:bg-cyan-600 text-white">
                Ver Planos e Começar
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Soft Tone */}
      <footer className="border-t border-border py-12 bg-card">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-6 w-6 text-cyan-600" />
                <span className="text-xl font-bold text-foreground">HorizonteGo</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Sua plataforma completa para trabalhar como seasonal worker no exterior.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Links Úteis</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/pricing" className="hover:text-cyan-600 transition-colors">Sobre Nós</Link></li>
                <li><Link href="/pricing" className="hover:text-cyan-600 transition-colors">FAQ</Link></li>
                <li><Link href="/pricing" className="hover:text-cyan-600 transition-colors">Contato</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/pricing" className="hover:text-cyan-600 transition-colors">Política de Privacidade</Link></li>
                <li><Link href="/pricing" className="hover:text-cyan-600 transition-colors">Termos de Uso</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2025 HorizonteGo. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
