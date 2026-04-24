'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@ba33/ui-web';
import { Building2, RefreshCw } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3100/api/v1';

const SOURCE_LABELS: Record<string, string> = {
  c1_shepherd: 'Berger (C1)', c2_slaughterhouse: 'Abattoir (C2)', c3_aggregator: 'Agrégateur (C3)',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Actif', pending: 'En attente', suspended: 'Suspendu',
};

export default function SourcesPage() {
  const router = useRouter();
  const [sources, setSources] = useState<any[]>([]);
  const [byRegion, setByRegion] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const token = localStorage.getItem('ba33_token');
    if (!token) { router.push('/login'); return; }
    setLoading(true);
    try {
      const [srcRes, regRes] = await Promise.all([
        fetch(`${API}/sources`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/institutional/sources-by-region`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (srcRes.status === 401 || srcRes.status === 403) { router.push('/login'); return; }
      setSources(await srcRes.json());
      if (regRes.ok) setByRegion(await regRes.json());
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Group by region
  const regionMap = byRegion.reduce((acc: Record<string, any[]>, r) => {
    const name = r.regionName || 'Inconnu';
    if (!acc[name]) acc[name] = [];
    acc[name].push(r);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sources</h1>
          <p className="text-sm text-muted-foreground">Bergers, abattoirs et agrégateurs enregistrés</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors">
          <RefreshCw className="h-4 w-4" /> Actualiser
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(SOURCE_LABELS).map(([key, label]) => {
              const count = sources.filter(s => s.sourceType === key).length;
              return (
                <Card key={key}>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-3xl font-bold font-mono text-foreground mt-1">{count}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* By region */}
          {Object.keys(regionMap).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Par région</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(regionMap).map(([region, items]) => (
                    <div key={region} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <span className="font-medium text-foreground">{region}</span>
                      <div className="flex gap-2">
                        {items.map((item: any, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {SOURCE_LABELS[item.sourceType] || item.sourceType}: {item.count}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Full table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Toutes les sources ({sources.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-left">
                      <th className="py-3 px-2 font-medium">Nom</th>
                      <th className="py-3 px-2 font-medium">Type</th>
                      <th className="py-3 px-2 font-medium">Statut</th>
                      <th className="py-3 px-2 font-medium">Téléphone</th>
                      <th className="py-3 px-2 font-medium">Adresse</th>
                      <th className="py-3 px-2 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sources.map((src, i) => (
                      <tr key={src.id} className={`border-b border-border/50 hover:bg-accent/50 transition-colors ${i % 2 ? 'bg-muted/30' : ''}`}>
                        <td className="py-3 px-2 font-medium text-foreground">{src.name}</td>
                        <td className="py-3 px-2"><Badge variant="outline" className="text-xs">{SOURCE_LABELS[src.sourceType] || src.sourceType}</Badge></td>
                        <td className="py-3 px-2"><Badge variant={src.status === 'active' ? 'default' : 'secondary'} className="text-xs">{STATUS_LABELS[src.status] || src.status}</Badge></td>
                        <td className="py-3 px-2 font-mono text-xs">{src.contactPhone || '—'}</td>
                        <td className="py-3 px-2 text-muted-foreground text-xs max-w-48 truncate">{src.address || '—'}</td>
                        <td className="py-3 px-2 text-muted-foreground text-xs">{src.createdAt ? new Date(src.createdAt).toLocaleDateString('fr-FR') : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {sources.length === 0 && <p className="py-12 text-center text-muted-foreground">Aucune source trouvée.</p>}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
