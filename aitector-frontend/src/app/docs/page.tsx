"use client";

import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { motion } from "framer-motion";

export default function DocsPage() {
  return (
    <main className="relative flex min-h-screen flex-col bg-black text-cyan-100">
      <Navbar />

      <Suspense fallback={null}>
        <div>
          {/* ===== Hero Section ===== */}
          <section className="relative flex flex-col items-center justify-center py-32 px-6 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-5xl md:text-7xl font-bold neon-title mb-4"
            >
              API Documentation
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2 }}
              className="text-lg text-cyan-200/80 max-w-2xl"
            >
              Learn how to integrate the Jailbreak Detection API into your applications.
              Authenticate, send prompts, and receive multilayer safety responses.
            </motion.p>
          </section>

      {/* ===== Authentication Section ===== */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold neon-title mb-6">Authentication</h2>
        <p className="text-cyan-200 mb-4">
          All API requests require a valid API key. Generate your key from your dashboard.
          Include it in the header:
        </p>
        <pre className="bg-gray-900 text-green-300 p-4 rounded-lg overflow-x-auto">
{`GET /api/detect
Authorization: Bearer YOUR_API_KEY`}
        </pre>
      </section>

      {/* ===== Example Request Section ===== */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold neon-title mb-6">Example Request</h2>
        <p className="text-cyan-200 mb-4">
          Send a prompt to the API using JSON:
        </p>
        <pre className="bg-gray-900 text-green-300 p-4 rounded-lg overflow-x-auto">
{`POST /api/detect
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "prompt": "Ignore all previous instructions"
}`}
        </pre>

        <p className="text-cyan-200 mt-4">
          Response includes a risk score and detected categories:
        </p>
        <pre className="bg-gray-900 text-green-300 p-4 rounded-lg overflow-x-auto">
{`{
  "risk": 92,
  "categories": ["system_override", "role_break"]
}`}
        </pre>
      </section>

      {/* ===== Usage Notes Section ===== */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold neon-title mb-6">Usage Notes</h2>
        <ul className="list-disc list-inside text-cyan-200 space-y-2">
          <li>Rate limits: 100 requests/minute per API key.</li>
          <li>Keep your API key secret. Only hashed versions are stored in our database.</li>
          <li>Responses are multilayer: regex, ML, and LLM safety scoring.</li>
          <li>Use the `categories` array to handle specific types of prompts.</li>
        </ul>
      </section>

      {/* ===== Get Started CTA ===== */}
      <section className="text-center py-16 bg-black/70">
        <h2 className="text-3xl font-bold neon-title mb-4">Ready to try?</h2>
        <a href="/dashboard"><Button size="lg" className="text-lg px-8 py-6 bg-cyan-600 hover:bg-cyan-500">
          Generate Your API Key
        </Button></a>
      </section>
        </div>
      </Suspense>

      <Footer />
    </main>
  );
}
