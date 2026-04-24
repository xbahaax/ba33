import Link from "next/link";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ba33/ui-web";
import { FileCheck2, Package, ShieldCheck, ShoppingCart } from "lucide-react";

const landingFeatures = [
  {
    title: "Product catalog",
    description: "Browse all P1 and P2 products with NFN seal, quantity, grade, region and price.",
    icon: Package,
  },
  {
    title: "Verify certificate",
    description: "Scan QR or enter code to verify the authenticity of a certified product.",
    icon: ShieldCheck,
  },
  {
    title: "Cart + checkout flow",
    description: "Prepare an order draft, choose a sales channel and review payment instructions.",
    icon: ShoppingCart,
  },
  {
    title: "Order management",
    description: "Track shipments, download invoices and certificates, and manage complaints.",
    icon: FileCheck2,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-10 lg:px-6 lg:py-16">
        <header className="flex flex-col gap-8 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xs lg:flex-row lg:items-end lg:justify-between lg:p-8">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">B2B customer portal</Badge>
              <Badge variant="outline">French, English, Arabic</Badge>
              <Badge variant="secondary">NFN</Badge>
            </div>
            <div className="space-y-3">
              <p className="font-serif text-3xl lg:text-4xl">ba33</p>
              <h1 className="text-3xl font-semibold tracking-tight lg:text-5xl">
                External-facing portal for buyers of certified wool products.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground lg:text-base">
                Browse certified products, order, track, and verify traceability. Read-heavy on catalog, write only for buyer-owned actions.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/catalog">Entrer dans le portail</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Connexion</Link>
            </Button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {landingFeatures.map(({ title, description, icon: Icon }) => (
            <Card key={title} className="rounded-xl shadow-xs">
              <CardHeader className="space-y-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-lg">{title}</CardTitle>
                  <CardDescription className="leading-7">{description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-xl shadow-xs">
            <CardHeader>
              <CardTitle>Who uses it</CardTitle>
              <CardDescription>B2B buyers — national, export, and institutional clients.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm leading-7 text-muted-foreground">
              <p>Textile mills</p>
              <p>Agricultural companies</p>
              <p>Export buyers</p>
              <p>Institutional clients</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-xs">
            <CardHeader>
              <CardTitle>MVP</CardTitle>
              <CardDescription>Steps 1–3 let a buyer browse and verify before the transactional flow.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm leading-7 text-muted-foreground">
              <p>1. Next.js scaffold + public landing + auth</p>
              <p>2. Product catalog page</p>
              <p>3. Product detail + traceability view</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
