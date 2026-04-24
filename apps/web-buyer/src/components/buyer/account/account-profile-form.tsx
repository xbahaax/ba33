"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@ba33/ui-web";
import type { SessionUser } from "@/lib/api/buyer-api";
import { updateMyProfileFromClient } from "@/lib/auth/client-session";

type ProfileDraft = SessionUser["profile"];

export function AccountProfileForm({ session }: { session: SessionUser }) {
  const [draft, setDraft] = useState<ProfileDraft>(session.profile);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <Card className="rounded-xl shadow-xs">
      <CardHeader>
        <CardTitle>Informations entreprise</CardTitle>
      </CardHeader>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setSaving(true);
          setMessage(null);
          try {
            const updatedUser = await updateMyProfileFromClient(draft);
            setDraft(updatedUser.profile);
            setMessage("Profil mis a jour.");
          } catch {
            setMessage("Echec de la mise a jour du profil.");
          } finally {
            setSaving(false);
          }
        }}
      >
        <CardContent className="grid gap-4 md:grid-cols-2">
        <Field label="Nom entreprise" value={draft.companyName} onChange={(value) => setDraft((current) => ({ ...current, companyName: value }))} />
        <Field label="NIF / NUIS" value={draft.registrationNumber} onChange={(value) => setDraft((current) => ({ ...current, registrationNumber: value }))} mono />
        <Field label="Secteur d'activite" value={draft.sector} onChange={(value) => setDraft((current) => ({ ...current, sector: value }))} />
        <Field label="Site web" value={draft.website} onChange={(value) => setDraft((current) => ({ ...current, website: value }))} />
        <Field label="Prenom contact" value={draft.firstName} onChange={(value) => setDraft((current) => ({ ...current, firstName: value }))} />
        <Field label="Nom contact" value={draft.lastName} onChange={(value) => setDraft((current) => ({ ...current, lastName: value }))} />
        <Field label="Telephone" value={draft.phone} onChange={(value) => setDraft((current) => ({ ...current, phone: value }))} />
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Canal principal</label>
          <select
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
            value={draft.preferredChannel}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                preferredChannel: event.target.value as ProfileDraft["preferredChannel"],
              }))
            }
          >
            <option value="national">National</option>
            <option value="export">Export</option>
            <option value="institutional">Institutionnel</option>
          </select>
        </div>

        <div className="md:col-span-2 flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        </div>
        </CardContent>
      </form>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
  mono,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  mono?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} className={mono ? "font-mono" : undefined} />
    </div>
  );
}
