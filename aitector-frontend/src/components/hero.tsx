"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative min-h-[750px] flex flex-col items-center justify-center overflow-hidden bg-transparent py-32">


      {/* Foreground */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="z-10 px-6 text-center"
      >
        <h1 className="neon-title text-5xl font-bold md:text-7xl text-purple-100">
          Aegis
        </h1>

        <p className="neon-subtitle mx-auto mt-6 max-w-2xl text-lg text-purple-200/70">
          A multilayer safety engine for LLMs.  
          Designed for defense, built for developers.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button
            size="lg"
            className="text-lg px-8 py-6 bg-purple-700 hover:bg-purple-600 text-black font-semibold shadow-[0_0_15px_rgba(180,0,255,0.5)]"
            onClick={() => window.location.href = '/playground'}
          >
            Try the Playground
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="text-lg px-8 py-6 border-purple-400 text-purple-300 hover:bg-purple-400/10 shadow-[0_0_10px_rgba(180,0,255,0.3)]"
            onClick={() => window.location.href = '/docs'}
          >
            API Documentation
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
