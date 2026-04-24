"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@ba33/ui-web";
import { signup } from "@/lib/auth/client-session";

const steps = ["Compte", "Entreprise", "Verification"];

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const password = String(formData.get("password") ?? "");
            const confirmPassword = String(formData.get("confirmPassword") ?? "");

            if (password !== confirmPassword) {
              setError("La confirmation du mot de passe ne correspond pas.");
              return;
            }

            setLoading(true);
            setError(null);

            try {
              const firstName = String(formData.get("firstName") ?? "").trim();
              const lastName = String(formData.get("lastName") ?? "").trim();

              await signup({
                email: String(formData.get("email") ?? ""),
                password,
                fullName: `${firstName} ${lastName}`.trim(),
                companyName: String(formData.get("companyName") ?? ""),
                registrationNumber: String(formData.get("registrationNumber") ?? ""),
              });
              router.push("/catalog");
            } catch {
              setError("Inscription impossible. Vérifiez les informations saisies.");
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="signup-email">
              Email professionnel
            </label>
            <Input id="signup-email" name="email" type="email" placeholder="contact@entreprise.dz" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="signup-password">
              Mot de passe
            </label>
            <Input id="signup-password" name="password" type="password" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="signup-confirm">
              Confirmation du mot de passe
            </label>
            <Input id="signup-confirm" name="confirmPassword" type="password" required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="company-name">
                Nom entreprise
              </label>
              <Input id="company-name" name="companyName" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="company-nif">
                NIF / NUIS
              </label>
              <Input id="company-nif" name="registrationNumber" className="font-mono" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="contact-first-name">
                Prénom contact
              </label>
              <Input id="contact-first-name" name="firstName" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="contact-last-name">
                Nom contact
              </label>
              <Input id="contact-last-name" name="lastName" required />
            </div>
          </div>
          <div className="space-y-2 rounded-xl border border-border bg-muted p-4">
            <p className="text-sm font-medium text-foreground">Email de verification</p>
            <p className="text-sm text-muted-foreground">Email de verification envoye a contact@entreprise.dz</p>
            <Button variant="outline" size="sm" type="button">
              Renvoyer
            </Button>
          </div>
          {error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Creation..." : "Creer mon compte"}
          </Button>
        </form>

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
