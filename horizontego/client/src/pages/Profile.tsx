import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, User, Mail, CreditCard, FileText, Briefcase, Heart, CheckCircle2, XCircle, Clock } from "lucide-react";
import { APP_TITLE } from "@/const";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const { data: stats } = trpc.profile.getStats.useQuery(undefined, { enabled: !!user });
  const { data: applications } = trpc.applications.list.useQuery(undefined, { enabled: !!user });
  const { data: favorites } = trpc.favorites.list.useQuery(undefined, { enabled: !!user });

  const updateNameMutation = trpc.profile.updateName.useMutation({
    onSuccess: () => {
      toast.success("Nome atualizado com sucesso!");
      setIsEditingName(false);
      window.location.reload();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar nome: ${error.message}`);
    },
  });

  const updateEmailMutation = trpc.profile.updateEmail.useMutation({
    onSuccess: () => {
      toast.success("Email atualizado com sucesso!");
      setIsEditingEmail(false);
      window.location.reload();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar email: ${error.message}`);
    },
  });

  const removeFavoriteMutation = trpc.favorites.toggle.useMutation({
    onSuccess: () => {
      toast.success("Vaga removida dos favoritos");
      window.location.reload();
    },
  });

  const uploadPhotoMutation = trpc.profile.uploadProfilePhoto.useMutation({
    onSuccess: () => {
      toast.success("Foto atualizada com sucesso!");
      setPhotoPreview(null);
      window.location.reload();
    },
    onError: (error) => {
      toast.error(`Erro ao fazer upload: ${error.message}`);
    },
  });

  const removePhotoMutation = trpc.profile.removeProfilePhoto.useMutation({
    onSuccess: () => {
      toast.success("Foto removida com sucesso!");
      window.location.reload();
    },
  });

  const uploadResumeMutation = trpc.profile.uploadResume.useMutation({
    onSuccess: () => {
      toast.success("Currículo enviado com sucesso!");
      setResumeFile(null);
      window.location.reload();
    },
    onError: (error) => {
      toast.error(`Erro ao enviar currículo: ${error.message}`);
    },
  });

  const removeResumeMutation = trpc.profile.removeResume.useMutation({
    onSuccess: () => {
      toast.success("Currículo removido com sucesso!");
      window.location.reload();
    },
  });

  const createBillingPortalMutation = trpc.payment.createBillingPortalSession.useMutation({
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error) => {
      toast.error(`Erro ao abrir portal: ${error.message}`);
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  const handleUpdateName = () => {
    if (newName.trim()) {
      updateNameMutation.mutate({ name: newName.trim() });
    }
  };

  const handleUpdateEmail = () => {
    if (newEmail.trim()) {
      updateEmailMutation.mutate({ email: newEmail.trim() });
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Imagem muito grande. Máximo 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = () => {
    if (photoPreview) {
      const filename = `photo-${Date.now()}.jpg`;
      uploadPhotoMutation.mutate({ file: photoPreview, filename });
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error("Apenas arquivos PDF são permitidos.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Arquivo muito grande. Máximo 10MB.");
        return;
      }
      setResumeFile(file);
    }
  };

  const handleResumeUpload = () => {
    if (resumeFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        uploadResumeMutation.mutate({ 
          file: reader.result as string, 
          filename: resumeFile.name 
        });
      };
      reader.readAsDataURL(resumeFile);
    }
  };

  const getPlanName = (plan?: string | null) => {
    if (!plan || plan === "free") return "Free";
    if (plan === "starter") return "Starter";
    if (plan === "pro") return "Pro";
    return "Free";
  };

  const getPlanLimits = (plan?: string | null) => {
    if (!plan || plan === "free") {
      return { applications: 0, documents: 1 };
    }
    if (plan === "starter") {
      return { applications: 3, documents: 10 };
    }
    return { applications: 10, documents: 999 };
  };

  const limits = getPlanLimits(user.plan);
  const applicationsRemaining = Math.max(0, limits.applications - (stats?.applicationsToday || 0));

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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Meu Perfil</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informações Pessoais
                  </CardTitle>
                  <CardDescription>Gerencie suas informações de perfil</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Profile Photo */}
                  <div>
                    <Label>Foto de Perfil</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {photoPreview ? (
                          <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                        ) : user.profilePhotoUrl ? (
                          <img src={user.profilePhotoUrl} alt="Perfil" className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-12 w-12 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        {photoPreview ? (
                          <div className="flex gap-2">
                            <Button onClick={handlePhotoUpload} disabled={uploadPhotoMutation.isPending}>
                              {uploadPhotoMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Foto"}
                            </Button>
                            <Button variant="outline" onClick={() => setPhotoPreview(null)}>
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <label className="cursor-pointer">
                                Escolher Foto
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handlePhotoChange}
                                />
                              </label>
                            </Button>
                            {user.profilePhotoUrl && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => removePhotoMutation.mutate()}
                                disabled={removePhotoMutation.isPending}
                              >
                                Remover
                              </Button>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-gray-500">JPG, PNG ou GIF. Máximo 5MB.</p>
                      </div>
                    </div>
                  </div>

                  {/* Resume Upload */}
                  <div>
                    <Label>Currículo</Label>
                    <div className="mt-2 space-y-2">
                      {user.resumeUrl ? (
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm font-medium">Currículo enviado</p>
                              <p className="text-xs text-gray-500">
                                {user.resumeUploadedAt ? new Date(user.resumeUploadedAt).toLocaleDateString("pt-BR") : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <a href={user.resumeUrl} target="_blank" rel="noopener noreferrer">
                                Ver
                              </a>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => removeResumeMutation.mutate()}
                              disabled={removeResumeMutation.isPending}
                            >
                              Remover
                            </Button>
                          </div>
                        </div>
                      ) : resumeFile ? (
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <p className="text-sm">{resumeFile.name}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleResumeUpload} disabled={uploadResumeMutation.isPending}>
                              {uploadResumeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar"}
                            </Button>
                            <Button variant="outline" onClick={() => setResumeFile(null)}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <Button variant="outline" asChild>
                            <label className="cursor-pointer">
                              Escolher Currículo (PDF)
                              <input
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={handleResumeChange}
                              />
                            </label>
                          </Button>
                          <p className="text-xs text-gray-500 mt-1">Apenas PDF. Máximo 10MB.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    {isEditingName ? (
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="name"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder={user.name || "Seu nome"}
                        />
                        <Button onClick={handleUpdateName} disabled={updateNameMutation.isPending}>
                          {updateNameMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditingName(false)}>
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-lg">{user.name || "Não informado"}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setNewName(user.name || "");
                            setIsEditingName(true);
                          }}
                        >
                          Editar
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="email">Email</Label>
                    {isEditingEmail ? (
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="email"
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder={user.email || "seu@email.com"}
                        />
                        <Button onClick={handleUpdateEmail} disabled={updateEmailMutation.isPending}>
                          {updateEmailMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditingEmail(false)}>
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-lg">{user.email || "Não informado"}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setNewEmail(user.email || "");
                            setIsEditingEmail(true);
                          }}
                        >
                          Editar
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Application History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Histórico de Candidaturas
                  </CardTitle>
                  <CardDescription>
                    {stats?.totalApplications || 0} candidatura(s) no total
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {applications && applications.length > 0 ? (
                    <div className="space-y-3">
                      {applications.map((app: any) => (
                        <div key={app.id} className="flex items-start justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-semibold">{app.jobTitle || "Vaga"}</h4>
                            <p className="text-sm text-gray-600">{app.company || "Empresa não informada"}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Candidatura enviada em {new Date(app.appliedAt).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <div className="ml-4">
                            {app.status === "pending" && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                <Clock className="h-3 w-3" />
                                Pendente
                              </span>
                            )}
                            {app.status === "accepted" && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                <CheckCircle2 className="h-3 w-3" />
                                Aceito
                              </span>
                            )}
                            {app.status === "rejected" && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                                <XCircle className="h-3 w-3" />
                                Rejeitado
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <AlertDescription>
                        Você ainda não se candidatou a nenhuma vaga. Visite a{" "}
                        <Link href="/jobs" className="text-primary underline">
                          página de vagas
                        </Link>{" "}
                        para começar!
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Saved Jobs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Vagas Salvas
                  </CardTitle>
                  <CardDescription>
                    {favorites?.length || 0} vaga(s) salva(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {favorites && favorites.length > 0 ? (
                    <div className="space-y-3">
                      {favorites.map((fav: any) => (
                        <div key={fav.id} className="flex items-start justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-semibold">Vaga #{fav.jobId}</h4>
                            <p className="text-xs text-gray-500 mt-1">
                              Salva em {new Date(fav.createdAt).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFavoriteMutation.mutate({ jobId: fav.jobId })}
                          >
                            Remover
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <AlertDescription>
                        Você ainda não salvou nenhuma vaga. Visite a{" "}
                        <Link href="/jobs" className="text-primary underline">
                          página de vagas
                        </Link>{" "}
                        e clique no ícone de coração para salvar!
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Plan Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Plano Atual
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold text-primary">{getPlanName(user.plan)}</p>
                    {user.plan === "free" && (
                      <p className="text-sm text-gray-600 mt-1">Acesso limitado</p>
                    )}
                  </div>

                  {user.plan === "free" && (
                    <Alert>
                      <AlertDescription>
                        Faça upgrade para acessar vagas, candidaturas e mais recursos!
                      </AlertDescription>
                    </Alert>
                  )}

                  {user.plan === "free" ? (
                    <Button asChild className="w-full">
                      <Link href="/pricing">Fazer Upgrade</Link>
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => {
                        createBillingPortalMutation.mutate();
                      }}
                      disabled={createBillingPortalMutation.isPending}
                    >
                      {createBillingPortalMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Gerenciar Assinatura"
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Statistics Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Estatísticas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Candidaturas Hoje</p>
                    <p className="text-2xl font-bold">
                      {stats?.applicationsToday || 0} / {limits.applications}
                    </p>
                    {applicationsRemaining > 0 ? (
                      <p className="text-xs text-green-600 mt-1">
                        {applicationsRemaining} restante(s) hoje
                      </p>
                    ) : limits.applications > 0 ? (
                      <p className="text-xs text-red-600 mt-1">Limite diário atingido</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">Faça upgrade para candidatar-se</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Documentos Gerados</p>
                    <p className="text-2xl font-bold">
                      {stats?.documentsGenerated || 0} / {limits.documents === 999 ? "∞" : limits.documents}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Total de Candidaturas</p>
                    <p className="text-2xl font-bold">{stats?.totalApplications || 0}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
