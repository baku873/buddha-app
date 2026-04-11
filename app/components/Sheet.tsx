"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";

type SheetProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  maxWidthClassName?: string;
};

export default function Sheet({ isOpen, onClose, title, children, maxWidthClassName = "md:max-w-lg" }: SheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <div className="absolute inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center">
            <motion.div
              initial={{ y: 32, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full md:w-auto bg-white dark:bg-[#0C164F] md:rounded-3xl md:shadow-2xl overflow-hidden ${maxWidthClassName} rounded-t-[28px]`}
              style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
            >
              <div className="md:hidden pt-3">
                <div className="mx-auto h-1 w-10 rounded-full bg-stone-300 mb-3" />
                {title ? (
                  <>
                    <div className="px-6 flex items-center justify-between pb-3">
                      <div className="text-lg font-bold font-serif">{title}</div>
                      <button onClick={onClose} className="p-2 -mr-2 rounded-full active:opacity-70">✕</button>
                    </div>
                    <div className="h-px bg-stone-100" />
                  </>
                ) : null}
              </div>
              <div className="hidden md:block">
                {title ? (
                  <div className="p-6 border-b border-stone-100 dark:border-white/10 bg-stone-50 dark:bg-white/5">
                    <div className="text-xl font-bold font-serif">{title}</div>
                  </div>
                ) : null}
              </div>
              {children}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
