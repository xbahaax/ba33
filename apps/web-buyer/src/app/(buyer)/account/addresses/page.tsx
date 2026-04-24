"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, Button, Input } from "@ba33/ui-web";
import { Edit, Trash2 } from "lucide-react";
import { addresses } from "@/lib/mock/orders";

export default function AddressesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Adresses</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Ajouter une adresse</Button>
          </DialogTrigger>
          <DialogContent className="rounded-xl shadow-lg">
            <DialogHeader>
              <DialogTitle>Ajouter une adresse</DialogTitle>
              <DialogDescription>Informations de livraison.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <Input placeholder="Nom du site" />
              <Input placeholder="Adresse ligne 1" />
              <Input placeholder="Adresse ligne 2" />
              <Input placeholder="Commune" />
              <Input placeholder="Wilaya" />
              <Input placeholder="Code postal" />
              <textarea className="min-h-24 rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Instructions" />
              <Button>Enregistrer</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {addresses.map((address) => (
          <article key={address.id} className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-foreground">{address.siteName}</h2>
                  {address.isDefault ? (
                    <span className="rounded-sm bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">Par défaut</span>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">{address.line1}</p>
                <p className="text-sm text-muted-foreground">{address.commune}, {address.wilaya}</p>
                <p className="text-sm italic text-muted-foreground">{address.instructions}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" />
                Modifier
              </Button>
              <Button variant="outline" size="sm" className="border-destructive text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
              {!address.isDefault ? <Button variant="ghost" size="sm">Définir par défaut</Button> : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
