import { Card, CardContent } from "@ba33/ui-web";

export default function SalesPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Ventes</h1>
        <p className="text-muted-foreground">Gestion des ventes et commandes</p>
      </div>
      <Card>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          Bientôt disponible
        </CardContent>
      </Card>
    </div>
  );
}
