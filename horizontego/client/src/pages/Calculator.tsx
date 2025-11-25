import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Calculator as CalcIcon, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Calculator() {
  const [monthlySalary, setMonthlySalary] = useState("");
  const [currency, setCurrency] = useState("CAD");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [durationMonths, setDurationMonths] = useState("6");
  const [housingIncluded, setHousingIncluded] = useState(false);
  const [mealsIncluded, setMealsIncluded] = useState(false);
  const [result, setResult] = useState<any>(null);

  const calculateMutation = trpc.calculator.calculate.useMutation({
    onSuccess: (data) => {
      setResult(data);
    },
    onError: () => {
      toast.error("Erro ao calcular. Tente novamente.");
    },
  });

  const handleCalculate = () => {
    if (!monthlySalary || !monthlyExpenses || !durationMonths) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    calculateMutation.mutate({
      monthlySalary: parseFloat(monthlySalary),
      currency,
      monthlyExpenses: parseFloat(monthlyExpenses),
      durationMonths: parseInt(durationMonths),
      housingIncluded,
      mealsIncluded,
    });
  };

  const formatCurrency = (value: number, curr: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: curr === 'CAD' ? 'CAD' : curr === 'NOK' ? 'NOK' : 'BRL',
    }).format(value);
  };

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
          <span className="text-xl font-bold text-foreground">Calculadora Financeira</span>
          <div className="w-32"></div>
        </div>
      </header>

      <div className="container py-8 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalcIcon className="h-6 w-6 text-primary" />
                Dados da Simulação
              </CardTitle>
              <CardDescription>
                Preencha as informações para calcular sua economia potencial
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="salary">Salário Mensal Esperado</Label>
                <Input
                  id="salary"
                  type="number"
                  placeholder="3000"
                  value={monthlySalary}
                  onChange={(e) => setMonthlySalary(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Moeda</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAD">CAD - Dólar Canadense</SelectItem>
                    <SelectItem value="NOK">NOK - Coroa Norueguesa</SelectItem>
                    <SelectItem value="BRL">BRL - Real Brasileiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expenses">Despesas Mensais Estimadas</Label>
                <Input
                  id="expenses"
                  type="number"
                  placeholder="1500"
                  value={monthlyExpenses}
                  onChange={(e) => setMonthlyExpenses(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duração do Contrato (meses)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="6"
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(e.target.value)}
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="housing"
                    checked={housingIncluded}
                    onCheckedChange={(checked) => setHousingIncluded(checked as boolean)}
                  />
                  <Label htmlFor="housing" className="font-normal cursor-pointer">
                    Moradia incluída
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="meals"
                    checked={mealsIncluded}
                    onCheckedChange={(checked) => setMealsIncluded(checked as boolean)}
                  />
                  <Label htmlFor="meals" className="font-normal cursor-pointer">
                    Refeições incluídas
                  </Label>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleCalculate}
                disabled={calculateMutation.isPending}
              >
                {calculateMutation.isPending ? "Calculando..." : "Calcular Economia"}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className={result ? "border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-secondary" />
                Resultado da Simulação
              </CardTitle>
              <CardDescription>
                Sua economia potencial trabalhando no exterior
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-sm text-muted-foreground">Renda Total</span>
                      <span className="font-semibold">{formatCurrency(result.totalIncome, result.currency)}</span>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-sm text-muted-foreground">Despesas Totais</span>
                      <span className="font-semibold">{formatCurrency(result.totalExpenses, result.currency)}</span>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-primary/20">
                      <span className="text-sm font-medium text-foreground">Economia Líquida</span>
                      <span className="font-bold text-lg text-secondary">
                        {formatCurrency(result.netSavings, result.currency)}
                      </span>
                    </div>

                    {result.currency !== 'BRL' && (
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-sm text-muted-foreground">Economia em Reais (BRL)</span>
                        <span className="font-bold text-xl text-primary">
                          {formatCurrency(result.netSavingsBRL, 'BRL')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium text-foreground">Dicas para Maximizar sua Economia:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      {!housingIncluded && <li>Procure vagas que incluam moradia</li>}
                      {!mealsIncluded && <li>Vagas com refeições incluídas economizam muito</li>}
                      <li>Considere compartilhar moradia se possível</li>
                      <li>Planeje um orçamento mensal e acompanhe gastos</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <CalcIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Preencha os dados ao lado e clique em "Calcular Economia" para ver os resultados
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Sobre a Calculadora</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Esta calculadora fornece uma estimativa baseada nos dados que você forneceu. Os valores reais podem variar dependendo de diversos fatores como impostos, taxas de câmbio, custo de vida local e benefícios adicionais.
            </p>
            <p>
              Use esta ferramenta como um guia para planejar suas finanças, mas sempre pesquise mais sobre o custo de vida real no país de destino.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
