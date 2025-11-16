"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSupabaseUser } from "@/lib/useSupabaseAuth";
import Image from "next/image";

export function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/10 bg-black/40 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="/" data-magnetic className="flex items-center gap-3 text-xl font-semibold text-white">
          <Image src="/full.png" alt="Aegis Logo" width={32} height={32} className="object-contain" />
          Aegis
        </a>

        <div className="flex items-center gap-4">
          <a data-magnetic href="/docs" className="text-neutral-300 hover:text-white">
            Docs
          </a>
          <a data-magnetic href="/playground" className="text-neutral-300 hover:text-white">
            Playground
          </a>
          <a data-magnetic href="/pricing" className="text-neutral-300 hover:text-white">
            Pricing
          </a>

          {/* Dashboard redirects to /dashboard when logged in, otherwise to /auth */}
          <DashboardButton />
        </div>
      </div>
    </motion.nav>
  );
}

function DashboardButton() {
  const router = useRouter();
  const { user, loading } = useSupabaseUser();

  return (
    <Button
      data-magnetic
      className="ml-4 hover:bg-neutral-700"
      onClick={() => {
        if (loading) return;
        if (user) router.push("/dashboard");
        else router.push("/auth");
      }}
    >
      Dashboard
    </Button>
  );
}
