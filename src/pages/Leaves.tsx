import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

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

const Leaves = () => {
  const leaves: Leave[] = [
    {
      id: "1",
      employee: "Mohammed Alami",
      type: "Congé annuel",
      startDate: "2025-11-01",
      endDate: "2025-11-15",
      days: 14,
      status: "approved",
      reason: "Vacances d'été",
    },
    {
      id: "2",
      employee: "Fatima Benali",
      type: "Congé maladie",
      startDate: "2025-10-20",
      endDate: "2025-10-22",
      days: 3,
      status: "approved",
      reason: "Certificat médical",
    },
    {
      id: "3",
      employee: "Youssef Tazi",
      type: "Congé annuel",
      startDate: "2025-10-28",
      endDate: "2025-11-10",
      days: 13,
      status: "pending",
      reason: "Voyage familial",
    },
    {
      id: "4",
      employee: "Karim Benjelloun",
      type: "Congé exceptionnel",
      startDate: "2025-10-25",
      endDate: "2025-10-26",
      days: 2,
      status: "rejected",
      reason: "Événement familial",
    },
    {
      id: "5",
      employee: "Sarah El Amrani",
      type: "Congé annuel",
      startDate: "2025-11-05",
      endDate: "2025-11-08",
      days: 4,
      status: "pending",
      reason: "Court séjour",
    },
  ];

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
        <Button className="gap-2">
          <Calendar className="w-4 h-4" />
          Nouvelle demande
        </Button>
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
                {leave.status === "pending" && (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="gap-1 border-destructive/50 text-destructive hover:bg-destructive/10">
                      <XCircle className="w-4 h-4" />
                      Refuser
                    </Button>
                    <Button size="sm" className="gap-1">
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
