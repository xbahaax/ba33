"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Building2, Eye, Mail, LockKeyhole } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@ba33/ui-web";
import { login } from "@/lib/auth/client-session";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <Card className="rounded-xl border border-border bg-card text-card-foreground shadow-md">
      <CardHeader className="space-y-3 p-8">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
          <CardDescription>Portail Acheteur ba33</CardDescription>
        </div>
        <div className="border-t border-border" />
      </CardHeader>
      <CardContent className="space-y-6 px-8 pb-8 pt-0">
        <form
          className="space-y-6"
          onSubmit={async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const email = String(formData.get("email") ?? "");
            const password = String(formData.get("password") ?? "");

            setLoading(true);
            setError(null);

            try {
              await login({ email, password });
              const query = typeof window === "undefined" ? new URLSearchParams() : new URLSearchParams(window.location.search);
              const next = query.get("next") ?? "/catalog";
              router.push(next);
            } catch {
              setError("Identifiants invalides.");
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email professionnel
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" name="email" type="email" placeholder="acheteur@entreprise.dz" className="pl-9" required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">
              Mot de passe
            </label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="password" name="password" type="password" className="pl-9 pr-10" required />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label="Afficher le mot de passe"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link href="/signup" className="text-sm text-primary hover:underline">
              Creer un compte
            </Link>
          </div>

          {error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-2 text-sm text-muted-foreground">ou</span>
          </div>
        </div>

        <Button variant="outline" className="w-full" type="button" disabled>
          <Building2 className="h-4 w-4 mr-1.5" />
          Connexion SSO (Enterprise)
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Creer un compte
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
