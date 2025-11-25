import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
      <Card className="w-full max-w-lg mx-4 shadow-lg">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-destructive/10 rounded-full animate-pulse" />
              <AlertCircle className="relative h-20 w-20 text-destructive" />
            </div>
          </div>

          <h1 className="text-6xl font-bold text-foreground mb-3">404</h1>

          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Página Não Encontrada
          </h2>

          <p className="text-muted-foreground mb-8 leading-relaxed max-w-md mx-auto">
            Desculpe, a página que você está procurando não existe.
            Ela pode ter sido movida ou removida.
          </p>

          <Button
            onClick={() => setLocation("/")}
            size="lg"
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Voltar para Início
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
