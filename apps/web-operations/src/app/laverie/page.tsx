import { Card, CardContent } from "@ba33/ui-web";

export default function LaveriePage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Laverie</h1>
        <p className="text-muted-foreground">Suivi du processus de lavage</p>
      </div>
      <Card>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          Bientôt disponible
        </CardContent>
      </Card>
    </div>
  );
}
