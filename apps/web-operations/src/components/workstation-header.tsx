"use client";

import type { ReactNode } from "react";
import { Badge, Button } from "@ba33/ui-web";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/session-provider";
import { setStoredAccessToken } from "@/lib/api";
import { formatEnumLabel } from "@/lib/format";

interface WorkstationHeaderProps {
  nav?: ReactNode;
}

export function WorkstationHeader({ nav }: WorkstationHeaderProps) {
  const { session } = useSession();
  const router = useRouter();

  function handleLogout() {
    setStoredAccessToken(null);
    window.location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            b
          </div>
          <span className="text-sm font-semibold">ba33</span>
        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <span className="hidden text-sm sm:inline">
                {session.user.fullName}
              </span>
              <Badge variant="secondary">
                {formatEnumLabel(session.user.userType)}
              </Badge>
            </>
          ) : null}
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {nav ? (
        <div className="border-t border-border/40">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6">{nav}</div>
        </div>
      ) : null}
    </header>
  );
}
