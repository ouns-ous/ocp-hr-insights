import { Users, Calendar, TrendingUp, UserCheck } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const Dashboard = () => {
  const stats = [
    { title: "Total Employés", value: "1,247", icon: Users, trend: { value: "+12%", isPositive: true } },
    { title: "Taux de Présence", value: "94.5%", icon: UserCheck, trend: { value: "+2.3%", isPositive: true } },
    { title: "Congés en cours", value: "42", icon: Calendar, trend: { value: "-5", isPositive: false } },
    { title: "Performance Moyenne", value: "87%", icon: TrendingUp, trend: { value: "+3.2%", isPositive: true } },
  ];

  const employeeData = [
    { name: "Jan", value: 1150 },
    { name: "Fév", value: 1180 },
    { name: "Mar", value: 1200 },
    { name: "Avr", value: 1220 },
    { name: "Mai", value: 1235 },
    { name: "Juin", value: 1247 },
  ];

  const departmentData = [
    { name: "Production", value: 520, color: "hsl(var(--chart-1))" },
    { name: "Logistique", value: 280, color: "hsl(var(--chart-2))" },
    { name: "Administration", value: 200, color: "hsl(var(--chart-3))" },
    { name: "R&D", value: 147, color: "hsl(var(--chart-4))" },
    { name: "Autres", value: 100, color: "hsl(var(--chart-5))" },
  ];

  const recentActivities = [
    { id: 1, user: "Mohammed Alami", action: "Demande de congé validée", time: "Il y a 5 min" },
    { id: 2, user: "Fatima Benali", action: "Nouveau bulletin de paie généré", time: "Il y a 15 min" },
    { id: 3, user: "Youssef Tazi", action: "Évaluation de performance complétée", time: "Il y a 1h" },
    { id: 4, user: "Amina Lazrak", action: "Candidature reçue - Ingénieur", time: "Il y a 2h" },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tableau de bord RH</h1>
        <p className="text-muted-foreground mt-1">Vue d'ensemble de vos indicateurs clés</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Évolution des effectifs</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={employeeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par département</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activités récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-medium text-sm">
                      {activity.user.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{activity.user}</p>
                    <p className="text-xs text-muted-foreground">{activity.action}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
