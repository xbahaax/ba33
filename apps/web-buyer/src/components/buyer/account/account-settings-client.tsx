"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, Button, Input } from "@ba33/ui-web";
import type { SessionUser } from "@/lib/api/buyer-api";
import { changeMyPasswordFromClient, updateMyProfileFromClient } from "@/lib/auth/client-session";

export function AccountSettingsClient({ session }: { session: SessionUser }) {
  const [preferences, setPreferences] = useState(session.profile);
  const [message, setMessage] = useState<string | null>(null);
  const [passwordState, setPasswordState] = useState({ currentPassword: "", nextPassword: "", confirmPassword: "" });
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold text-foreground">Parametres</h1>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-xs">
        <h2 className="text-lg font-semibold text-foreground">Securite</h2>
        <div className="space-y-3 text-sm">
          <p>Email : <span className="font-mono">{session.email}</span></p>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Changer le mot de passe</Button>
            </DialogTrigger>
            <DialogContent className="rounded-xl shadow-lg">
              <DialogHeader>
                <DialogTitle>Changer le mot de passe</DialogTitle>
                <DialogDescription>Ancien mot de passe, nouveau mot de passe et confirmation.</DialogDescription>
              </DialogHeader>
              <form
                className="grid gap-4"
                onSubmit={async (event) => {
                  event.preventDefault();
                  setPasswordMessage(null);

                  if (passwordState.nextPassword !== passwordState.confirmPassword) {
                    setPasswordMessage("La confirmation du nouveau mot de passe est invalide.");
                    return;
                  }

                  try {
                    await changeMyPasswordFromClient({
                      currentPassword: passwordState.currentPassword,
                      nextPassword: passwordState.nextPassword,
                    });
                    setPasswordMessage("Mot de passe mis a jour.");
                    setPasswordState({ currentPassword: "", nextPassword: "", confirmPassword: "" });
                  } catch {
                    setPasswordMessage("Echec de mise a jour du mot de passe.");
                  }
                }}
              >
                <Input
                  type="password"
                  placeholder="Ancien mot de passe"
                  value={passwordState.currentPassword}
                  onChange={(event) => setPasswordState((current) => ({ ...current, currentPassword: event.target.value }))}
                />
                <Input
                  type="password"
                  placeholder="Nouveau mot de passe"
                  value={passwordState.nextPassword}
                  onChange={(event) => setPasswordState((current) => ({ ...current, nextPassword: event.target.value }))}
                />
                <Input
                  type="password"
                  placeholder="Confirmation"
                  value={passwordState.confirmPassword}
                  onChange={(event) => setPasswordState((current) => ({ ...current, confirmPassword: event.target.value }))}
                />
                {passwordMessage ? <p className="text-sm text-muted-foreground">{passwordMessage}</p> : null}
                <Button type="submit">Enregistrer</Button>
              </form>
            </DialogContent>
          </Dialog>
          <label className="flex items-center gap-3 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={preferences.twoFactorEnabled}
              onChange={(event) => setPreferences((current) => ({ ...current, twoFactorEnabled: event.target.checked }))}
            />
            Authentification 2FA activee
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-xs">
        <h2 className="text-lg font-semibold text-foreground">Preferences</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <select
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
            value={preferences.language}
            onChange={(event) =>
              setPreferences((current) => ({
                ...current,
                language: event.target.value as SessionUser["profile"]["language"],
              }))
            }
          >
            <option value="fr">Francais</option>
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
          <select
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
            value={preferences.currency}
            onChange={(event) =>
              setPreferences((current) => ({
                ...current,
                currency: event.target.value as SessionUser["profile"]["currency"],
              }))
            }
          >
            <option value="DZD">DZD</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <div className="grid gap-3 text-sm text-muted-foreground">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={preferences.notifications.orderConfirmations}
              onChange={(event) =>
                setPreferences((current) => ({
                  ...current,
                  notifications: { ...current.notifications, orderConfirmations: event.target.checked },
                }))
              }
            />
            Confirmations de commande
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={preferences.notifications.shipments}
              onChange={(event) =>
                setPreferences((current) => ({
                  ...current,
                  notifications: { ...current.notifications, shipments: event.target.checked },
                }))
              }
            />
            Expeditions
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={preferences.notifications.newAvailability}
              onChange={(event) =>
                setPreferences((current) => ({
                  ...current,
                  notifications: { ...current.notifications, newAvailability: event.target.checked },
                }))
              }
            />
            Nouvelles disponibilites
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={preferences.notifications.offers}
              onChange={(event) =>
                setPreferences((current) => ({
                  ...current,
                  notifications: { ...current.notifications, offers: event.target.checked },
                }))
              }
            />
            Offres commerciales
          </label>
        </div>
        <Button
          type="button"
          onClick={async () => {
            setMessage(null);
            try {
              const updated = await updateMyProfileFromClient(preferences);
              setPreferences(updated.profile);
              setMessage("Preferences enregistrees.");
            } catch {
              setMessage("Echec de la sauvegarde des preferences.");
            }
          }}
        >
          Enregistrer les preferences
        </Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </section>
    </div>
  );
}
