'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@ba33/ui-web';
import { FileText, Download, Clock } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3100';

export default function RapportsPage() {
  const router = useRouter();
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ba33_token');
    if (!token) { router.push('/login'); return; }

    fetch(`${API}/institutional/activity?limit=30`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (res.status === 401 || res.status === 403) { router.push('/login'); return null; }
        return res.json();
      })
      .then(data => { if (data) setActivity(data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Rapports</h1>
        <p className="text-sm text-muted-foreground">Rapports d&apos;activité et historique des opérations</p>
      </div>

      {/* Report types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><FileText className="h-5 w-5" /></div>
              <div>
                <CardTitle className="text-base">Rapport de production</CardTitle>
                <CardDescription>Vue d&apos;ensemble de la filière</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Lots collectés, poids total, sources actives, taux de rendement par période.</p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Download className="h-5 w-5" /></div>
              <div>
                <CardTitle className="text-base">Export données</CardTitle>
                <CardDescription>CSV & XML réglementaire</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Export filtré par région, période, type de source. Formats CSV et XML standardisé.</p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Clock className="h-5 w-5" /></div>
              <div>
                <CardTitle className="text-base">Filings réglementaires</CardTitle>
                <CardDescription>Soumissions automatiques</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Déclarations périodiques de production, fiches d&apos;exportation, statistiques nationales.</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
          <CardDescription>Dernières opérations sur la plateforme</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />)}
            </div>
          ) : activity ? (
            <div className="space-y-6">
              {activity.recentLots?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3">Lots récents</h3>
                  <div className="space-y-2">
                    {activity.recentLots.map((lot: any) => (
                      <div key={lot.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 border border-border/50">
                        <div className="flex items-center gap-3">
                          <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{lot.qrCode || lot.id?.substring(0, 12)}</code>
                          <span className="text-sm text-muted-foreground">{lot.status}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{lot.createdAt ? new Date(lot.createdAt).toLocaleString('fr-FR') : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activity.recentPreLots?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3">Déclarations récentes</h3>
                  <div className="space-y-2">
                    {activity.recentPreLots.map((pl: any) => (
                      <div key={pl.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 border border-border/50">
                        <div className="flex items-center gap-3">
                          <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{pl.id?.substring(0, 12)}</code>
                          <span className="text-sm text-muted-foreground">{pl.status}</span>
                          <span className="text-sm font-mono">{pl.weight} kg</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{pl.createdAt ? new Date(pl.createdAt).toLocaleString('fr-FR') : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="py-12 text-center text-muted-foreground">Aucune activité récente.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
