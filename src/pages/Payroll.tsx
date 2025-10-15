import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Wallet, Download, FileText, Plus, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { z } from "zod";

const payrollSchema = z.object({
  employee_id: z.string().min(1, "L'employé est requis"),
  month: z.number().min(1).max(12),
  year: z.number().min(2020),
  base_salary: z.number().min(0),
  bonuses: z.number().min(0).default(0),
  deductions: z.number().min(0).default(0),
});

interface PayrollRecord {
  id: string;
  employee_name: string;
  month: number;
  year: number;
  base_salary: number;
  bonuses: number;
  deductions: number;
  net_salary: number;
  status: "draft" | "processed" | "paid";
  payment_date: string | null;
}

const Payroll = () => {
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [employees, setEmployees] = useState<Array<{ id: string; full_name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { canManageEmployees } = useUserRole();

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    employee_id: "",
    month: currentMonth,
    year: currentYear,
    base_salary: 0,
    bonuses: 0,
    deductions: 0,
  });

  useEffect(() => {
    fetchEmployees();
    fetchPayrolls();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("employees")
        .select("id, full_name")
        .order("full_name");

      if (error) throw error;
      setEmployees(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les employés",
        variant: "destructive",
      });
    }
  };

  const fetchPayrolls = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("payroll")
        .select(`
          *,
          employees:employee_id (
            full_name
          )
        `)
        .order("year", { ascending: false })
        .order("month", { ascending: false });

      if (error) throw error;

      const formattedPayrolls: PayrollRecord[] = (data || []).map((p: any) => ({
        id: p.id,
        employee_name: p.employees?.full_name || "Inconnu",
        month: p.month,
        year: p.year,
        base_salary: parseFloat(p.base_salary),
        bonuses: parseFloat(p.bonuses),
        deductions: parseFloat(p.deductions),
        net_salary: parseFloat(p.net_salary),
        status: p.status,
        payment_date: p.payment_date,
      }));

      setPayrolls(formattedPayrolls);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les bulletins de paie",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      const validated = payrollSchema.parse(formData);
      const net_salary = validated.base_salary + validated.bonuses - validated.deductions;

      const { error } = await (supabase as any)
        .from("payroll")
        .insert([{
          ...validated,
          net_salary,
          status: "draft",
        }]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Bulletin de paie créé avec succès",
      });

      setIsDialogOpen(false);
      setFormData({
        employee_id: "",
        month: currentMonth,
        year: currentYear,
        base_salary: 0,
        bonuses: 0,
        deductions: 0,
      });
      fetchPayrolls();
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
          description: "Impossible de créer le bulletin",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusBadge = (status: PayrollRecord["status"]) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-primary/10 text-primary border-primary/20">Payé</Badge>;
      case "processed":
        return <Badge className="bg-accent/10 text-accent border-accent/20">Traité</Badge>;
      case "draft":
        return <Badge variant="outline">Brouillon</Badge>;
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];
    return months[month - 1];
  };

  const stats = [
    { 
      label: "Total bulletins", 
      value: payrolls.length, 
      icon: FileText 
    },
    { 
      label: "Payés ce mois", 
      value: payrolls.filter(p => p.status === "paid" && p.month === currentMonth).length, 
      icon: DollarSign 
    },
    { 
      label: "En attente", 
      value: payrolls.filter(p => p.status === "draft").length, 
      icon: Wallet 
    },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion de la paie</h1>
          <p className="text-muted-foreground mt-1">Bulletins de paie et historique des paiements</p>
        </div>
        {canManageEmployees && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nouveau bulletin
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Créer un bulletin de paie</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employee_id">Employé</Label>
                  <Select
                    value={formData.employee_id}
                    onValueChange={(value) => setFormData({ ...formData, employee_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un employé" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="month">Mois</Label>
                    <Select
                      value={formData.month.toString()}
                      onValueChange={(value) => setFormData({ ...formData, month: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                          <SelectItem key={m} value={m.toString()}>
                            {getMonthName(m)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Année</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="base_salary">Salaire de base (MAD)</Label>
                  <Input
                    id="base_salary"
                    type="number"
                    step="0.01"
                    value={formData.base_salary}
                    onChange={(e) => setFormData({ ...formData, base_salary: parseFloat(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bonuses">Primes (MAD)</Label>
                  <Input
                    id="bonuses"
                    type="number"
                    step="0.01"
                    value={formData.bonuses}
                    onChange={(e) => setFormData({ ...formData, bonuses: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deductions">Déductions (MAD)</Label>
                  <Input
                    id="deductions"
                    type="number"
                    step="0.01"
                    value={formData.deductions}
                    onChange={(e) => setFormData({ ...formData, deductions: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Salaire net:</span>
                    <span className="text-2xl font-bold text-primary">
                      {(formData.base_salary + formData.bonuses - formData.deductions).toFixed(2)} MAD
                    </span>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">Créer</Button>
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
          <CardTitle>Historique des bulletins de paie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payrolls.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucun bulletin de paie</p>
            ) : (
              payrolls.map((payroll) => (
                <div
                  key={payroll.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-medium text-foreground">{payroll.employee_name}</p>
                        {getStatusBadge(payroll.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {getMonthName(payroll.month)} {payroll.year}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Base: {payroll.base_salary.toFixed(2)} MAD</span>
                        {payroll.bonuses > 0 && <span>Primes: +{payroll.bonuses.toFixed(2)} MAD</span>}
                        {payroll.deductions > 0 && <span>Déductions: -{payroll.deductions.toFixed(2)} MAD</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{payroll.net_salary.toFixed(2)} MAD</p>
                    {payroll.payment_date && (
                      <p className="text-xs text-muted-foreground">
                        Payé le {new Date(payroll.payment_date).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payroll;
