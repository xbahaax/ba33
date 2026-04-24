"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, Button, Input } from "@ba33/ui-web";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold text-foreground">Paramètres</h1>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-xs">
        <h2 className="text-lg font-semibold text-foreground">Sécurité</h2>
        <div className="space-y-3 text-sm">
          <p>Email : <span className="font-mono">contact@nourafibres.dz</span></p>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Changer le mot de passe</Button>
            </DialogTrigger>
            <DialogContent className="rounded-xl shadow-lg">
              <DialogHeader>
                <DialogTitle>Changer le mot de passe</DialogTitle>
                <DialogDescription>Ancien mot de passe, nouveau mot de passe et confirmation.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <Input type="password" placeholder="Ancien mot de passe" />
                <Input type="password" placeholder="Nouveau mot de passe" />
                <Input type="password" placeholder="Confirmation" />
                <Button>Enregistrer</Button>
              </div>
            </DialogContent>
          </Dialog>
          <label className="flex items-center gap-3 text-sm text-muted-foreground">
            <input type="checkbox" defaultChecked />
            Authentification 2FA activée
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-xs">
        <h2 className="text-lg font-semibold text-foreground">Préférences</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <select className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
            <option>Français</option>
            <option>العربية</option>
            <option>English</option>
          </select>
          <select className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
            <option>DZD</option>
            <option>EUR</option>
            <option>USD</option>
          </select>
        </div>
        <div className="grid gap-3 text-sm text-muted-foreground">
          <label className="flex items-center gap-3"><input type="checkbox" defaultChecked /> Confirmations de commande</label>
          <label className="flex items-center gap-3"><input type="checkbox" defaultChecked /> Expéditions</label>
          <label className="flex items-center gap-3"><input type="checkbox" /> Nouvelles disponibilités</label>
          <label className="flex items-center gap-3"><input type="checkbox" /> Offres commerciales</label>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-xs">
        <h2 className="text-lg font-semibold text-foreground">Données & confidentialité</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline">Télécharger mes données</Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
                Demander la suppression du compte
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-xl shadow-lg">
              <DialogHeader>
                <DialogTitle>Confirmer la suppression du compte</DialogTitle>
                <DialogDescription>Tapez SUPPRIMER pour confirmer.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <Input className="font-mono" placeholder="SUPPRIMER" />
                <Button variant="destructive">Confirmer</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>
    </div>
  );
}
