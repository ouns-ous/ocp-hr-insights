import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

const Performance = () => {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Performances & Analytics</h1>
        <p className="text-muted-foreground mt-1">Évaluations et rapports de performance</p>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Module Performance</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Ce module permettra l'évaluation mensuelle et annuelle, les graphiques de performance et l'export de rapports.
          </p>
          <Button variant="outline">
            En construction
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Performance;
