import { Card, CardContent } from "@ba33/ui-web";
import { AccountProfileForm } from "@/components/buyer/account/account-profile-form";
import { getComplaints, getDocuments, getOrders } from "@/lib/api/buyer-api";
import { requireServerAuthToken, requireServerSession } from "@/lib/auth/server-session";

export default async function AccountPage() {
  const session = await requireServerSession();
  const token = await requireServerAuthToken();

  const [orders, documents, complaints] = await Promise.all([
    getOrders(undefined, token),
    getDocuments(undefined, token),
    getComplaints(token),
  ]);

  const totalOrdered = orders.reduce((sum, order) => sum + order.totalAmountDzd, 0);
  const completedOrders = orders.filter((order) => order.status === "delivered").length;
  const openComplaints = complaints.filter((complaint) => complaint.status === "review").length;

  const stats = [
    { label: "Total commande", value: `${new Intl.NumberFormat("fr-FR").format(totalOrdered)} DZD` },
    { label: "Commandes completes", value: String(completedOrders) },
    { label: "Documents disponibles", value: String(documents.length) },
    { label: "Reclamations ouvertes", value: String(openComplaints) },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[5fr_7fr]">
      <section className="space-y-6">
        <Card className="rounded-xl shadow-xs">
          <CardContent className="space-y-4 p-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-primary/10 text-3xl font-bold text-primary">
              {(session.profile.firstName[0] ?? "B") + (session.profile.lastName[0] ?? "A")}
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-foreground">{session.profile.companyName}</h1>
              <span className="inline-flex rounded-sm border border-border bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
                {session.profile.sector}
              </span>
              <div>
                <span className="inline-flex rounded-sm bg-chart-1/15 px-2 py-0.5 text-xs font-semibold text-chart-1">Verifie</span>
              </div>
              <p className="text-sm text-muted-foreground">Canal principal : {session.profile.preferredChannel}</p>
              <p className="font-mono text-xs text-muted-foreground">Contact : {session.email}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          {stats.map((stat) => (
            <Card key={stat.label} className="rounded-xl shadow-xs">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-2 font-mono text-xl font-bold text-primary">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <AccountProfileForm session={session} />
    </div>
  );
}
