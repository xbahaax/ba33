'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@ba33/ui-web';
import { Package, RefreshCw } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3100';

const STATUS_LABELS: Record<string, string> = {
  announced: 'Annoncé', collected: 'Collecté', in_transit: 'En transit',
  received_depot: 'Reçu dépôt', in_pretri: 'Pré-tri', stored: 'Stocké',
  washing: 'Lavage', washed: 'Lavé', qualified: 'Qualifié', certified: 'Certifié',
  sold: 'Vendu', rejected: 'Rejeté', quarantined: 'Quarantaine',
};

const SOURCE_LABELS: Record<string, string> = {
  c1_shepherd: 'Berger (C1)', c2_slaughterhouse: 'Abattoir (C2)', c3_aggregator: 'Agrégateur (C3)',
};

export default function LotsPage() {
  const router = useRouter();
  const [lots, setLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLots = async () => {
    const token = localStorage.getItem('ba33_token');
    if (!token) { router.push('/login'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/lots`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401 || res.status === 403) { router.push('/login'); return; }
      if (!res.ok) throw new Error('Erreur serveur');
      setLots(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLots(); }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lots</h1>
          <p className="text-sm text-muted-foreground">Suivi de tous les lots de laine dans le système</p>
        </div>
        <button onClick={fetchLots} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors">
          <RefreshCw className="h-4 w-4" /> Actualiser
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <Card><CardContent className="py-12 text-center text-destructive">{error}</CardContent></Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" /> {lots.length} lots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-left">
                    <th className="py-3 px-2 font-medium">QR Code</th>
                    <th className="py-3 px-2 font-medium">Statut</th>
                    <th className="py-3 px-2 font-medium">Source</th>
                    <th className="py-3 px-2 font-medium text-right">Poids déclaré</th>
                    <th className="py-3 px-2 font-medium text-right">Poids réel</th>
                    <th className="py-3 px-2 font-medium text-center">Urgent</th>
                    <th className="py-3 px-2 font-medium">Date</th>
                    <th className="py-3 px-2 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {lots.map((lot, i) => (
                    <tr key={lot.id} className={`border-b border-border/50 hover:bg-accent/50 transition-colors ${i % 2 ? 'bg-muted/30' : ''}`}>
                      <td className="py-3 px-2">
                        <code className="font-mono text-xs bg-muted px-2 py-1 rounded-md">{lot.qrCode}</code>
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant="outline" className="text-xs">{STATUS_LABELS[lot.status] || lot.status}</Badge>
                      </td>
                      <td className="py-3 px-2">{SOURCE_LABELS[lot.sourceType] || lot.sourceType || '—'}</td>
                      <td className="py-3 px-2 text-right font-mono">{lot.declaredWeightKg ? `${lot.declaredWeightKg} kg` : '—'}</td>
                      <td className="py-3 px-2 text-right font-mono">{lot.actualWeightKg ? `${lot.actualWeightKg} kg` : '—'}</td>
                      <td className="py-3 px-2 text-center">{lot.isUrgent ? <Badge variant="destructive" className="text-xs">Urgent</Badge> : '—'}</td>
                      <td className="py-3 px-2 text-muted-foreground text-xs">{lot.createdAt ? new Date(lot.createdAt).toLocaleDateString('fr-FR') : '—'}</td>
                      <td className="py-3 px-2 text-muted-foreground text-xs max-w-48 truncate">{lot.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {lots.length === 0 && (
              <p className="py-12 text-center text-muted-foreground">Aucun lot trouvé.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
