"use client";

import { useState } from "react";
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, Input } from "@ba33/ui-web";
import type { Address } from "@/lib/types/order";

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

type Props = {
  addressList: Address[];
  selectedAddressId: string;
  onSelectAddress: (id: string) => void;
  onAddressCreated: (draft: Omit<Address, "id" | "isDefault">) => Promise<Address | null>;
};

export function CheckoutAddressSelection({ addressList, selectedAddressId, onSelectAddress, onAddressCreated }: Props) {
  const [draft, setDraft] = useState<AddressDraft>(emptyDraft);
  const [isSaving, setIsSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const saveAddress = async () => {
    if (!draft.siteName || !draft.line1 || !draft.commune || !draft.wilaya || !draft.postalCode) {
      return;
    }

    setIsSaving(true);
    try {
      await onAddressCreated({
        siteName: draft.siteName,
        line1: draft.line1,
        line2: draft.line2 || undefined,
        commune: draft.commune,
        wilaya: draft.wilaya,
        postalCode: draft.postalCode,
        instructions: draft.instructions || undefined,
      });
      setDraft(emptyDraft);
      setOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-foreground">Adresse de livraison</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {addressList.map((address) => {
          const isSelected = selectedAddressId === address.id;

          return (
            <button
              key={address.id}
              type="button"
              onClick={() => onSelectAddress(address.id)}
              className={isSelected ? "rounded-xl border-2 border-primary bg-primary/5 p-4 text-left" : "rounded-xl border-2 border-transparent p-4 text-left hover:border-primary/50"}
            >
              <p className="font-medium text-foreground">{address.siteName}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {address.line1}, {address.commune}, {address.wilaya}
              </p>
            </button>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" type="button" onClick={() => setDraft(emptyDraft)}>
            + Nouvelle adresse
          </Button>
        </DialogTrigger>
        <DialogContent className="rounded-xl shadow-lg">
          <DialogHeader>
            <DialogTitle>Ajouter une adresse</DialogTitle>
            <DialogDescription>Ajoutez une nouvelle adresse de livraison pour cette commande.</DialogDescription>
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
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button type="button" disabled={isSaving} onClick={saveAddress}>
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
