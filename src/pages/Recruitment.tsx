import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Plus, Briefcase, MapPin, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { z } from "zod";

const jobSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  department: z.string().min(1, "Le département est requis"),
  location: z.string().min(1, "Le lieu est requis"),
  employment_type: z.string().min(1, "Le type d'emploi est requis"),
  description: z.string().min(1, "La description est requise"),
  requirements: z.string().optional(),
  salary_range: z.string().optional(),
});

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  description: string;
  requirements: string | null;
  salary_range: string | null;
  status: "open" | "closed" | "on-hold";
  created_at: string;
}

interface Application {
  id: string;
  job_title: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string | null;
  status: string;
  created_at: string;
}

const Recruitment = () => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const { toast } = useToast();
  const { canManageEmployees } = useUserRole();

  const [jobFormData, setJobFormData] = useState({
    title: "",
    department: "",
    location: "",
    employment_type: "full-time",
    description: "",
    requirements: "",
    salary_range: "",
  });

  useEffect(() => {
    fetchJobs();
    if (canManageEmployees) {
      fetchApplications();
    }
  }, [canManageEmployees]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("job_postings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les offres d'emploi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("applications")
        .select(`
          *,
          job_postings:job_id (
            title
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedApps: Application[] = (data || []).map((app: any) => ({
        id: app.id,
        job_title: app.job_postings?.title || "Inconnu",
        applicant_name: app.applicant_name,
        applicant_email: app.applicant_email,
        applicant_phone: app.applicant_phone,
        status: app.status,
        created_at: app.created_at,
      }));

      setApplications(formattedApps);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les candidatures",
        variant: "destructive",
      });
    }
  };

  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canManageEmployees) {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les permissions nécessaires",
        variant: "destructive",
      });
      return;
    }

    try {
      const validated = jobSchema.parse(jobFormData);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté",
          variant: "destructive",
        });
        return;
      }

      const { error } = await (supabase as any)
        .from("job_postings")
        .insert([{
          ...validated,
          posted_by: user.id,
          status: "open",
        }]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Offre d'emploi créée avec succès",
      });

      setIsJobDialogOpen(false);
      setJobFormData({
        title: "",
        department: "",
        location: "",
        employment_type: "full-time",
        description: "",
        requirements: "",
        salary_range: "",
      });
      fetchJobs();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erreur de validation",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de créer l'offre",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusBadge = (status: JobPosting["status"]) => {
    switch (status) {
      case "open":
        return <Badge className="bg-primary/10 text-primary border-primary/20">Ouvert</Badge>;
      case "closed":
        return <Badge variant="outline">Fermé</Badge>;
      case "on-hold":
        return <Badge className="bg-accent/10 text-accent border-accent/20">En attente</Badge>;
    }
  };

  const getApplicationStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: string }> = {
      pending: { label: "En attente", variant: "outline" },
      reviewing: { label: "En cours", variant: "bg-accent/10 text-accent border-accent/20" },
      interviewed: { label: "Entretien", variant: "bg-primary/10 text-primary border-primary/20" },
      accepted: { label: "Accepté", variant: "bg-green-500/10 text-green-600 border-green-500/20" },
      rejected: { label: "Refusé", variant: "bg-destructive/10 text-destructive border-destructive/20" },
    };

    const config = statusMap[status] || statusMap.pending;
    return <Badge className={config.variant}>{config.label}</Badge>;
  };

  const stats = [
    { label: "Postes ouverts", value: jobs.filter(j => j.status === "open").length, icon: Briefcase },
    { label: "Candidatures", value: applications.length, icon: Users },
    { label: "En révision", value: applications.filter(a => a.status === "reviewing").length, icon: UserPlus },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Recrutement</h1>
          <p className="text-muted-foreground mt-1">Gestion des postes et candidatures</p>
        </div>
        {canManageEmployees && (
          <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nouvelle offre
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer une offre d'emploi</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleJobSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre du poste</Label>
                  <Input
                    id="title"
                    value={jobFormData.title}
                    onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
                    placeholder="Ex: Développeur Full Stack"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Département</Label>
                    <Input
                      id="department"
                      value={jobFormData.department}
                      onChange={(e) => setJobFormData({ ...jobFormData, department: e.target.value })}
                      placeholder="Ex: IT"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Localisation</Label>
                    <Input
                      id="location"
                      value={jobFormData.location}
                      onChange={(e) => setJobFormData({ ...jobFormData, location: e.target.value })}
                      placeholder="Ex: Casablanca"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employment_type">Type d'emploi</Label>
                  <Select
                    value={jobFormData.employment_type}
                    onValueChange={(value) => setJobFormData({ ...jobFormData, employment_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Temps plein</SelectItem>
                      <SelectItem value="part-time">Temps partiel</SelectItem>
                      <SelectItem value="contract">Contrat</SelectItem>
                      <SelectItem value="internship">Stage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary_range">Fourchette salariale</Label>
                  <Input
                    id="salary_range"
                    value={jobFormData.salary_range}
                    onChange={(e) => setJobFormData({ ...jobFormData, salary_range: e.target.value })}
                    placeholder="Ex: 8000-12000 MAD"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description du poste</Label>
                  <Textarea
                    id="description"
                    value={jobFormData.description}
                    onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
                    placeholder="Décrivez les responsabilités et missions..."
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Exigences et qualifications</Label>
                  <Textarea
                    id="requirements"
                    value={jobFormData.requirements}
                    onChange={(e) => setJobFormData({ ...jobFormData, requirements: e.target.value })}
                    placeholder="Listez les compétences et qualifications requises..."
                    rows={4}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsJobDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">Publier l'offre</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Offres d'emploi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucune offre d'emploi</p>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-foreground">{job.title}</h3>
                        {getStatusBadge(job.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {job.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        {job.salary_range && (
                          <span className="font-medium text-primary">{job.salary_range}</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {canManageEmployees && (
        <Card>
          <CardHeader>
            <CardTitle>Candidatures récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucune candidature</p>
              ) : (
                applications.slice(0, 10).map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <UserPlus className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-medium text-foreground">{app.applicant_name}</p>
                          {getApplicationStatusBadge(app.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{app.job_title}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{app.applicant_email}</span>
                          {app.applicant_phone && <span>{app.applicant_phone}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(app.created_at).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Recruitment;
