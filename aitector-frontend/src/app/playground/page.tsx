"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { TextEditor } from "@/components/text-editor";
import { motion } from "framer-motion";

export default function PlaygroundPage() {
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (text: string) => {
    setError(null);
    setResults(null);

    try {

      const response = await fetch("/detect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      <Navbar />
      <main className="min-h-screen bg-black text-white">
        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center py-20 px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-5xl md:text-6xl font-bold neon-title mb-2"
          >
            Playground
          </motion.h1>
        </section>

        {/* Editor and Results Section */}
        <section className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Text Editor */}
          <div>
            <TextEditor onAnalyze={handleAnalyze} />
          </div>

          {/* Right: Results Display */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-neutral-900 border border-neutral-800 rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Detection Results
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
                <div className="space-y-6">
                  {/* Regex Patterns */}
                  <div className="border-b border-neutral-800 pb-4">
                    <h4 className="text-sm font-semibold text-purple-400 mb-2">
                      Regex Pattern Detection
                    </h4>
                    {results.patterns && results.patterns.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {results.patterns.map((pattern: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-red-900/40 text-red-300 rounded-full text-xs border border-red-600"
                          >
                            {pattern}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-green-400">✓ No patterns detected</p>
                    )}
                  </div>

                  {/* ML Classifier */}
                  <div className="border-b border-neutral-800 pb-4">
                    <h4 className="text-sm font-semibold text-purple-400 mb-2">
                      ML Classifier
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-300">Label:</span>
                        <span
                          className={`px-3 py-1 rounded text-sm font-semibold ${
                            results.classifier?.label === "JAILBREAK"
                              ? "bg-red-900/40 text-red-300 border border-red-600"
                              : "bg-green-900/40 text-green-300 border border-green-600"
                          }`}
                        >
                          {results.classifier?.label || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-300">Confidence:</span>
                        <span className="text-sm font-mono text-white">
                          {results.classifier?.score
                            ? `${(results.classifier.score * 100).toFixed(2)}%`
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* LLM Safety */}
                  <div>
                    <h4 className="text-sm font-semibold text-purple-400 mb-2">
                      LLM Safety Analysis
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-300">Risk Score:</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-neutral-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                (results.llm?.risk || 0) > 70
                                  ? "bg-red-500"
                                  : (results.llm?.risk || 0) > 40
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                              style={{ width: `${results.llm?.risk || 0}%` }}
                            />
                          </div>
                          <span className="text-sm font-mono text-white font-semibold">
                            {results.llm?.risk || 0}/100
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-neutral-300 block mb-2">
                          Categories:
                        </span>
                        {results.llm?.cats && results.llm.cats.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {results.llm.cats.map((cat: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-purple-900/40 text-purple-300 rounded-full text-xs border border-purple-600"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-green-400">✓ No threats detected</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}