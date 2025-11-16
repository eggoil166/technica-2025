"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { TextEditor } from "@/components/text-editor";
import { CursorCorners } from "@/components/cursor-corners";
import { motion } from "framer-motion";
import { ParticleBackground } from "@/components/particle-background";


export default function PlaygroundPage() {
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (text: string) => {
    setError(null);
    setResults(null);

    try {
      const apiKey = process.env.API_KEY;

      const response = await fetch("http://localhost:5000/detect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + apiKey,
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze prompt");
      }

      const data = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || "An error occurred while analyzing");
    }
  };

  return (
    <>
    <ParticleBackground />
      <CursorCorners />
      <div className="relative flex flex-col min-h-screen" style={{ zIndex: 10 }}>
        <Navbar />
        <main className="flex-1 bg-transparent text-white">
        {/* Hero Section */}
        <section className="relative flex pt-20 px-6 text-left pl-60">
          <motion.h1
            data-magnetic
            initial={{ opacity: 0, x: -50}}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="text-5xl md:text-6xl font-bold neon-title mt-2"
          >
            
          </motion.h1>
        </section>

        {/* Editor and Results Section */}
        <section className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-2 gap-8 ">
          {/* Left: Text Editor with Magnetic Effect */}
          <motion.div
            
            data-magnetic
            initial={{ opacity: 0, y: 20}}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <TextEditor onAnalyze={handleAnalyze} />
          </motion.div>

          {/* Right: Results Display with Magnetic Effect */}
          <div>
            <motion.div
              data-magnetic
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/5 backdrop-blur-xl  rounded-xs p-6 shadow-2xl shadow-purple-500/10"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                API Response
              </h3>

              {!results && !error && (
                <div className="text-neutral-400 text-center py-12">
                  <p>Enter a prompt and click "Analyze" to see results.</p>
                </div>
              )}

              {error && (
                <div className="bg-red-900/20 border border-red-600 rounded-xs p-4 text-red-300">
                  <p className="font-semibold">Error</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              )}

              {results && (
                <pre className="bg-black/50 backdrop-blur-sm  rounded-xs p-4 text-sm text-green-400 overflow-x-auto font-mono">
                  {JSON.stringify(results, null, 2)}
                </pre>
              )}
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
      </div>
    </>
  );
}