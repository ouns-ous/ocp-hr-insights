import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { z } from "zod";

interface Leave {
  id: string;
  employee: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: "pending" | "approved" | "rejected";
  reason: string;
}

const leaveSchema = z.object({
  employee_name: z.string().min(1, "Le nom est requis"),
  leave_type: z.string().min(1, "Le type de congé est requis"),
  start_date: z.string().min(1, "La date de début est requise"),
  end_date: z.string().min(1, "La date de fin est requise"),
  reason: z.string().optional(),
});

const Leaves = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { canManageEmployees } = useUserRole();
  
  const [formData, setFormData] = useState({
    employee_name: "",
    leave_type: "Congé annuel",
    start_date: "",
    end_date: "",
    reason: "",
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("leave_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedLeaves: Leave[] = (data || []).map((leave: any) => {
        const start = new Date(leave.start_date);
        const end = new Date(leave.end_date);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        return {
          id: leave.id,
          employee: leave.employee_name,
          type: leave.leave_type,
          startDate: leave.start_date,
          endDate: leave.end_date,
          days,
          status: leave.status,
          reason: leave.reason || "",
        };
      });

      setLeaves(formattedLeaves);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les demandes de congé",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validated = leaveSchema.parse(formData);
      
      const start = new Date(validated.start_date);
      const end = new Date(validated.end_date);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

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
        .from("leave_requests")
        .insert([{
          user_id: user.id,
          employee_name: validated.employee_name,
          leave_type: validated.leave_type,
          start_date: validated.start_date,
          end_date: validated.end_date,
          days,
          reason: validated.reason,
          status: "pending",
        }]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Demande de congé créée avec succès",
      });

      setIsDialogOpen(false);
      setFormData({
        employee_name: "",
        leave_type: "Congé annuel",
        start_date: "",
        end_date: "",
        reason: "",
      });
      fetchLeaves();
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
          description: "Impossible de créer la demande",
          variant: "destructive",
        });
      }
    }
  };

  const handleStatusUpdate = async (leaveId: string, newStatus: "approved" | "rejected") => {
    try {
      const { error } = await (supabase as any)
        .from("leave_requests")
        .update({ status: newStatus })
        .eq("id", leaveId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Demande ${newStatus === "approved" ? "validée" : "refusée"}`,
      });

      fetchLeaves();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: Leave["status"]) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
            <CheckCircle className="w-3 h-3" />
            Validé
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
            <XCircle className="w-3 h-3" />
            Refusé
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-accent/10 text-accent border-accent/20 gap-1">
            <AlertCircle className="w-3 h-3" />
            En attente
          </Badge>
        );
    }
  };

  const stats = [
    { label: "Total demandes", value: leaves.length, icon: Calendar },
    { label: "En attente", value: leaves.filter(l => l.status === "pending").length, icon: Clock },
    { label: "Validées", value: leaves.filter(l => l.status === "approved").length, icon: CheckCircle },
    { label: "Refusées", value: leaves.filter(l => l.status === "rejected").length, icon: XCircle },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des congés</h1>
          <p className="text-muted-foreground mt-1">Suivez et gérez les demandes de congés</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nouvelle demande
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nouvelle demande de congé</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employee_name">Nom complet</Label>
                <Input
                  id="employee_name"
                  value={formData.employee_name}
                  onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
                  placeholder="Votre nom complet"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="leave_type">Type de congé</Label>
                <Select
                  value={formData.leave_type}
                  onValueChange={(value) => setFormData({ ...formData, leave_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Congé annuel">Congé annuel</SelectItem>
                    <SelectItem value="Congé maladie">Congé maladie</SelectItem>
                    <SelectItem value="Congé exceptionnel">Congé exceptionnel</SelectItem>
                    <SelectItem value="Congé sans solde">Congé sans solde</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Date de début</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">Date de fin</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Motif (optionnel)</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Raison de votre demande..."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Soumettre</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <CardTitle>Demandes de congés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaves.map((leave) => (
              <div
                key={leave.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {leave.employee.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-medium text-foreground">{leave.employee}</p>
                      {getStatusBadge(leave.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{leave.type}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(leave.startDate).toLocaleDateString("fr-FR")} - {new Date(leave.endDate).toLocaleDateString("fr-FR")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {leave.days} jour{leave.days > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
                {leave.status === "pending" && canManageEmployees && (
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="gap-1 border-destructive/50 text-destructive hover:bg-destructive/10"
                      onClick={() => handleStatusUpdate(leave.id, "rejected")}
                    >
                      <XCircle className="w-4 h-4" />
                      Refuser
                    </Button>
                    <Button 
                      size="sm" 
                      className="gap-1"
                      onClick={() => handleStatusUpdate(leave.id, "approved")}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Valider
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaves;
