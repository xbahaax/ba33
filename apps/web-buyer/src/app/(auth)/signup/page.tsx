import Link from "next/link";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@ba33/ui-web";

const steps = ["Compte", "Entreprise", "Verification"];

export default function SignupPage() {
  return (
    <Card className="rounded-xl border border-border bg-card text-card-foreground shadow-md">
      <CardHeader className="space-y-4 p-8">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold">Creer un compte</CardTitle>
          <CardDescription>Portail Acheteur ba33</CardDescription>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <div className={index === 0 ? "flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground" : "flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground"}>
                {index + 1}
              </div>
              <span className="text-xs text-muted-foreground">{step}</span>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 px-8 pb-8 pt-0">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="signup-email">
              Email professionnel
            </label>
            <Input id="signup-email" type="email" placeholder="contact@entreprise.dz" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="signup-password">
              Mot de passe
            </label>
            <Input id="signup-password" type="password" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="signup-confirm">
              Confirmation du mot de passe
            </label>
            <Input id="signup-confirm" type="password" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="company-name">
                Nom entreprise
              </label>
              <Input id="company-name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="company-nif">
                NIF / NUIS
              </label>
              <Input id="company-nif" className="font-mono" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="company-sector">
                Secteur
              </label>
              <Input id="company-sector" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="company-channel">
                Canal principal
              </label>
              <Input id="company-channel" placeholder="National / Export / Institutionnel" />
            </div>
          </div>
          <div className="space-y-2 rounded-xl border border-border bg-muted p-4">
            <p className="text-sm font-medium text-foreground">Email de verification</p>
            <p className="text-sm text-muted-foreground">Email de verification envoye a contact@entreprise.dz</p>
            <Button variant="outline" size="sm">
              Renvoyer
            </Button>
          </div>
        </div>

        <Button className="w-full">Creer mon compte</Button>

        <p className="text-center text-sm text-muted-foreground">
          Deja inscrit ?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
