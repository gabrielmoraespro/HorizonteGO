import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Search, Globe, Briefcase, AlertCircle } from "lucide-react";
import { APP_TITLE, getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function Professions() {
  const { user, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const { data: results, isLoading, error } = trpc.professions.search.useQuery(
    { query: searchTerm },
    { enabled: hasSearched && searchTerm.length > 2 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.length > 2) {
      setHasSearched(true);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>
              Faça login para acessar a busca de equivalência de profissões
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Fazer Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user has paid
  if (!user.hasPaid && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Recurso Premium</CardTitle>
            <CardDescription>
              A busca de equivalência de profissões está disponível apenas para usuários com plano pago
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Com este recurso, você pode encontrar equivalentes internacionais para sua profissão brasileira,
              facilitando a busca por vagas no exterior.
            </p>
            <Button asChild className="w-full">
              <Link href="/pricing">Ver Planos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold text-primary cursor-pointer">{APP_TITLE}</h1>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/jobs">
              <Button variant="ghost">Vagas</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Busca de Equivalência de Profissões
            </h1>
            <p className="text-lg text-gray-600">
              Encontre equivalentes internacionais para sua profissão brasileira
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Buscar Profissão
              </CardTitle>
              <CardDescription>
                Digite sua profissão em português para encontrar equivalentes internacionais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Ex: Engenheiro Civil, Enfermeiro, Chef de Cozinha..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || searchTerm.length < 3}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Buscar
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erro ao buscar profissões. Tente novamente.
              </AlertDescription>
            </Alert>
          )}

          {hasSearched && !isLoading && results && results.length === 0 && (
            <Alert>
              <AlertDescription>
                Nenhuma profissão encontrada para "{searchTerm}". Tente outro termo.
              </AlertDescription>
            </Alert>
          )}

          {results && results.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">
                Resultados ({results.length})
              </h2>
              {results.map((profession: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      {profession.title}
                    </CardTitle>
                    {profession.alternativeLabels && profession.alternativeLabels.length > 0 && (
                      <CardDescription>
                        Também conhecido como: {profession.alternativeLabels.join(", ")}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profession.description && (
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Descrição</h4>
                        <p className="text-sm text-gray-600">{profession.description}</p>
                      </div>
                    )}

                    {profession.sector && (
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Setor</h4>
                        <p className="text-sm text-gray-600">{profession.sector}</p>
                      </div>
                    )}

                    {profession.internationalEquivalents && profession.internationalEquivalents.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Equivalentes Internacionais
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {profession.internationalEquivalents.map((equiv: string, i: number) => (
                            <span
                              key={i}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                            >
                              {equiv}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
