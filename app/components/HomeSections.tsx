"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LogIn, CalendarClock, MessageCircle, BookOpen } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface HomeSectionsProps {
  locale: string;
  blogs?: any[];
  monks?: any[];
  featuredMonks?: any[];
}

export default function HomeSections({ locale, blogs }: HomeSectionsProps) {
  const { t } = useLanguage();

  return (
    <div className="home-sections-wrapper bg-transparent max-w-[800px] mx-auto pb-24">
      {/* ── QUICK ACTIONS (Товч үйлдэл) ── */}
      <section className="px-5 pt-8 pb-6">
        <h2 className="text-[22px] font-black text-ink tracking-tight mb-6 font-serif">
          Товч үйлдэл
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Нэвтрэх */}
          <motion.div whileTap={{ scale: 0.97 }}>
            <Link href={`/${locale}/sign-in`} className="flex flex-col items-center justify-center p-6 bg-white rounded-[28px] border border-gold/10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] h-36 relative overflow-hidden group">
              <div className="w-14 h-14 rounded-full border border-gold/30 flex items-center justify-center mb-3 text-gold group-hover:bg-gold/5 transition-colors">
                <LogIn size={24} strokeWidth={1.5} />
              </div>
              <span className="text-[12px] font-bold text-ink tracking-widest uppercase">Нэвтрэх</span>
            </Link>
          </motion.div>

          {/* Захиалах */}
          <motion.div whileTap={{ scale: 0.97 }}>
            <Link href={`/${locale}/bookings/new`} className="flex flex-col items-center justify-center p-6 bg-white rounded-[28px] border border-gold/10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] h-36 relative overflow-hidden group">
              <div className="w-14 h-14 rounded-full border border-gold/30 flex items-center justify-center mb-3 text-gold group-hover:bg-gold/5 transition-colors">
                <CalendarClock size={24} strokeWidth={1.5} />
              </div>
              <span className="text-[12px] font-bold text-ink tracking-widest uppercase">Захиалах</span>
            </Link>
          </motion.div>

          {/* Мессеж */}
          <motion.div whileTap={{ scale: 0.97 }}>
            <Link href={`/${locale}/messenger`} className="flex flex-col items-center justify-center p-6 bg-white rounded-[28px] border border-gold/10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] h-36 relative overflow-hidden group">
              <div className="w-14 h-14 rounded-full border border-gold/30 flex items-center justify-center mb-3 text-gold group-hover:bg-gold/5 transition-colors">
                <MessageCircle size={24} strokeWidth={1.5} />
              </div>
              <span className="text-[12px] font-bold text-ink tracking-widest uppercase">Мессеж</span>
            </Link>
          </motion.div>

          {/* Блог */}
          <motion.div whileTap={{ scale: 0.97 }}>
            <Link href={`/${locale}/blog`} className="flex flex-col items-center justify-center p-6 bg-white rounded-[28px] border border-gold/10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] h-36 relative overflow-hidden group">
              <div className="w-14 h-14 rounded-full border border-gold/30 flex items-center justify-center mb-3 text-gold group-hover:bg-gold/5 transition-colors">
                <BookOpen size={24} strokeWidth={1.5} />
              </div>
              <span className="text-[12px] font-bold text-ink tracking-widest uppercase">Блог</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── LATEST NEWS (Шинэ мэдээ) ── */}
      <section className="px-5 pt-4">
        <h2 className="text-[22px] font-black text-ink tracking-tight mb-6 font-serif">
          Шинэ мэдээ
        </h2>

        <motion.div whileTap={{ scale: 0.98 }} className="w-full relative rounded-[28px] overflow-hidden shadow-xl border border-gold/10 h-[320px]">
          <Link href={`/${locale}/blog`}>
            {/* Cinematic Featured Card Image */}
            <img
              src="https://images.unsplash.com/photo-1610641151603-4c921316b677?q=80&w=800"
              alt="White Mongolian Temple"
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Gradient Overlay for Text */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
            
            {/* Badge */}
            <div className="absolute top-5 left-5 bg-white/95 px-4 py-2 rounded-full text-[11px] font-bold text-ink shadow-sm">
              2-р сарын 25
            </div>

            {/* Content */}
            <div className="absolute bottom-6 left-6 right-6">
              <h3 className="text-[22px] font-bold text-white leading-tight font-serif">
                Уламжлалт хийдэд явагдах хаврын их хурал
              </h3>
              <div className="mt-3 flex items-center gap-2 text-gold">
                <span className="text-[11px] font-bold uppercase tracking-widest">Дэлгэрэнгүй унших</span>
                <span className="text-lg">→</span>
              </div>
            </div>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
