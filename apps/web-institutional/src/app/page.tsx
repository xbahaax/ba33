import { Button, Card, CardHeader, CardTitle, CardDescription, Badge } from "@ba33/ui-web";
import { Building2, BarChart3, FileText, Shield } from "lucide-react";

export default function InstitutionalHomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              b
            </div>
            <span className="font-semibold">ba33</span>
            <Badge variant="outline">Institutionnel</Badge>
          </div>
          <Button variant="outline" size="sm">
            Connexion
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Portail Institutionnel
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Supervision et suivi de la filière laine nationale — accès en lecture seule pour les régulateurs.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <Building2 className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Filière</CardTitle>
              <CardDescription>
                Vue d&apos;ensemble de la chaîne de valeur laine.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Statistiques</CardTitle>
              <CardDescription>
                Indicateurs clés de la production nationale.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <FileText className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Rapports</CardTitle>
              <CardDescription>
                Rapports d&apos;activité et audits.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Conformité</CardTitle>
              <CardDescription>
                Suivi de la conformité réglementaire.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
}
