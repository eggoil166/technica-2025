"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./supabaseclient";

type SupabaseUser = any;

export function useSupabaseUser() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error fetching supabase session", err);
        if (mounted) setLoading(false);
      }
    }

    load();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      try {
        listener?.subscription.unsubscribe();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  return { user, loading } as const;
}

export function useRequireAuth(redirectTo = "/auth") {
  const { user, loading } = useSupabaseUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  return { user, loading } as const;
}
