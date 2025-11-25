import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, FileText, Download, Trash2, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Documents() {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [generatedTitle, setGeneratedTitle] = useState("");

  // Form state
  const [docType, setDocType] = useState<"resume" | "cover_letter" | "email">("resume");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [education, setEducation] = useState("");
  const [targetCountry, setTargetCountry] = useState("CAN");
  const [targetPosition, setTargetPosition] = useState("");
  const [language, setLanguage] = useState("pt-BR");

  const { data: documents, isLoading } = trpc.documents.list.useQuery(undefined, {
    enabled: !!user && (user.hasPaid || user.role === 'admin'),
  });
  const { data: countries } = trpc.countries.list.useQuery();

  // Calculate document limit based on plan
  const getDocumentLimit = () => {
    if (!user) return 0;
    if (user.role === 'admin') return 999;
    if (user.plan === 'pro') return 999; // Unlimited
    if (user.plan === 'starter') return 10;
    return 1; // Free plan
  };

  const documentLimit = getDocumentLimit();
  const documentsUsed = documents?.length || 0;
  const canGenerateMore = documentsUsed < documentLimit;

  const utils = trpc.useUtils();
  const generateMutation = trpc.documents.generate.useMutation({
    onSuccess: (data) => {
      setGeneratedContent(data.content);
      setGeneratedTitle(data.title);
      setIsGenerating(false);
      utils.documents.list.invalidate();
      toast.success("Documento gerado com sucesso!");
    },
    onError: () => {
      setIsGenerating(false);
      toast.error("Erro ao gerar documento");
    },
  });

  const deleteMutation = trpc.documents.delete.useMutation({
    onSuccess: () => {
      utils.documents.list.invalidate();
      toast.success("Documento excluído");
    },
  });

  const handleGenerate = () => {
    if (!fullName || !email || !experience || !skills) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    setIsGenerating(true);
    generateMutation.mutate({
      type: docType,
      personalInfo: { fullName, email, phone, location },
      professionalInfo: { experience, skills, education },
      targetCountry,
      targetPosition,
      language,
    });
  };

  const handleDownload = (content: string, title: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const docTypeLabels = {
    resume: "Currículo",
    cover_letter: "Carta de Apresentação",
    email: "Email de Candidatura",
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
          <span className="text-xl font-bold text-foreground">Gerador de Documentos</span>
          <div className="w-32"></div>
        </div>
      </header>

      <div className="container py-8 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Generator Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-6 w-6 text-primary" />
                  Criar Novo Documento
                </CardTitle>
                <CardDescription>
                  Preencha seus dados e gere documentos profissionais com IA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Limit indicator */}
                <div className={`p-3 rounded-lg border ${
                  canGenerateMore ? 'bg-secondary/10 border-secondary/20' : 'bg-destructive/10 border-destructive/20'
                }`}>
                  <p className="text-sm font-medium">
                    Documentos: {documentsUsed} de {documentLimit === 999 ? 'ilimitados' : documentLimit}
                  </p>
                  {!canGenerateMore && (
                    <p className="text-sm text-destructive mt-1">
                      Limite atingido. Faça upgrade para gerar mais documentos.
                    </p>
                  )}
                  {user?.plan === 'free' && (
                    <Button asChild variant="link" size="sm" className="p-0 h-auto mt-2">
                      <Link href="/pricing">Ver planos pagos</Link>
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Documento</Label>
                  <Select value={docType} onValueChange={(v: any) => setDocType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resume">Currículo</SelectItem>
                      <SelectItem value="cover_letter">Carta de Apresentação</SelectItem>
                      <SelectItem value="email">Email de Candidatura</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Nome Completo *</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Localização</Label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Cidade, Estado" />
                </div>

                <div className="space-y-2">
                  <Label>Experiência Profissional *</Label>
                  <Textarea
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="Descreva sua experiência de trabalho relevante..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Habilidades *</Label>
                  <Textarea
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="Liste suas principais habilidades..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Educação</Label>
                  <Textarea
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="Formação acadêmica..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>País de Destino</Label>
                  <Select value={targetCountry} onValueChange={setTargetCountry}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countries?.map((country) => (
                        <SelectItem key={country.id} value={country.code}>
                          {country.flagEmoji} {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Cargo Desejado</Label>
                  <Input
                    value={targetPosition}
                    onChange={(e) => setTargetPosition(e.target.value)}
                    placeholder="Ex: Farm Worker, Hotel Staff"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Idioma do Documento</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full"
                  onClick={handleGenerate}
                  disabled={isGenerating || !canGenerateMore}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    "Gerar Documento"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Generated Document Preview */}
            {generatedContent && (
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle>{generatedTitle}</CardTitle>
                  <CardDescription>Documento gerado recentemente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm">{generatedContent}</pre>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => handleDownload(generatedContent, generatedTitle)}
                  >
                    <Download className="h-4 w-4" />
                    Baixar Documento
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Saved Documents */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-secondary" />
                  Documentos Salvos
                </CardTitle>
                <CardDescription>
                  Seus documentos gerados anteriormente
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : documents && documents.length > 0 ? (
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <Card key={doc.id} className="border">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base">{doc.title}</CardTitle>
                              <CardDescription className="text-xs">
                                {docTypeLabels[doc.type]} • {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                              </CardDescription>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteMutation.mutate({ id: doc.id })}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="w-full">
                                Ver Conteúdo
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{doc.title}</DialogTitle>
                                <DialogDescription>
                                  Criado em {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="bg-muted/50 p-4 rounded-lg">
                                <pre className="whitespace-pre-wrap text-sm">{doc.content}</pre>
                              </div>
                              <Button
                                variant="outline"
                                className="gap-2"
                                onClick={() => handleDownload(doc.content, doc.title)}
                              >
                                <Download className="h-4 w-4" />
                                Baixar
                              </Button>
                            </DialogContent>
                          </Dialog>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Você ainda não gerou nenhum documento. Use o formulário ao lado para começar.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
