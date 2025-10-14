import { useState } from "react";
import { Search, Plus, MoreVertical, Mail, Phone, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const Employees = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const employees: Employee[] = [
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

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des employés</h1>
          <p className="text-muted-foreground mt-1">{employees.length} employés au total</p>
        </div>
        <Button className="gap-2">
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
                    <DropdownMenuItem>Voir le profil</DropdownMenuItem>
                    <DropdownMenuItem>Modifier</DropdownMenuItem>
                    <DropdownMenuItem>Envoyer un message</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Désactiver</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Employees;
