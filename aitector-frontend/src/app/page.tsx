// app/page.tsx
"use client";

import { FeatureCard } from "@/components/feature-card";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ParticleBackground } from "@/components/particle-background";
import { CursorCorners } from "@/components/cursor-corners";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <>
      <ParticleBackground />
      <CursorCorners />
      <div className="relative flex flex-col min-h-screen" style={{ zIndex: 10 }}>
        <Navbar />

        <div className="flex-1 flex items-center">
          {/* Two-column compact layout */}
          <section className="relative z-10 mx-auto max-w-7xl px-6 py-12 mt-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Left: Hero Content */}
              <motion.div
                initial={{ opacity: 0, x: -25 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <div>
                  <h1 className="neon-title text-6xl font-bold md:text-7xl text-purple-100">
                    Aegis
                  </h1>

                  <p className="neon-subtitle mt-6 max-w-xl text-xl text-purple-200/70">
                    A multilayer safety engine for LLMs.  
                    Designed for defense, built for developers.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Button
                    data-magnetic
                    size="lg"
                    className="text-lg px-8 py-6 bg-purple-800 hover:bg-purple-500 text-black font-semibold transition-colors duration-400"
                    onClick={() => window.location.href = '/playground'}
                  >
                    Try the Playground
                  </Button>

                  <Button
                    data-magnetic
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-6 border-purple-400 text-purple-300 hover:bg-purple-400/10 hover:text-white transition-colors duration-400"
                    onClick={() => window.location.href = '/docs'}
                  >
                    API Documentation
                  </Button>
                </div>

                <div className="pt-4">
                  <h3 className="text-sm font-semibold text-neutral-400 mb-4 uppercase tracking-wider">
                    Multi-layer Defense System
                  </h3>
                  <p className="text-neutral-300 text-sm max-w-lg">
                    Three independent detectors — Regex, ML classifier, and Gemini Safety LLM — working together to eliminate jailbreak attempts.
                  </p>
                </div>
              </motion.div>

              {/* Right: Features */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-6"
              >
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
              </motion.div>

            </div>
          </section>
        </div>

        <Footer />
      </div>
    </>
  );
}
