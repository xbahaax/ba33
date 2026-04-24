'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Badge } from '@ba33/ui-web';
import { Shield, CheckCircle, AlertTriangle, XCircle, Search } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3100';

export default function ConformitePage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('ba33_token');
    if (!token) { router.push('/login'); return; }

    fetch(`${API}/institutional/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (res.status === 401 || res.status === 403) { router.push('/login'); return null; }
        return res.json();
      })
      .then(data => { if (data) setDashboard(data); })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = async () => {
    if (!searchCode.trim()) return;
    const token = localStorage.getItem('ba33_token');
    if (!token) return;
    setSearching(true);
    setSearchResult(null);
    try {
      const res = await fetch(`${API}/lots/qr/${encodeURIComponent(searchCode.trim())}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSearchResult({ found: true, data: await res.json() });
      } else {
        setSearchResult({ found: false });
      }
    } catch {
      setSearchResult({ found: false });
    } finally {
      setSearching(false);
    }
  };

  const urgentLots = dashboard?.lots?.byStatus?.quarantined || 0;
  const rejectedLots = dashboard?.lots?.byStatus?.rejected || 0;
  const totalLots = dashboard?.lots?.total || 0;
  const conformRate = totalLots > 0 ? (((totalLots - rejectedLots) / totalLots) * 100).toFixed(1) : '100.0';

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Conformité</h1>
        <p className="text-sm text-muted-foreground">Vérification réglementaire et traçabilité des lots</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-600"><CheckCircle className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Taux de conformité</p>
                    <p className="text-3xl font-bold font-mono text-foreground">{conformRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-600"><AlertTriangle className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">En quarantaine</p>
                    <p className="text-3xl font-bold font-mono text-foreground">{urgentLots}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-600"><XCircle className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rejetés</p>
                    <p className="text-3xl font-bold font-mono text-foreground">{rejectedLots}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* QR Code lookup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5" /> Vérification de lot</CardTitle>
              <CardDescription>Rechercher un lot par code QR pour vérifier sa traçabilité</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Ex: BA33-LOT-001"
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  onClick={handleSearch}
                  disabled={searching}
                  className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {searching ? 'Recherche...' : 'Vérifier'}
                </button>
              </div>

              {searchResult && (
                <div className="mt-4">
                  {searchResult.found ? (
                    <div className="rounded-lg border border-border p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-foreground">Lot vérifié</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-muted-foreground">QR Code:</span> <code className="font-mono">{searchResult.data.qrCode}</code></div>
                        <div><span className="text-muted-foreground">Statut:</span> <Badge variant="outline">{searchResult.data.status}</Badge></div>
                        <div><span className="text-muted-foreground">Poids déclaré:</span> <span className="font-mono">{searchResult.data.declaredWeightKg} kg</span></div>
                        <div><span className="text-muted-foreground">Poids réel:</span> <span className="font-mono">{searchResult.data.actualWeightKg || '—'} kg</span></div>
                        <div><span className="text-muted-foreground">Urgent:</span> {searchResult.data.isUrgent ? 'Oui' : 'Non'}</div>
                        <div><span className="text-muted-foreground">Date:</span> {new Date(searchResult.data.createdAt).toLocaleDateString('fr-FR')}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-destructive" />
                      <span className="text-sm text-destructive">Aucun lot trouvé avec ce code.</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conformity rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Règles de conformité</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { rule: 'Traçabilité QR obligatoire', status: 'active', desc: 'Chaque lot doit avoir un code QR unique' },
                  { rule: 'Pesée en entrée/sortie', status: 'active', desc: 'Écart maximum toléré: 2% entre poids déclaré et réel' },
                  { rule: 'Chaîne du froid (C2)', status: 'active', desc: 'Température < 8°C pour les lots abattoir' },
                  { rule: 'Délai de collecte', status: 'active', desc: 'Maximum 72h entre déclaration et collecte' },
                  { rule: 'Audit de réception dépôt', status: 'active', desc: 'Vérification visuelle + pesée à chaque entrée' },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg border border-border/50">
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.rule}</p>
                      <p className="text-xs text-muted-foreground">{r.desc}</p>
                    </div>
                    <Badge variant="default" className="text-xs">Actif</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
