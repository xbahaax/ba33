"use client";

import { useMemo, useState } from "react";
import { Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, Input } from "@ba33/ui-web";
import { Edit, Trash2 } from "lucide-react";
import { addresses as mockAddresses } from "@/lib/mock/orders";
import type { Address } from "@/lib/types/order";
import { ConfirmActionDialog } from "@/components/buyer/shared/confirm-action-dialog";

type AddressDraft = {
  siteName: string;
  line1: string;
  line2: string;
  commune: string;
  wilaya: string;
  postalCode: string;
  instructions: string;
};

const emptyDraft: AddressDraft = {
  siteName: "",
  line1: "",
  line2: "",
  commune: "",
  wilaya: "",
  postalCode: "",
  instructions: "",
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const [draft, setDraft] = useState<AddressDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const dialogTitle = useMemo(() => (editingId ? "Modifier une adresse" : "Ajouter une adresse"), [editingId]);

  const openCreate = () => {
    setEditingId(null);
    setDraft(emptyDraft);
  };

  const openEdit = (address: Address) => {
    setEditingId(address.id);
    setDraft({
      siteName: address.siteName,
      line1: address.line1,
      line2: address.line2 ?? "",
      commune: address.commune,
      wilaya: address.wilaya,
      postalCode: address.postalCode,
      instructions: address.instructions ?? "",
    });
  };

  const saveDraft = () => {
    if (!draft.siteName || !draft.line1 || !draft.commune || !draft.wilaya || !draft.postalCode) {
      return;
    }

    if (editingId) {
      setAddresses((current) =>
        current.map((address) =>
          address.id === editingId
            ? {
                ...address,
                ...draft,
                line2: draft.line2 || undefined,
                instructions: draft.instructions || undefined,
              }
            : address
        )
      );
      return;
    }

    setAddresses((current) => [
      ...current,
      {
        id: `ADDR-${Date.now()}`,
        ...draft,
        line2: draft.line2 || undefined,
        instructions: draft.instructions || undefined,
      },
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Adresses</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" onClick={openCreate}>
              Ajouter une adresse
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-xl shadow-lg">
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
              <DialogDescription>Informations de livraison.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <Input value={draft.siteName} placeholder="Nom du site" onChange={(event) => setDraft((current) => ({ ...current, siteName: event.target.value }))} />
              <Input value={draft.line1} placeholder="Adresse ligne 1" onChange={(event) => setDraft((current) => ({ ...current, line1: event.target.value }))} />
              <Input value={draft.line2} placeholder="Adresse ligne 2" onChange={(event) => setDraft((current) => ({ ...current, line2: event.target.value }))} />
              <Input value={draft.commune} placeholder="Commune" onChange={(event) => setDraft((current) => ({ ...current, commune: event.target.value }))} />
              <Input value={draft.wilaya} placeholder="Wilaya" onChange={(event) => setDraft((current) => ({ ...current, wilaya: event.target.value }))} />
              <Input value={draft.postalCode} placeholder="Code postal" onChange={(event) => setDraft((current) => ({ ...current, postalCode: event.target.value }))} />
              <textarea
                className="min-h-24 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                placeholder="Instructions"
                value={draft.instructions}
                onChange={(event) => setDraft((current) => ({ ...current, instructions: event.target.value }))}
              />
              <div className="flex justify-end gap-3">
                <DialogClose asChild>
                  <Button variant="outline" type="button">
                    Annuler
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button type="button" onClick={saveDraft}>
                    Enregistrer
                  </Button>
                </DialogClose>
              </div>
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
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => openEdit(address)}
                    className="rounded-lg border-primary/30 text-primary hover:border-primary/50 hover:bg-primary/10"
                  >
                    <Edit className="h-4 w-4" />
                    Modifier
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-xl shadow-lg">
                  <DialogHeader>
                    <DialogTitle>{dialogTitle}</DialogTitle>
                    <DialogDescription>Modifier l&apos;adresse sélectionnée.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <Input value={draft.siteName} placeholder="Nom du site" onChange={(event) => setDraft((current) => ({ ...current, siteName: event.target.value }))} />
                    <Input value={draft.line1} placeholder="Adresse ligne 1" onChange={(event) => setDraft((current) => ({ ...current, line1: event.target.value }))} />
                    <Input value={draft.line2} placeholder="Adresse ligne 2" onChange={(event) => setDraft((current) => ({ ...current, line2: event.target.value }))} />
                    <Input value={draft.commune} placeholder="Commune" onChange={(event) => setDraft((current) => ({ ...current, commune: event.target.value }))} />
                    <Input value={draft.wilaya} placeholder="Wilaya" onChange={(event) => setDraft((current) => ({ ...current, wilaya: event.target.value }))} />
                    <Input value={draft.postalCode} placeholder="Code postal" onChange={(event) => setDraft((current) => ({ ...current, postalCode: event.target.value }))} />
                    <textarea
                      className="min-h-24 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Instructions"
                      value={draft.instructions}
                      onChange={(event) => setDraft((current) => ({ ...current, instructions: event.target.value }))}
                    />
                    <div className="flex justify-end gap-3">
                      <DialogClose asChild>
                        <Button variant="outline" type="button">
                          Annuler
                        </Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button type="button" onClick={saveDraft}>
                          Enregistrer
                        </Button>
                      </DialogClose>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <ConfirmActionDialog
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg border-destructive/50 bg-destructive/5 text-destructive hover:border-destructive hover:bg-destructive/15"
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </Button>
                }
                title="Supprimer l'adresse"
                description="Cette adresse sera retirée de la liste de livraison."
                confirmLabel="Supprimer"
                destructive
                onConfirm={() => setAddresses((current) => current.filter((item) => item.id !== address.id))}
              />

              {!address.isDefault ? (
                <ConfirmActionDialog
                  trigger={
                    <Button variant="ghost" size="sm" type="button">
                      Définir par défaut
                    </Button>
                  }
                  title="Définir par défaut"
                  description="Cette adresse deviendra l'adresse principale pour les prochaines commandes."
                  confirmLabel="Définir"
                  onConfirm={() =>
                    setAddresses((current) =>
                      current.map((item) => ({
                        ...item,
                        isDefault: item.id === address.id,
                      }))
                    )
                  }
                />
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
