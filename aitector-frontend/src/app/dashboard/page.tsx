"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useRequireAuth, useSupabaseUser } from "@/lib/useSupabaseAuth";
import { supabase } from "@/lib/supabaseclient";

type ApiKeyRow = {
  id: string;
  user_id?: string;
  usage_count?: number;
  created_at?: string | null;
};

export default function DashboardPage() {
  useRequireAuth("/auth");
  const { user, loading } = useSupabaseUser();
  const router = useRouter();

  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [creating, setCreating] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [statsKey, setStatsKey] = useState<ApiKeyRow | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!loading && user) fetchKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  function generateKeyHex() {
    const arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function handleCreateKey(e?: React.FormEvent) {
    e?.preventDefault();
    if (!user) return;
    setCreating(true);
    setNewKeyValue(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Create failed');
      setNewKeyValue(body.key);
      await fetchKeys();
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error("Error creating API key", err.message ?? err);
      alert(err?.message ?? "Error creating key");
    } finally {
      setCreating(false);
    }
  }

  async function fetchKeys() {
    if (!user) return;
    setRefreshing(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const res = await fetch('/api/keys', { headers: { Authorization: `Bearer ${token}` } });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Fetch failed');
      setKeys(body.data || []);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error("Error loading keys", err.message ?? err);
    } finally {
      setRefreshing(false);
    }
  }

  async function handleDeleteKey(id: string) {
    if (!confirm("Revoke this API key? This cannot be undone.")) return;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const res = await fetch(`/api/keys/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Delete failed');
      await fetchKeys();
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error("Error deleting key", err.message ?? err);
    }
  }

  async function handleCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      // eslint-disable-next-line no-console
      console.debug("Copied to clipboard");
      alert("Copied API key to clipboard");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Clipboard error", e);
      alert("Copy failed");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-amber-900">
        <p>Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-amber-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div>
            <Button variant="outline" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </div>

        <section className="bg-neutral-900 rounded-md p-6 mb-6">
          <h2 className="text-lg font-medium">Welcome</h2>
          <p className="mt-2 text-sm text-neutral-300">{user ? user.email : "—"}</p>
        </section>

        <section className="bg-neutral-900 rounded-md p-6 mb-6">
          <h2 className="text-lg font-medium">API Keys</h2>
          <p className="mt-2 text-sm text-neutral-400">Create API keys for programmatic access. Keep them secret.</p>

          {newKeyValue && (
            <div className="mt-4 p-4 border border-green-600 rounded bg-black/40">
              <p className="text-sm text-neutral-300">New API key (save this now — it will not be shown again):</p>
              <div className="mt-2 flex items-center gap-3">
                <code className="break-all bg-neutral-800 px-3 py-2 rounded">{newKeyValue}</code>
                <Button onClick={() => handleCopy(newKeyValue)}>Copy</Button>
              </div>
            </div>
          )}

          <form className="mt-4 flex gap-3" onSubmit={handleCreateKey}>
            <Button type="submit" disabled={creating}>
              {creating ? "Creating…" : "Create API Key"}
            </Button>
            <Button type="button" variant="outline" onClick={(e) => { e.preventDefault(); fetchKeys(); }} disabled={refreshing}>
              {refreshing ? "Refreshing…" : "Refresh"}
            </Button>
          </form>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full table-auto text-left">
              <thead>
                <tr className="text-sm text-neutral-400 border-b border-neutral-800">
                  <th className="py-2">Key ID</th>
                  <th className="py-2">Created</th>
                  <th className="py-2">Usage</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-sm text-neutral-500">
                      No API keys yet.
                    </td>
                  </tr>
                )}
                {keys.map((k) => (
                  <tr key={k.id} className="border-b border-neutral-800 text-sm">
                    <td className="py-3 align-top">
                      <code className="text-xs text-neutral-300">{maskKey(k.id)}</code>
                    </td>
                    <td className="py-3 align-top text-neutral-400 text-sm">{formatDate(k.created_at)}</td>
                    <td className="py-3 align-top text-neutral-400 text-sm">{k.usage_count ?? 0}</td>
                    <td className="py-3 align-top">
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => handleCopy(k.id)}>
                          Copy ID
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setStatsKey(k)}>
                          Stats
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteKey(k.id)}>
                          Revoke
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {statsKey && (
          <StatsModal keyRow={statsKey} onClose={() => setStatsKey(null)} />
        )}
      </div>
    </main>
  );
}

function maskKey(k: string) {
  if (!k) return "";
  if (k.length <= 10) return "********";
  return `${k.slice(0, 6)}...${k.slice(-6)}`;
}

function formatDate(d?: string | null) {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return d;
  }
}

function StatsModal({ keyRow, onClose }: { keyRow: ApiKeyRow; onClose: () => void }) {
  const [stats, setStats] = useState<{ usage_count: number; last_used_at?: string | null } | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        const res = await fetch(`/api/keys/${keyRow.id}/stats`, { headers: { Authorization: `Bearer ${token}` } });
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error || 'Stats fetch failed');
        if (!mounted) return;
        setStats({ usage_count: body.usage_count ?? 0, last_used_at: body.last_used_at ?? null });
      } catch (e) {
        // ignore
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [keyRow]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg rounded bg-neutral-900 p-6">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-medium">API Key Stats</h3>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="mt-4">
          <p className="mt-2 text-sm text-neutral-300">ID: {keyRow.id}</p>
          <p className="mt-2 text-sm text-neutral-300">Created: {formatDate(keyRow.created_at)}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="p-4 bg-black/40 rounded">
            <div className="text-xs text-neutral-400">Usage Count</div>
            <div className="text-xl font-semibold">{stats?.usage_count ?? "-"}</div>
          </div>
          {stats?.last_used_at && (
            <div className="p-4 bg-black/40 rounded">
              <div className="text-xs text-neutral-400">Last Used</div>
              <div className="text-sm">{formatDate(stats.last_used_at)}</div>
            </div>
          )}
        </div>

        <div className="mt-6 text-sm text-neutral-400">
          <p>This is a scaffolded stats view. Replace with real analytics as needed.</p>
        </div>
      </div>
    </div>
  );
}
