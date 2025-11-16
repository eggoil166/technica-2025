import { motion } from "framer-motion";

export function Footer() {
  return (
    <footer className="mt-auto  py-8 text-center text-neutral-400  w-full">
      <motion.p className="text-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      >

        
        
        © {new Date().getFullYear()} daniel and ruslan.
      </motion.p>
    </footer>
  );
}
