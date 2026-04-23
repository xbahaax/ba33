import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from "@ba33/ui-web";
import { Package, Search, ShieldCheck } from "lucide-react";

export default function BuyerHomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              b
            </div>
            <span className="font-semibold">ba33</span>
            <span className="text-muted-foreground text-sm">Acheteurs</span>
          </div>
          <Button variant="outline" size="sm">
            Connexion
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Laine certifiée NFN
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez et commandez de la laine algérienne certifiée, traçable du berger jusqu&apos;à vous.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <Search className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Catalogue</CardTitle>
              <CardDescription>
                Parcourez les produits de laine disponibles par qualité, région et transformation.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Package className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Commandes</CardTitle>
              <CardDescription>
                Suivez vos commandes en temps réel, de la préparation à la livraison.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <ShieldCheck className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Traçabilité</CardTitle>
              <CardDescription>
                Vérifiez la certification NFN et l&apos;origine de chaque lot de laine.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
}
