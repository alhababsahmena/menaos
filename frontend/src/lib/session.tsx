import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi } from "@/services/api";
import type { Session } from "@/types";

const STORAGE_KEY = "menaos.session.userId";

interface SessionContextValue {
  session: Session | null;
  isLoading: boolean;
  signIn: (userId: string) => Promise<Session>;
  signOut: () => void;
  refresh: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!stored) {
      setIsLoading(false);
      return;
    }
    authApi
      .getSession(stored)
      .then((s) => setSession(s))
      .catch(() => localStorage.removeItem(STORAGE_KEY))
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = async (userId: string) => {
    const s = await authApi.signInAs(userId);
    localStorage.setItem(STORAGE_KEY, userId);
    setSession(s);
    return s;
  };

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  };

  const refresh = async () => {
    if (!session) return;
    const s = await authApi.getSession(session.user.id);
    setSession(s);
  };

  return (
    <SessionContext.Provider value={{ session, isLoading, signIn, signOut, refresh }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}

export function useRequiredSession(): Session {
  const { session } = useSession();
  if (!session) throw new Error("Session required");
  return session;
}
