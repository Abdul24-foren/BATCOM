import type { ReactNode } from "react";
import { useAuth } from "./AuthProvider";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-yellow-400">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 animate-pulse rounded-full border border-yellow-400/30 bg-yellow-400/10" />
          <p className="mt-6 font-mono text-[10px] tracking-[0.35em] text-yellow-400">
            INITIALIZING BATCOM
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
