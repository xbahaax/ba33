import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
} from "@ba33/ui-web";
import {
  Warehouse,
  WashingMachine,
  Factory,
  ShoppingCart,
  TrendingUp,
  Package,
} from "lucide-react";

const stats = [
  {
    title: "Lots en dépôt",
    value: "—",
    description: "En attente de traitement",
    icon: Warehouse,
    trend: null,
  },
  {
    title: "En laverie",
    value: "—",
    description: "En cours de lavage",
    icon: WashingMachine,
    trend: null,
  },
  {
    title: "Transformation",
    value: "—",
    description: "Lots en production",
    icon: Factory,
    trend: null,
  },
  {
    title: "Ventes",
    value: "—",
    description: "Commandes actives",
    icon: ShoppingCart,
    trend: null,
  },
];

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Tableau de bord
        </h1>
        <p className="text-muted-foreground">
          Vue d&apos;ensemble de la plateforme ba33
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Activité récente
            </CardTitle>
            <CardDescription>
              Derniers événements de la chaîne
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
              Aucune donnée disponible
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Lots récents
            </CardTitle>
            <CardDescription>
              Derniers lots enregistrés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
              Aucun lot enregistré
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
