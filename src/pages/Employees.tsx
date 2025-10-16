import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { z } from "zod";

const employeeSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(10).max(20).optional().or(z.literal("")),
  position: z.string().trim().min(2).max(100),
  department: z.string().trim().min(2).max(100),
  location: z.string().trim().max(100).optional().or(z.literal("")),
});

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone?: string;
  location?: string;
  status: string;
}

const Employees = () => {
  const { canManageEmployees, loading: rolesLoading } = useUserRole();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", position: "", department: "", location: "",
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await (supabase as any).from("employees").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setEmployees(data || []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter((e) =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async () => {
    try {
      const validated = employeeSchema.parse(formData);
      const { error } = await (supabase as any).from("employees").insert([{ ...validated, phone: validated.phone || null, location: validated.location || null, status: "active" }]);
      if (error) throw error;
      toast.success("Employé ajouté");
      setIsAddDialogOpen(false);
      setFormData({ name: "", email: "", phone: "", position: "", department: "", location: "" });
      fetchEmployees();
    } catch (error) {
      if (error instanceof z.ZodError) error.errors.forEach((e) => toast.error(e.message));
      else toast.error("Erreur");
    }
  };

  const handleEdit = async () => {
    if (!editingEmployee) return;
    try {
      const validated = employeeSchema.parse(formData);
      const { error } = await (supabase as any).from("employees").update({ ...validated, phone: validated.phone || null, location: validated.location || null }).eq("id", editingEmployee.id);
      if (error) throw error;
      toast.success("Modifié");
      setIsEditDialogOpen(false);
      setEditingEmployee(null);
      setFormData({ name: "", email: "", phone: "", position: "", department: "", location: "" });
      fetchEmployees();
    } catch (error) {
      if (error instanceof z.ZodError) error.errors.forEach((e) => toast.error(e.message));
      else toast.error("Erreur");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer ?")) return;
    try {
      const { error } = await (supabase as any).from("employees").delete().eq("id", id);
      if (error) throw error;
      toast.success("Supprimé");
      fetchEmployees();
    } catch (error) {
      toast.error("Erreur");
    }
  };

  if (loading || rolesLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Gestion des Employés</h1><p className="text-muted-foreground mt-1">{employees.length} employé{employees.length > 1 ? "s" : ""}</p></div>
        <Button onClick={() => canManageEmployees ? setIsAddDialogOpen(true) : toast.error("Vous n'avez pas les permissions")} className="gap-2"><Plus className="w-4 h-4" />Ajouter un employé</Button>
      </div>
      <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" /><Input placeholder="Rechercher..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Poste</TableHead>
              <TableHead>Département</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Aucun employé trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">{emp.name}</TableCell>
                  <TableCell>{emp.position}</TableCell>
                  <TableCell>{emp.department}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{emp.phone || "-"}</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500/10 text-green-700">Actif</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {canManageEmployees && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingEmployee(emp);
                              setFormData({
                                name: emp.name,
                                email: emp.email,
                                phone: emp.phone || "",
                                position: emp.position,
                                department: emp.department,
                                location: emp.location || "",
                              });
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(emp.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}><DialogContent className="sm:max-w-[500px]"><DialogHeader><DialogTitle>Ajouter un employé</DialogTitle></DialogHeader><div className="grid gap-4 py-4">
        <div className="grid gap-2"><Label>Nom *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} maxLength={100} /></div>
        <div className="grid gap-2"><Label>Email *</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} maxLength={255} /></div>
        <div className="grid gap-2"><Label>Téléphone</Label><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} maxLength={20} /></div>
        <div className="grid gap-2"><Label>Poste *</Label><Input value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} maxLength={100} /></div>
        <div className="grid gap-2"><Label>Département *</Label><Input value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} maxLength={100} /></div>
        <div className="grid gap-2"><Label>Localisation</Label><Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} maxLength={100} /></div>
      </div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => { setIsAddDialogOpen(false); setFormData({ name: "", email: "", phone: "", position: "", department: "", location: "" }); }}>Annuler</Button><Button onClick={handleAdd}>Ajouter</Button></div></DialogContent></Dialog>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}><DialogContent className="sm:max-w-[500px]"><DialogHeader><DialogTitle>Modifier</DialogTitle></DialogHeader><div className="grid gap-4 py-4">
        <div className="grid gap-2"><Label>Nom *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} maxLength={100} /></div>
        <div className="grid gap-2"><Label>Email *</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} maxLength={255} /></div>
        <div className="grid gap-2"><Label>Téléphone</Label><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} maxLength={20} /></div>
        <div className="grid gap-2"><Label>Poste *</Label><Input value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} maxLength={100} /></div>
        <div className="grid gap-2"><Label>Département *</Label><Input value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} maxLength={100} /></div>
        <div className="grid gap-2"><Label>Localisation</Label><Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} maxLength={100} /></div>
      </div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setEditingEmployee(null); setFormData({ name: "", email: "", phone: "", position: "", department: "", location: "" }); }}>Annuler</Button><Button onClick={handleEdit}>Enregistrer</Button></div></DialogContent></Dialog>
    </div>
  );
};

export default Employees;
