import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Loader2, Upload, FileText, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { useState } from "react";

export default function Applications() {
  const { user, loading: authLoading } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: stats, isLoading: statsLoading } = trpc.applications.stats.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: applications, isLoading: appsLoading } = trpc.applications.list.useQuery(undefined, {
    enabled: !!user,
  });

  const uploadResumeMutation = trpc.applications.uploadResume.useMutation({
    onSuccess: () => {
      toast.success("Currículo enviado com sucesso!");
      setSelectedFile(null);
      setUploading(false);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar currículo");
      setUploading(false);
    },
  });

  if (authLoading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Login Necessário</CardTitle>
            <CardDescription>Faça login para acessar suas candidaturas</CardDescription>
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Apenas arquivos PDF são permitidos");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("O arquivo deve ter no máximo 5MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      const base64Data = base64.split(",")[1];

      uploadResumeMutation.mutate({
        fileName: selectedFile.name,
        fileData: base64Data,
        mimeType: selectedFile.type,
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  const planName = user.plan === "free" ? "Gratuito" : user.plan === "starter" ? "Starter" : "Pro";
  const dailyLimit = stats?.dailyLimit || 0;
  const remaining = stats?.remaining || 0;
  const todayCount = stats?.todayCount || 0;
  const progressPercent = dailyLimit > 0 ? (todayCount / dailyLimit) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Minhas Candidaturas</h1>
          <p className="text-muted-foreground">
            Gerencie seu currículo e acompanhe suas candidaturas
          </p>
        </div>

        {/* Stats Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Limite de Candidaturas - Plano {planName}</CardTitle>
            <CardDescription>
              Você pode enviar até {dailyLimit} candidaturas por dia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Hoje: {todayCount} de {dailyLimit}</span>
                <span className="font-medium text-foreground">{remaining} restantes</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            {remaining === 0 && dailyLimit > 0 && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-destructive">Limite diário atingido</p>
                  <p className="text-muted-foreground mt-1">
                    Faça upgrade do seu plano para enviar mais candidaturas por dia.
                  </p>
                  <Button asChild variant="destructive" size="sm" className="mt-2">
                    <Link href="/pricing">Ver Planos</Link>
                  </Button>
                </div>
              </div>
            )}

            {dailyLimit === 0 && (
              <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Plano Gratuito</p>
                  <p className="text-muted-foreground mt-1">
                    Faça upgrade para começar a enviar candidaturas diretamente pela plataforma.
                  </p>
                  <Button asChild variant="default" size="sm" className="mt-2">
                    <Link href="/pricing">Ver Planos</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resume Upload */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Seu Currículo
            </CardTitle>
            <CardDescription>
              Faça upload do seu currículo em PDF para candidatar-se às vagas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.resumeUrl ? (
              <div className="flex items-center justify-between p-4 bg-secondary/20 border border-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary" />
                  <div>
                    <p className="font-medium text-foreground">Currículo enviado</p>
                    <p className="text-sm text-muted-foreground">
                      Atualizado em {new Date(user.resumeUploadedAt || "").toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={user.resumeUrl} target="_blank" rel="noopener noreferrer">
                    Visualizar
                  </a>
                </Button>
              </div>
            ) : (
              <div className="text-center p-8 border-2 border-dashed border-muted rounded-lg">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Nenhum currículo enviado</p>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Arquivo selecionado: {selectedFile.name}
                  </p>
                )}
              </div>

              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    {user.resumeUrl ? "Atualizar Currículo" : "Enviar Currículo"}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Histórico de Candidaturas
            </CardTitle>
            <CardDescription>
              Acompanhe todas as suas candidaturas enviadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {appsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : applications && applications.length > 0 ? (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-foreground">Vaga #{app.jobId}</p>
                      <p className="text-sm text-muted-foreground">
                        Enviada em {new Date(app.appliedAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <Badge
                      variant={
                        app.status === "sent" ? "default" :
                        app.status === "failed" ? "destructive" : "secondary"
                      }
                    >
                      {app.status === "sent" ? "Enviada" :
                       app.status === "failed" ? "Falhou" : "Pendente"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhuma candidatura enviada ainda</p>
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link href="/jobs">Ver Vagas Disponíveis</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
