"use client";

import { useState } from "react";
import { X, Download, FileText } from "lucide-react";
import { Button } from "@ba33/ui-web";

export function DocumentPreviewModal({ title }: { title: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="flex-1 text-xs"
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <FileText className="h-3.5 w-3.5 mr-1.5" />
        Aperçu
      </Button>

      {open && (
        <>
          {/* Backdrop — stops propagation to prevent any parent click handlers */}
          <div
            className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
          />

          {/* Panel */}
          <div className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-xl flex-col border-l border-border bg-popover text-popover-foreground shadow-xl animate-slide-in-right">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Aperçu document</p>
                <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{title}</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                }}
                className="ml-4 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Preview area */}
            <div className="flex flex-1 items-center justify-center overflow-auto p-6">
              <div className="flex w-full flex-col items-center justify-center rounded-xl bg-muted" style={{ minHeight: "500px", aspectRatio: "210/297" }}>
                <FileText className="h-16 w-16 text-muted-foreground/30" />
                <p className="mt-3 text-sm text-muted-foreground">Aperçu PDF simulé</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground/60">{title}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-4">
              <Button
                variant="outline"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                }}
              >
                Fermer
              </Button>
              <Button type="button" onClick={(e) => e.stopPropagation()}>
                <Download className="h-4 w-4 mr-1.5" />
                Télécharger
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
