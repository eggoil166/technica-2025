// app/page.tsx
"use client";

import { Hero } from "@/components/hero";
import { FeatureCard } from "@/components/feature-card";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { motion } from "framer-motion";
import { useSupabaseUser } from "@/lib/useSupabaseAuth";
import { useRouter } from "next/navigation";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col text-amber-900">
      <Navbar />

      {/* ===== Hero Section ===== */}
      <Hero />

      {/* ===== Features ===== */}
      <section className="bg-black">
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-24">
        <SectionHeader
          title="A multi-layer defense system"
          subtitle="Three independent detectors — Regex, ML classifier, and Gemini Safety LLM — working together to eliminate jailbreak attempts."
        />

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          <FeatureCard
            title="Regex Pattern Engine"
            description="Detect structural jailbreak attempts, encoding tricks, unicode hacks, and role-override patterns."
            icon="(.*)"
          />
          <FeatureCard
            title="ML Classifier"
            description="A HuggingFace transformer trained on jailbreak corpora for semantic detection beyond regex."
            icon="hf"
          />
          <FeatureCard
            title="LLM Safety Model"
            description="Gemini 2.5 Flash for deep semantic safety scoring, risk levels, and context-aware jailbreaking detection."
            icon="AI"
          />
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative mx-auto max-w-5xl px-6 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl"
        >
          <h2 className="text-4xl font-bold">
            The next generation of jailbreak detection.
          </h2>
          <p className="mt-4 text-lg text-neutral-300">
            Start analyzing prompts with unmatched precision and multilayered safety.  
          </p>

          <ActionButtons />
        </motion.div>
      </section>

      <Footer />
      </section>
    </main>
  );
}

function ActionButtons() {
  const { user, loading } = useSupabaseUser();
  const router = useRouter();

  return (
    <div className="mt-8 flex flex-wrap justify-center gap-4">
      <Button
        size="lg"
        className="text-lg px-8 py-6"
        onClick={() => {
          if (loading) return;
          if (user) router.push("/dashboard");
          else router.push("/auth");
        }}
      >
        Get Started (Free)
      </Button>
      <Button variant="outline" size="lg" className="text-lg px-8 py-6" onClick={() => window.location.href = '/docs'}>
        View Documentation
      </Button>
    </div>
  );
}
