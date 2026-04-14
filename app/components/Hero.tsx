"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import { User, Star, CheckCircle } from "lucide-react";

interface HeroProps {
  blogs?: any[];
  locale: string;
}

export default function Hero({ locale }: HeroProps) {
  const { t } = useLanguage();

  return (
    <section className="pt-24 pb-4 px-5 max-w-[800px] mx-auto">
      {/* ── STAT CARDS ── */}
      <div className="flex items-center justify-between bg-white border border-gold/20 rounded-[28px] shadow-[inset_0_0_20px_rgba(212,175,119,0.1),_0_4px_20px_rgba(0,0,0,0.04)] py-5 px-6 mb-8 relative overflow-hidden">
        {/* Inner glow effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent pointer-events-none rounded-[28px]" />
        
        <div className="flex-1 flex flex-col items-center justify-center gap-1.5 text-center relative z-10 border-r border-border last:border-r-0">
          <div className="text-[22px] font-bold text-ink leading-none font-serif tracking-tight">
            30+
          </div>
          <div className="text-[9px] font-bold text-earth uppercase tracking-widest whitespace-nowrap">
            Багш нар
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-1.5 text-center relative z-10 border-r border-border last:border-r-0">
          <div className="text-[22px] font-bold text-ink leading-none font-serif tracking-tight">
            5.0
          </div>
          <div className="text-[9px] font-bold text-earth uppercase tracking-widest whitespace-nowrap">
            Үнэлгээ
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-1.5 text-center relative z-10 border-r border-border last:border-r-0">
          <div className="text-[22px] font-bold text-ink leading-none font-serif tracking-tight">
            1200+
          </div>
          <div className="text-[9px] font-bold text-earth uppercase tracking-widest whitespace-nowrap">
            Засал
          </div>
        </div>
      </div>

      {/* ── HERO SECTION (Largest, Prominent) ── */}
      <motion.div whileTap={{ scale: 0.98 }} className="w-full relative rounded-[28px] overflow-hidden shadow-2xl h-[480px]">
        {/* Dramatic Dark Background with Particles */}
        <div className="absolute inset-0 bg-ink" />
        
        {/* Golden Light Rays & Sparkles (simulated with CSS gradients) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,119,0.3)_0%,transparent_70%)] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10 mix-blend-overlay" />
        
        {/* Ethereal Portrait (Placeholder using high-quality image) */}
        <img
          src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800"
          alt="Ethereal Portrait"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          style={{ objectPosition: 'center 20%' }}
        />

        {/* Gradient Overlays for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
        
        {/* Top Content: "2026" & "ONLINE" */}
        <div className="absolute top-6 left-6 right-6 flex items-start justify-between">
          <h2 className="text-4xl font-serif italic font-black text-gold opacity-90 drop-shadow-lg tracking-tighter">
            2026
          </h2>
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-[0_0_15px_rgba(212,175,119,0.3)]">
            <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Online</span>
          </div>
        </div>

        {/* Bottom Content: Overlay Text & Button */}
        <div className="absolute bottom-6 left-6 right-6 flex flex-col items-center text-center">
          <h1 className="text-3xl font-serif font-black text-gold drop-shadow-md mb-1">
            Буянцог Гэва
          </h1>
          <p className="text-[14px] text-white/90 font-medium tracking-[0.2em] uppercase mb-6">
            Засалч
          </p>
          
          <Link href={`/${locale}/monks`} className="w-full">
            <button className="w-full max-w-[280px] mx-auto py-4 rounded-full bg-gradient-to-r from-gold/90 to-gold text-ink font-bold text-[14px] uppercase tracking-widest shadow-gold transition-transform hover:scale-105 backdrop-blur-sm border border-gold/50">
              Дэлгэрэнгүй
            </button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
