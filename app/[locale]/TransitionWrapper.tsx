"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { ReactNode } from "react";

export default function TransitionWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAndroid = Capacitor.getPlatform() === 'android';
  const offset = isAndroid ? 30 : 20;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, x: offset }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -offset }}
        transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ minHeight: '100%', willChange: 'transform' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
