"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ba33/ui-web";
import { StatusBadge } from "@/components/status-badge";
import { ActionFeedback } from "@/components/workflow-form-controls";
import {
  type CollectionJobSummary,
  type CollectorOption,
  assignCollectionJob,
  cancelCollectionJob,
  listCollectionJobs,
  listCollectors,
} from "@/lib/api";
import { formatDateTime, formatWeight, toNumber } from "@/lib/format";

const PROFESSION_LABEL: Record<string, string> = {
  shepherd: "Éleveur",
  slaughterhouse: "Abattoir",
  butcher: "Boucher",
  aggregator: "Agrégateur",
  other: "Autre",
};


export function CollectionJobsPanel() {
  const [jobs, setJobs] = useState<CollectionJobSummary[]>([]);
  const [collectors, setCollectors] = useState<CollectorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] =
    useState<"default" | "destructive" | "success">("default");
  const [pickedCollector, setPickedCollector] = useState<Record<string, string>>(
    {},
  );
  const [busyJob, setBusyJob] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [j, c] = await Promise.all([
      listCollectionJobs(),
      listCollectors(),
    ]);
    setJobs(j ?? []);
    setCollectors(c ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const i = setInterval(load, 15000);
    return () => clearInterval(i);
  }, []);

  function setCollectorFor(jobId: string, collectorId: string) {
    setPickedCollector((prev) => ({ ...prev, [jobId]: collectorId }));
  }

  async function onAssign(job: CollectionJobSummary) {
    const collectorId =
      pickedCollector[job.id] ?? job.collectorId ?? collectors[0]?.userId;
    if (!collectorId) {
      setFeedback("Aucun collecteur disponible.");
      setFeedbackTone("destructive");
      return;
    }
    setBusyJob(job.id);
    const res = await assignCollectionJob(job.id, collectorId);
    setBusyJob(null);
    if (res) {
      setFeedback(`Mission ${job.id.slice(0, 8)}… assignée.`);
      setFeedbackTone("success");
      load();
    } else {
      setFeedback("Échec de l'assignation.");
      setFeedbackTone("destructive");
    }
  }

  async function onCancel(job: CollectionJobSummary) {
    if (!window.confirm("Annuler cette mission de collecte ?")) return;
    setBusyJob(job.id);
    const res = await cancelCollectionJob(job.id, "Cancelled by depot manager");
    setBusyJob(null);
    if (res) {
      setFeedback(`Mission ${job.id.slice(0, 8)}… annulée.`);
      setFeedbackTone("default");
      load();
    } else {
      setFeedback("Échec de l'annulation.");
      setFeedbackTone("destructive");
    }
  }

  const openJobs = jobs.filter(
    (j) =>
      j.status !== "completed" &&
      j.status !== "cancelled",
  );
  const pending = openJobs.filter((j) => j.status === "pending");
  const inFlight = openJobs.filter((j) => j.status !== "pending");

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Missions de collecte</CardTitle>
          <CardDescription>
            Auto-émises à chaque déclaration de source. Assignez un collecteur
            pour démarrer la chaîne.
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <span className="text-xs text-muted-foreground">
            {pending.length} en attente · {inFlight.length} en cours
          </span>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            ↻
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {feedback ? (
          <ActionFeedback message={feedback} tone={feedbackTone} />
        ) : null}

        {loading && jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : openJobs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune mission ouverte. Les nouvelles déclarations apparaîtront ici.
          </p>
        ) : (
          <ul className="space-y-3">
            {openJobs.map((job) => (
              <li
                key={job.id}
                className="rounded-lg border bg-card p-4 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {job.source?.name ?? "Source inconnue"}
                      </p>
                      {job.source?.profession ? (
                        <span className="text-xs px-2 py-0.5 rounded bg-muted">
                          {PROFESSION_LABEL[job.source.profession] ??
                            job.source.profession}
                        </span>
                      ) : null}
                      {job.urgency === "urgent" ? (
                        <span className="inline-flex items-center rounded-md border border-transparent bg-destructive px-2.5 py-0.5 text-xs font-semibold text-destructive-foreground">
                          URGENT
                        </span>
                      ) : null}
                      <StatusBadge value={job.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {job.source?.address ?? "Adresse non renseignée"} →{" "}
                      {job.depot?.name ?? "Dépôt"}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>{formatDateTime(job.issuedAt)}</div>
                    {job.preLot ? (
                      <div className="font-mono">
                        {formatWeight(toNumber(job.preLot.estimatedWeightKg))}
                      </div>
                    ) : null}
                  </div>
                </div>

                {job.preLot?.notes ? (
                  <p className="text-xs text-muted-foreground italic">
                    {job.preLot.notes}
                  </p>
                ) : null}

                {job.status === "pending" ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      className="border rounded px-2 py-1 text-sm bg-background"
                      value={
                        pickedCollector[job.id] ??
                        collectors[0]?.userId ??
                        ""
                      }
                      onChange={(e) =>
                        setCollectorFor(job.id, e.target.value)
                      }
                    >
                      {collectors.length === 0 ? (
                        <option value="">Aucun collecteur</option>
                      ) : (
                        collectors.map((c) => (
                          <option key={c.userId} value={c.userId}>
                            {c.fullName ?? c.userId.slice(0, 8)}
                            {c.phone ? ` · ${c.phone}` : ""}
                          </option>
                        ))
                      )}
                    </select>
                    <Button
                      size="sm"
                      onClick={() => onAssign(job)}
                      disabled={busyJob === job.id || collectors.length === 0}
                    >
                      Assigner
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCancel(job)}
                      disabled={busyJob === job.id}
                    >
                      Annuler
                    </Button>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    Collecteur:{" "}
                    {collectors.find((c) => c.userId === job.collectorId)
                      ?.fullName ?? job.collectorId?.slice(0, 8) ?? "—"}
                    {job.acceptedAt ? ` · accepté ${formatDateTime(job.acceptedAt)}` : ""}
                    {job.startedAt ? ` · démarré ${formatDateTime(job.startedAt)}` : ""}
                    {job.arrivedAt ? ` · arrivé ${formatDateTime(job.arrivedAt)}` : ""}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
