"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { TextEditor } from "@/components/text-editor";
import { CursorCorners } from "@/components/cursor-corners";
import { motion } from "framer-motion";

export default function PlaygroundPage() {
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (text: string) => {
    setError(null);
    setResults(null);

    try {
      const apiKey = "sk_8b9f680406e03fff4a74f66677d56c81ab8faca7b293235d49ed17fa589f20b9_mi17vk27";

      const response = await fetch("/detect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "API-Key": apiKey,
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
      <CursorCorners />
      <Navbar />
      <main className="min-h-screen bg-black text-white">
        {/* Hero Section */}
        <section className="relative flex pt-20 px-6 text-left pl-60">
          <motion.h1
            data-magnetic
            initial={{ opacity: 0, x: -50}}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="text-5xl md:text-6xl font-bold neon-title mt-2"
          >
            Playground
          </motion.h1>
        </section>

        {/* Editor and Results Section */}
        <section className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
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
              className="bg-neutral-900 border border-neutral-800 rounded-lg p-6"
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
                <div className="bg-red-900/20 border border-red-600 rounded-lg p-4 text-red-300">
                  <p className="font-semibold">Error</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              )}

              {results && (
                <pre className="bg-black border border-neutral-700 rounded-lg p-4 text-sm text-green-400 overflow-x-auto font-mono">
                  {JSON.stringify(results, null, 2)}
                </pre>
              )}
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}