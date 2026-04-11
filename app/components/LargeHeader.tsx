"use client";

import React from "react";
import { motion } from "framer-motion";

type Props = {
  title: string;
  highlight?: string;
  subtitle?: string;
  right?: React.ReactNode;
  bgImage?: string;
};

export default function LargeHeader({ title, highlight, subtitle, right, bgImage }: Props) {
  return (
    <div className="relative">
      {bgImage ? (
        <div className="absolute inset-0 overflow-hidden">
          <img src={bgImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-cream to-transparent" />
      )}
      <div className="relative px-6 pt-[calc(var(--header-height-mobile)+env(safe-area-inset-top)+16px)] pb-6">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[34px] font-serif font-black text-ink leading-tight tracking-tight"
        >
          {title} {highlight ? <span className="text-gold italic">{highlight}</span> : null}
        </motion.h1>
        {subtitle ? (
          <p className="mt-2 text-[13px] text-earth/70 font-medium">{subtitle}</p>
        ) : null}
        {right ? <div className="absolute right-6 top-6">{right}</div> : null}
      </div>
    </div>
  );
}
