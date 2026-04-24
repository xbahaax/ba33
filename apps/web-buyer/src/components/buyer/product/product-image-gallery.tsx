"use client";

import { useState } from "react";
import { Package } from "lucide-react";

export function ProductImageGallery({ images, name }: { images: string[]; name: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Package className="h-12 w-12" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="aspect-[4/3] overflow-hidden rounded-xl bg-muted">
        <img src={images[selectedIndex]} alt={name} className="h-full w-full object-cover" />
      </div>
      <div className="flex gap-3 overflow-x-auto">
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            className={index === selectedIndex ? "overflow-hidden rounded-lg border-2 border-primary" : "overflow-hidden rounded-lg border-2 border-transparent"}
            onClick={() => setSelectedIndex(index)}
          >
            <img src={image} alt={`${name} ${index + 1}`} className="h-20 w-20 object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
