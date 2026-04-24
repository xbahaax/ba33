'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@ba33/ui-web';
import { Lock, Phone } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3100/api/v1'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      if (!res.ok) throw new Error('Identifiants invalides');
      const data = await res.json();
      localStorage.setItem('ba33_token', data.accessToken);
      localStorage.setItem('ba33_refresh', data.refreshToken);
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-primary-foreground font-mono text-2xl font-bold">
            b
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Portail Institutionnel
          </h1>
          <p className="text-sm text-muted-foreground">
            Supervision de la filière laine — ba33
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Connexion</CardTitle>
            <CardDescription>
              Accédez au tableau de bord de supervision
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3 flex items-center gap-2">
                  <span className="shrink-0">&#9888;</span>
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Téléphone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0555000099"
                    className="w-full rounded-lg border border-input bg-background pl-10 pr-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-input bg-background pl-10 pr-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Connexion...
                  </span>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Plateforme nationale de traçabilité de la laine
        </p>
      </div>
    </div>
  );
}
