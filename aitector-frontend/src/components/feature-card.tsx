import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <motion.div
      data-magnetic
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="h-full bg-neutral-900 border-neutral-800">
        <CardContent className="p-6">
          <div className="text-4xl text-purple-100 neon-title">{icon}</div>
          <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
          <p className="mt-2 text-neutral-400">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
