import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import { Link } from "wouter";

export default function PaymentCancel() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-2 border-muted">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <XCircle className="h-10 w-10 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Pagamento Cancelado</CardTitle>
          <CardDescription className="text-base">
            Você cancelou o processo de pagamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-muted-foreground">
            Não se preocupe! Você pode tentar novamente quando estiver pronto. 
            Estamos aqui para ajudar você a alcançar seu objetivo.
          </p>
          
          <div className="flex flex-col gap-3">
            <Link href="/payment">
              <Button size="lg" className="w-full">
                Tentar Novamente
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="w-full">
                Voltar para Início
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
