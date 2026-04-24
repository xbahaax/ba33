import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@ba33/ui-web";

const stats = [
  { label: "Total commandé", value: "2 050 000 DZD" },
  { label: "Commandes complètes", value: "18" },
  { label: "Documents disponibles", value: "26" },
  { label: "Réclamations ouvertes", value: "1" },
];

export default function AccountPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[5fr_7fr]">
      <section className="space-y-6">
        <Card className="rounded-xl shadow-xs">
          <CardContent className="space-y-4 p-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-primary/10 text-3xl font-bold text-primary">
              NF
            </div>
            <Button variant="ghost" size="sm">Changer le logo</Button>
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-foreground">Noura Fibres</h1>
              <span className="inline-flex rounded-sm border border-border bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
                Industrie textile
              </span>
              <div>
                <span className="inline-flex rounded-sm bg-chart-1/15 px-2 py-0.5 text-xs font-semibold text-chart-1">Vérifié</span>
              </div>
              <p className="text-sm text-muted-foreground">Canal principal : Export</p>
              <p className="font-mono text-xs text-muted-foreground">Membre depuis : 12/02/2024</p>
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

      <Card className="rounded-xl shadow-xs">
        <CardHeader>
          <CardTitle>Informations entreprise</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Nom entreprise" defaultValue="Noura Fibres" />
          <Field label="NIF / NUIS" defaultValue="001612345678900" mono />
          <Field label="Secteur d'activité" defaultValue="Textile technique" />
          <Field label="Site web" defaultValue="https://nourafibres.dz" />
          <Field label="Prénom contact" defaultValue="Noura" />
          <Field label="Nom contact" defaultValue="Benkhelifa" />
          <Field label="Email" defaultValue="contact@nourafibres.dz" />
          <Field label="Téléphone" defaultValue="+213 555 22 11 90" />
          <div className="md:col-span-2">
            <Button>Enregistrer les modifications</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, defaultValue, mono }: { label: string; defaultValue: string; mono?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <Input defaultValue={defaultValue} className={mono ? "font-mono" : undefined} />
    </div>
  );
}
