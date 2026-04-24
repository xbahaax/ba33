"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/session-provider";
import { LoadingState } from "@/components/loading-state";
import { getHomeRoute } from "@/lib/role-routing";

export default function RootPage() {
  const { session, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!session) {
      window.location.href = "/login";
      return;
    }

    window.location.href = getHomeRoute(session.user.userType);
  }, [session, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingState message="Redirection en cours..." />
    </div>
  );
}
