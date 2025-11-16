"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useRequireAuth, useSupabaseUser } from "@/lib/useSupabaseAuth";
import { supabase } from "@/lib/supabaseclient";
import { ParticleBackground } from "@/components/particle-background";
import { CursorCorners } from "@/components/cursor-corners";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { motion, AnimatePresence } from "framer-motion";

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
  const [showRevokeModal, setShowRevokeModal] = useState<{ id: string } | null>(null);
  const [statsKey, setStatsKey] = useState<ApiKeyRow | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [showCopiedToast, setShowCopiedToast] = useState(false);

  useEffect(() => {
    if (!loading && user) fetchKeys();
  }, [user, loading]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  /** Generate 32-byte random key (64 hex chars) */
  function generateKeyHex() {
    const arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  /** SHA-256 hash -> hex string */
  async function hashKeySHA256(raw: string): Promise<string> {
    const enc = new TextEncoder().encode(raw);
    const hash = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  /** Create key → hash → send hash to backend → display raw key once */
  /** Create key → hash → send hash to backend → display raw key once */
async function handleCreateKey(e?: React.FormEvent) {
  e?.preventDefault();
  if (!user) return;
  setCreating(true);
  setNewKeyValue(null);

  try {
    // 1. Generate the raw API key
    const rawKey = generateKeyHex();
    const plain = `sk_${rawKey}_${Date.now().toString(36)}`;

    // 2. Hash it with SHA-256
    const hashedKey = await hashKeySHA256(plain);

    // 3. Send ONLY the hashed key to backend
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    const res = await fetch('/api/keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        hashed_key: hashedKey  // Send only the hash!
      }),
    });

    const body = await res.json();
    if (!res.ok) throw new Error(body?.error || 'Create failed');

    // 4. Show raw key ONCE to user (backend never sees this!)
    setNewKeyValue(plain);

    await fetchKeys();
  } catch (err: any) {
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
      const res = await fetch('/api/keys', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Fetch failed');
      setKeys(body.data || []);
    } catch (err: any) {
      console.error("Error loading keys", err.message ?? err);
    } finally {
      setRefreshing(false);
    }
  }

  async function handleDeleteKey(id: string) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const res = await fetch(`/api/keys/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Delete failed');
      setNewKeyValue(null);
      await fetchKeys();
    } catch (err: any) {
      console.error("Error deleting key", err.message ?? err);
    }
    setShowRevokeModal(null);
  }

  async function handleCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 1500);
    } catch (e) {
      console.error("Clipboard error", e);
    }
  }

  if (loading) {
    return (
      <>
        <ParticleBackground />
        <CursorCorners />
        <div className="relative flex flex-col min-h-screen" style={{ zIndex: 10 }}>
          <Navbar />
          <main className="flex-1 flex items-center justify-center bg-transparent text-white">
            <p>Loading…</p>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <ParticleBackground />
      <CursorCorners />
      <div className="relative flex flex-col min-h-screen" style={{ zIndex: 10 }}>
        <Navbar />
        <main className="flex-1 bg-transparent text-white p-8">
      <style>
        {`
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -10px); }
            15% { opacity: 1; transform: translate(-50%, 0); }
            85% { opacity: 1; transform: translate(-50%, 0); }
            100% { opacity: 0; transform: translate(-50%, -10px); }
          }
          .toast-fade {
            animation: fadeInOut 1.5s ease-in-out forwards;
          }
        `}
      </style>

      {showCopiedToast && (
        <div className="toast-fade fixed top-4 left-1/2 -translate-x-1/2 z-50 
                        bg-neutral-800 text-white text-sm px-4 py-2 rounded shadow-lg">
          Copied!
        </div>
      )}

      <div className="max-w-6xl mx-auto pt-20">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xs p-6 shadow-2xl shadow-purple-500/10">
          {/* Dashboard Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <Button data-magnetic className="hover:bg-neutral-600 transition-colors duration-300" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>

          {/* Welcome Section */}
          <div className="mb-8 pb-8 border-b border-white/10">
            <h2 className="text-lg font-medium">Welcome</h2>
            <p className="mt-2 text-sm text-neutral-300">{user ? user.email : "—"}</p>
          </div>

          {/* API Keys Section */}
          <div>
            <h2 className="text-lg font-medium">API Keys</h2>
            <p className="mt-2 text-sm text-neutral-400">Create API keys for programmatic access. Keep them secret.</p>

          {newKeyValue && (
            <div className="mt-4 p-4 border border-purple-800 rounded bg-black/40 backdrop-blur-sm relative transition-all">
              <button
                data-magnetic
                className="absolute top-2 right-2 text-neutral-400 hover:text-white text-lg"
                aria-label="Close"
                onClick={() => setNewKeyValue(null)}
              >
                ×
              </button>
              <p className="text-sm text-neutral-300">New API key (save this now — it will not be shown again):</p>
              <div className="mt-2 flex items-center gap-3">
                <code className="break-all bg-neutral-800 backdrop-blur-sm px-3 py-2 rounded">{newKeyValue}</code>
                <Button data-magnetic className="hover:bg-neutral-600 transition-colors duration-300" onClick={() => handleCopy(newKeyValue)}>Copy</Button>
              </div>
            </div>
          )}

          <form className="mt-4 flex gap-3 text-black" onSubmit={handleCreateKey}>
            <Button data-magnetic type="submit" className="hover:bg-neutral-600 transition-colors duration-300" disabled={creating}>
              {creating ? "Creating…" : "Create API Key"}
            </Button>
            <Button
              data-magnetic
              type="button"
              className="hover:bg-neutral-600 transition-colors duration-300"
              onClick={(e) => {
                e.preventDefault();
                fetchKeys();
              }}
              disabled={refreshing}
            >
              {refreshing ? "Refreshing…" : "Refresh"}
            </Button>
          </form>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full table-fixed text-left">
              <thead>
                <tr className="text-sm text-neutral-400 border-b border-neutral-800">
                  <th className="py-2 w-[30%]">Key ID</th>
                  <th className="py-2 w-[20%]">Created</th>
                  <th className="py-2 w-[15%]">Usage</th>
                  <th className="py-2 w-[35%]">Actions</th>
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
                      <div className="flex items-center gap-2 text-black">
                        <Button data-magnetic className="hover:bg-neutral-600 transition-colors duration-300" size="sm" onClick={() => handleCopy(k.id)}>
                          Copy ID
                        </Button>
                        <Button data-magnetic className="hover:bg-neutral-600 transition-colors duration-300" size="sm" onClick={() => setStatsKey(k)}>
                          Stats
                        </Button>
                        <Button
                          data-magnetic
                          className="hover:bg-red-600 transition-colors duration-300"
                          size="sm"
                          onClick={() => setShowRevokeModal({ id: k.id })}
                        >
                          Revoke
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {statsKey && <StatsModal keyRow={statsKey} onClose={() => setStatsKey(null)} />}
      </AnimatePresence>

        <AnimatePresence>
          {showRevokeModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 0 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-full max-w-sm rounded-xs bg-white/10 backdrop-blur-xl border border-white/10 p-6 shadow-2xl"
              >
                <h3 data-magnetic className="text-lg font-medium mb-4">Revoke API Key?</h3>
                <p className="text-sm text-neutral-300 mb-6">
                  This cannot be undone. Are you sure you want to revoke this API key?
                </p>
                <div className="flex gap-3 justify-end">
                  <Button data-magnetic className="hover:bg-neutral-600 transition-colors duration-300" onClick={() => setShowRevokeModal(null)}>
                    Cancel
                  </Button>
                  <Button
                    data-magnetic
                    variant="destructive"
                    onClick={() => handleDeleteKey(showRevokeModal.id)}
                  >
                    Revoke
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
    <Footer />
    </div>
    </>
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
        const res = await fetch(`/api/keys/${keyRow.id}/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error || "Stats fetch failed");
        if (!mounted) return;
        setStats({
          usage_count: body.usage_count ?? 0,
          last_used_at: body.last_used_at ?? null,
        });
      } catch (e) {
        console.error(e);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [keyRow]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 0 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-lg rounded-xs bg-white/10 backdrop-blur-xl border border-white/10 p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <h3 data-magnetic className="text-lg font-medium">API Key Stats</h3>
          <Button data-magnetic className="hover:bg-neutral-600 transition-colors duration-300" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="mt-4">
          <p className="mt-2 text-sm text-neutral-300">ID: {keyRow.id}</p>
          <p className="mt-2 text-sm text-neutral-300">
            {`Created: ${formatDate(keyRow.created_at)}`}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="p-4 bg-black/40 backdrop-blur-sm rounded">
            <div className="text-xs text-neutral-400">Usage Count</div>
            <div className="text-xl font-semibold">{stats?.usage_count ?? "-"}</div>
          </div>
          {stats?.last_used_at && (
            <div className="p-4 bg-black/40 backdrop-blur-sm rounded">
              <div className="text-xs text-neutral-400">Last Used</div>
              <div className="text-sm">{formatDate(stats.last_used_at)}</div>
            </div>
          )}
        </div>

        <div className="mt-6 text-sm text-neutral-400">
          <p>This is a scaffolded stats view. Replace with real analytics as needed.</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
