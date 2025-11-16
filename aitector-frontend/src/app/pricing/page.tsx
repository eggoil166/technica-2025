"use client";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ParticleBackground } from "@/components/particle-background";
import { CursorCorners } from "@/components/cursor-corners";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const PRICING_TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for testing and small projects",
    features: [
      "100 API requests per day",
      "All jailbreak detection",
      "Complete analytics",
      "API documentation access",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$10",
    period: "per month",
    description: "For growing teams and production apps",
    features: [
      "10,000 API requests per day",
      "Rewriting support",
      "Priority support",
      "Usage analytics dashboard",
      "Custom rate limits",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description: "For large-scale deployments",
    features: [
      "Unlimited API requests",
      "Dedicated infrastructure",
      "Custom ML model training",
      "24/7 premium support",
      "Advanced analytics & reporting",
      "Custom integrations",
      "SOC 2 compliance",
      "Service Level Agreement (SLA)",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function PricingPage() {
  const router = useRouter();

  return (
    <>
      <ParticleBackground />
      <CursorCorners />
      <div className="relative flex flex-col min-h-screen" style={{ zIndex: 10 }}>
        <Navbar />

        <main className="flex-1 bg-transparent text-white pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Pricing Plans
              </h1>
              <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
                Choose the plan that fits your needs. All plans include core jailbreak detection features.
              </p>
            </motion.div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {PRICING_TIERS.map((tier, index) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`relative ${
                    tier.highlighted ? "md:-mt-8 md:mb-8" : ""
                  }`}
                >
                  
                  <div
                    data-magnetic
                    className={`h-full bg-white/5 backdrop-blur-xl border rounded-xs p-8 shadow-2xl transition-all duration-300 hover:bg-white/10 ${
                      tier.highlighted
                        ? "border-purple-500/50 shadow-purple-500/20"
                        : "border-white/10 shadow-purple-500/10"
                    }`}
                  >
                    {/* Tier Name */}
                    <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>

                    {/* Price */}
                    <div className="mb-4">
                      <span className="text-5xl font-bold">{tier.price}</span>
                      <span className="text-neutral-400 ml-2">/ {tier.period}</span>
                    </div>

                    {/* Description */}
                    <p className="text-neutral-300 mb-6">{tier.description}</p>

                    {/* CTA Button */}
                    <Button
                      data-magnetic
                      className={`w-full mb-8 ${
                        tier.highlighted
                          ? "bg-purple-600 hover:bg-purple-500"
                          : "bg-white/10 hover:bg-white/20"
                      }`}
                      size="lg"
                      onClick={() => {
                        if (tier.name === "Enterprise") {
                          window.location.href = "mailto:rus.akm21@gmail.com";
                        } else {
                          router.push("/auth");
                        }
                      }}
                    >
                      {tier.cta}
                    </Button>

                    {/* Features List */}
                    <ul className="space-y-3">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-sm">
                          <svg
                            className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="text-neutral-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
