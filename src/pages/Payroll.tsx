import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Download, FileText } from "lucide-react";

const Payroll = () => {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion de la paie</h1>
          <p className="text-muted-foreground mt-1">Bulletins de paie et historique des paiements</p>
        </div>
        <Button className="gap-2">
          <FileText className="w-4 h-4" />
          Générer bulletins
        </Button>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Module Paie</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Ce module permettra la génération automatique des bulletins de paie, l'historique des paiements et l'export en PDF/Excel.
          </p>
          <Button variant="outline">
            En construction
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payroll;
