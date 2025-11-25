import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-2 border-secondary/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-secondary" />
          </div>
          <CardTitle className="text-2xl">Pagamento Confirmado!</CardTitle>
          <CardDescription className="text-base">
            Seu pagamento foi processado com sucesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-muted-foreground">
            Parabéns! Agora você tem acesso completo a todas as ferramentas do HorizonteGo. 
            Comece sua jornada para trabalhar no exterior com segurança e clareza.
          </p>
          
          <Link href="/dashboard">
            <Button size="lg" className="w-full">
              Ir para o Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
