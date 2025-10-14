import { useState } from "react";
import { Search, Plus, MoreVertical, Mail, Phone, MapPin, Edit, Trash2, Eye, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  status: "active" | "absent" | "congé";
}

const initialEmployees: Employee[] = [
  {
    id: "1",
    name: "Mohammed Alami",
    position: "Ingénieur Production",
    department: "Production",
    email: "m.alami@ocp.ma",
    phone: "+212 6 12 34 56 78",
    location: "Khouribga",
    status: "active",
  },
  {
    id: "2",
    name: "Fatima Benali",
    position: "Responsable Logistique",
    department: "Logistique",
    email: "f.benali@ocp.ma",
    phone: "+212 6 23 45 67 89",
    location: "Casablanca",
    status: "active",
  },
  {
    id: "3",
    name: "Youssef Tazi",
    position: "Chef de Projet R&D",
    department: "R&D",
    email: "y.tazi@ocp.ma",
    phone: "+212 6 34 56 78 90",
    location: "Benguerir",
    status: "congé",
  },
  {
    id: "4",
    name: "Amina Lazrak",
    position: "Directrice RH",
    department: "Administration",
    email: "a.lazrak@ocp.ma",
    phone: "+212 6 45 67 89 01",
    location: "Casablanca",
    status: "active",
  },
  {
    id: "5",
    name: "Karim Benjelloun",
    position: "Technicien Qualité",
    department: "Production",
    email: "k.benjelloun@ocp.ma",
    phone: "+212 6 56 78 90 12",
    location: "Youssoufia",
    status: "absent",
  },
  {
    id: "6",
    name: "Sarah El Amrani",
    position: "Analyste Financier",
    department: "Finance",
    email: "s.elamrani@ocp.ma",
    phone: "+212 6 67 89 01 23",
    location: "Rabat",
    status: "active",
  },
];

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    department: "",
    email: "",
    phone: "",
    location: "",
    status: "active" as Employee["status"],
  });

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: Employee["status"]) => {
    switch (status) {
      case "active":
        return "bg-primary/10 text-primary border-primary/20";
      case "absent":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "congé":
        return "bg-accent/10 text-accent border-accent/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: Employee["status"]) => {
    switch (status) {
      case "active":
        return "Actif";
      case "absent":
        return "Absent";
      case "congé":
        return "En congé";
      default:
        return status;
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      position: "",
      department: "",
      email: "",
      phone: "",
      location: "",
      status: "active",
    });
  };

  const handleAddEmployee = () => {
    if (!formData.name || !formData.email || !formData.position) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const newEmployee: Employee = {
      id: String(employees.length + 1),
      ...formData,
    };

    setEmployees([...employees, newEmployee]);
    setIsAddDialogOpen(false);
    resetForm();
    toast.success(`${formData.name} a été ajouté avec succès`);
  };

  const handleEditEmployee = () => {
    if (!selectedEmployee) return;

    if (!formData.name || !formData.email || !formData.position) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setEmployees(
      employees.map((emp) =>
        emp.id === selectedEmployee.id ? { ...emp, ...formData } : emp
      )
    );
    setIsEditDialogOpen(false);
    setSelectedEmployee(null);
    resetForm();
    toast.success("Employé modifié avec succès");
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setEmployees(employees.filter((emp) => emp.id !== employee.id));
    toast.success(`${employee.name} a été supprimé`);
  };

  const handleOpenEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name,
      position: employee.position,
      department: employee.department,
      email: employee.email,
      phone: employee.phone,
      location: employee.location,
      status: employee.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleViewProfile = (employee: Employee) => {
    toast.info(`Ouverture du profil de ${employee.name}`);
  };

  const handleSendMessage = (employee: Employee) => {
    toast.info(`Envoi d'un message à ${employee.name}`);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des employés</h1>
          <p className="text-muted-foreground mt-1">{employees.length} employés au total</p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          Ajouter un employé
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un employé..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEmployees.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {employee.name.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="font-medium text-foreground">{employee.name}</p>
                      <p className="text-sm text-muted-foreground">{employee.position}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-normal">
                        {employee.department}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(employee.status)}>
                        {getStatusLabel(employee.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{employee.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{employee.location}</span>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewProfile(employee)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Voir le profil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleOpenEditDialog(employee)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSendMessage(employee)}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Envoyer un message
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => handleDeleteEmployee(employee)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog Ajouter Employé */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ajouter un employé</DialogTitle>
            <DialogDescription>
              Remplissez les informations du nouveau membre de l'équipe
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Ahmed Benani"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Poste *</Label>
                <Input
                  id="position"
                  placeholder="Ex: Ingénieur"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Département</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Production">Production</SelectItem>
                    <SelectItem value="Logistique">Logistique</SelectItem>
                    <SelectItem value="Administration">Administration</SelectItem>
                    <SelectItem value="R&D">R&D</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as Employee["status"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="congé">En congé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="prenom.nom@ocp.ma"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  placeholder="+212 6 XX XX XX XX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localisation</Label>
              <Input
                id="location"
                placeholder="Ex: Casablanca"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              resetForm();
            }}>
              Annuler
            </Button>
            <Button onClick={handleAddEmployee}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Modifier Employé */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier l'employé</DialogTitle>
            <DialogDescription>
              Modifiez les informations de {selectedEmployee?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nom complet *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-position">Poste *</Label>
                <Input
                  id="edit-position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-department">Département</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Production">Production</SelectItem>
                    <SelectItem value="Logistique">Logistique</SelectItem>
                    <SelectItem value="Administration">Administration</SelectItem>
                    <SelectItem value="R&D">R&D</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as Employee["status"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="congé">En congé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Téléphone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location">Localisation</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setSelectedEmployee(null);
              resetForm();
            }}>
              Annuler
            </Button>
            <Button onClick={handleEditEmployee}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Employees;
