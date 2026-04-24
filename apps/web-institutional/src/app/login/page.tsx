"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input, Badge, Card, CardHeader, CardTitle, CardContent } from "@ba33/ui-web";
import { Building2, Lock, ArrowLeft, ChevronDown } from "lucide-react";
import { INSTITUTIONS } from "@/lib/mock-data";
import { setSession, DEMO_CREDENTIALS } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [selectedInstitution, setSelectedInstitution] = useState(INSTITUTIONS[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [email, setEmail] = useState(DEMO_CREDENTIALS[INSTITUTIONS[0].id].email);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInstitutionSelect = (inst: typeof INSTITUTIONS[0]) => {
    setSelectedInstitution(inst);
    setEmail(DEMO_CREDENTIALS[inst.id].email);
    setShowDropdown(false);
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError("Email requis"); return; }
    setIsLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 800));
    const creds = DEMO_CREDENTIALS[selectedInstitution.id];
    setSession({
      institutionId: selectedInstitution.id,
      userEmail: creds.email,
      userName: creds.name,
    });
    router.push("/dashboard");
  };

  const handleDemo = async (institutionId: string) => {
    const inst = INSTITUTIONS.find((i) => i.id === institutionId)!;
    const creds = DEMO_CREDENTIALS[institutionId];
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setSession({ institutionId: inst.id, userEmail: creds.email, userName: creds.name });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Retour</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-xs font-mono">b</div>
            <span className="font-semibold text-sm">ba33</span>
            <Badge variant="outline" className="text-xs">Institutionnel</Badge>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Title */}
          <div className="text-center space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground mx-auto mb-4">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold">Connexion institutionnelle</h1>
            <p className="text-sm text-muted-foreground">
              Accès réservé aux agents habilités des institutions partenaires.
            </p>
          </div>

          {/* Login form */}
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Institution selector */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Institution</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="w-full flex items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-left">{selectedInstitution.shortName}</span>
                        <span className="text-muted-foreground text-xs truncate max-w-[200px]">{selectedInstitution.name.split(" ").slice(0, 4).join(" ")}…</span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    </button>
                    {showDropdown && (
                      <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
                        {INSTITUTIONS.map((inst) => (
                          <button
                            key={inst.id}
                            type="button"
                            onClick={() => handleInstitutionSelect(inst)}
                            className="w-full flex items-start gap-3 px-3 py-2.5 text-sm hover:bg-accent transition-colors text-left"
                          >
                            <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            <div>
                              <div className="font-medium">{inst.shortName}</div>
                              <div className="text-xs text-muted-foreground">{inst.name}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Email institutionnel</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom@institution.gov.dz"
                    className="font-mono text-sm"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Mot de passe</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <p className="text-xs text-muted-foreground">Démo : n&apos;importe quel mot de passe fonctionne.</p>
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Connexion…" : "Se connecter"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quick demo */}
          <div className="space-y-2">
            <p className="text-xs text-center text-muted-foreground">Accès démo rapide par institution</p>
            <div className="grid grid-cols-2 gap-2">
              {INSTITUTIONS.map((inst) => (
                <button
                  key={inst.id}
                  onClick={() => handleDemo(inst.id)}
                  disabled={isLoading}
                  className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs hover:bg-accent transition-colors text-left disabled:opacity-50"
                >
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="font-medium">{inst.shortName}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
