"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseclient";
import { useSupabaseUser } from "@/lib/useSupabaseAuth";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  const router = useRouter();
  const { user, loading } = useSupabaseUser();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // If user is already authenticated, create their user record and redirect
  useEffect(() => {
    if (!loading && user) {
      ensureUserExists(user.id, user.email || "").then(() => {
        router.replace("/dashboard");
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, router]);

  async function ensureUserExists(userId: string, userEmail: string) {
    try {
      await fetch('/api/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, email: userEmail }),
      });
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('Failed to create user record:', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSending(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      setMessage("Magic link sent — check your email.");
    } catch (err: any) {
      setMessage(err?.message ?? "Error sending sign-in link.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-amber-900">
      <div className="w-full max-w-md p-8">
        <h1 className="text-2xl font-semibold mb-4">Sign in</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-neutral-300">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2"
            />
          </label>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={sending} size="lg">
              {sending ? "Sending…" : "Send magic link"}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              size="lg"
            >
              Cancel
            </Button>
          </div>
        </form>

        {message && <p className="mt-4 text-sm text-neutral-300">{message}</p>}

        <div className="mt-6 text-sm text-neutral-500">
          <p>
            If you prefer, you can close this tab after clicking the magic link — you'll be
            signed in automatically.
          </p>
        </div>
      </div>
    </main>
  );
}
