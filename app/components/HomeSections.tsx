"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "../contexts/LanguageContext";
import { formatDate } from "../lib/dateUtils";
import { motion } from "framer-motion";
import { Star, ArrowRight, UserCircle, Flame, ScrollText, Flower2, Sparkles } from "lucide-react";

// ─── MOCK DATA ─────────────────────────────────────────────────────────────

const MOCK_BLOGS = [
  {
    id: "b1",
    title: { mn: "Ухаарлын эрчим: Дотоод амар тайвны нууц", en: "Power of Awareness: The Secret of Inner Peace" },
    cover: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
    date: "2026-03-28",
    author: { mn: "Лам Тэнзин", en: "Lama Tenzin" },
  },
  {
    id: "b2",
    title: { mn: "Бясалгалаар стрессийг даван туулах арга", en: "Overcoming Stress Through Meditation" },
    cover: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&q=80",
    date: "2026-03-22",
    author: { mn: "Болд гэлэн", en: "Gelen Bold" },
  },
  {
    id: "b3",
    title: { mn: "Тарог судлал: Амьдралын зам", en: "Tarot Studies: The Path of Life" },
    cover: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=400&q=80",
    date: "2026-03-15",
    author: { mn: "Сарнай эгч", en: "Sis Sarnai" },
  },
];

// ─── COMPONENT ─────────────────────────────────────────────────────────────

interface HomeSectionsProps {
  locale: string;
  blogs?: any[];
  monks?: any[];
  featuredMonks?: any[];
}

export default function HomeSections({ locale, blogs, monks = [], featuredMonks = [] }: HomeSectionsProps) {
  const { t, language: lang } = useLanguage();
  const validLang = (["mn", "en"].includes(lang) ? lang : "mn") as "mn" | "en";

  const displayBlogs = blogs && blogs.length > 0 ? blogs.slice(0, 5) : MOCK_BLOGS;
  
  // Reorder monks as requested: Буянцог, Ундраа, Амина, Доржбаатар, Банчинэрдэнэ, Цэцэг
  const preferredNames = ["Буянцог", "Ундраа", "Амина", "Доржбаатар", "Эрдэнэ", "Цэцэг"];
  
  const getMonkRank = (m: any) => {
    const nameMn = m.name?.mn || "";
    const nameEn = m.name?.en || "";
    const index = preferredNames.findIndex(p => 
      nameMn.toLowerCase().includes(p.toLowerCase()) || 
      nameEn.toLowerCase().includes(p.toLowerCase())
    );
    return index === -1 ? 999 : index;
  };

  const displayMonks = [...monks]
    .sort((a, b) => getMonkRank(a) - getMonkRank(b))
    .slice(0, 6);

  return (
    <div className="home-sections-wrapper !bg-white">
      {/* ── SECTION 1: FEATURED MONKS CAROUSEL ──────────────────────────────────── */}
      {featuredMonks && featuredMonks.length > 0 && (
        <section className="pt-8 pb-4">
          <div className="px-5 mb-4 flex items-baseline justify-between">
            <div>
              <h2 className="text-[24px] font-black text-ink tracking-tight">
                {t({ mn: "Онцлох багш", en: "Featured Monks" })}
              </h2>
              <p className="text-[14px] text-earth font-medium">Энэ долоо хоногийн онцлох багш нар</p>
            </div>
            <Link href={`/${locale}/monks`} className="text-[13px] font-bold text-gold uppercase tracking-wider">
              {t({ mn: "Бүгд", en: "All" })}
            </Link>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar pl-5 pr-10 gap-4 pb-4">
            {featuredMonks.map((p) => {
              const monkId = p._id || p.id;
              const monkName = p.name?.[validLang] || p.name?.mn || "";
              const specialty = (p.specialties && p.specialties[0]) ? p.specialties[0] : (validLang === 'en' ? "Spiritual Guide" : "Засалч");
              const isOnline = p.isAvailable;

              return (
                <motion.div key={monkId} whileTap={{ scale: 0.97 }} className="snap-center w-[85vw] max-w-[340px] flex-shrink-0 relative rounded-[24px] overflow-hidden shadow-lg border border-border/50">
                  <Link href={`/${locale}/monks/${monkId}`} className="block w-full h-[400px] relative">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={monkName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-stone flex items-center justify-center">
                        <UserCircle size={64} className="text-earth/30" />
                      </div>
                    )}
                    
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {isOnline && (
                      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                        <span className="w-2 h-2 bg-gold rounded-full" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Online</span>
                      </div>
                    )}

                    {/* Floating Profile Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end">
                      <h3 className="text-[24px] font-black text-white mb-1 truncate drop-shadow-md">{monkName}</h3>
                      <p className="text-[15px] text-white/80 font-medium mb-4 truncate">{specialty}</p>
                      <button className="w-full py-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold text-[13px] uppercase tracking-widest transition-colors hover:bg-white/30">
                        {t({ mn: "Дэлгэрэнгүй", en: "View Details" })}
                      </button>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── SECTION 1.5: QUICK ACTIONS ──────────────────────────────────── */}
      <section className="app-section !pt-4">
        <div className="app-section-header">
          <div>
            <h2 className="text-[22px] font-black text-ink tracking-tight">
              {t({ mn: "Товч үйлдэл", en: "Quick Actions" })}
            </h2>
            <p className="text-[13px] text-earth">{t({ mn: "Хурдан бөгөөд хялбар үйлчилгээ", en: "Fast and easy services" })}</p>
          </div>
        </div>
        <div className="px-5 grid grid-cols-2 gap-4 md:grid-cols-4">
          <motion.div whileTap={{ scale: 0.97 }}>
            <Link href={`/${locale}/sign-in`} className="app-card-premium flex flex-col items-center justify-center p-6 h-36">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-stone to-white border border-gold/20 flex items-center justify-center mb-3 shadow-sm">
                <Flower2 size={26} className="text-gold" strokeWidth={1.5} />
              </div>
              <span className="text-[14px] font-bold text-ink text-center tracking-wide uppercase">{t({ mn: "Нэвтрэх", en: "Sign In" })}</span>
            </Link>
          </motion.div>
          <motion.div whileTap={{ scale: 0.97 }}>
            <Link href={`/${locale}/bookings/new`} className="app-card-premium flex flex-col items-center justify-center p-6 h-36">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-stone to-white border border-gold/20 flex items-center justify-center mb-3 shadow-sm">
                <ScrollText size={26} className="text-gold" strokeWidth={1.5} />
              </div>
              <span className="text-[14px] font-bold text-ink text-center tracking-wide uppercase">{t({ mn: "Захиалах", en: "Book Now" })}</span>
            </Link>
          </motion.div>
          <motion.div whileTap={{ scale: 0.97 }}>
            <Link href={`/${locale}/chat`} className="app-card-premium flex flex-col items-center justify-center p-6 h-36">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-stone to-white border border-gold/20 flex items-center justify-center mb-3 shadow-sm">
                <Sparkles size={26} className="text-gold" strokeWidth={1.5} />
              </div>
              <span className="text-[14px] font-bold text-ink text-center tracking-wide uppercase">{t({ mn: "Мессеж", en: "Message" })}</span>
            </Link>
          </motion.div>
          <motion.div whileTap={{ scale: 0.97 }}>
            <Link href={`/${locale}/blog`} className="app-card-premium flex flex-col items-center justify-center p-6 h-36">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-stone to-white border border-gold/20 flex items-center justify-center mb-3 shadow-sm">
                <Flame size={26} className="text-gold" strokeWidth={1.5} />
              </div>
              <span className="text-[14px] font-bold text-ink text-center tracking-wide uppercase">{t({ mn: "Блог", en: "Blog" })}</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 2: LATEST NEWS CAROUSEL ──────────────────────────────────── */}
      <section className="app-section">
        <div className="app-section-header">
          <div>
            <h2 className="text-[22px] font-black text-ink tracking-tight">
                {t({ mn: "Шинэ мэдээ", en: "Latest News" })}
            </h2>
            <p className="text-[13px] text-earth">{t({ mn: "Өнөөдрийн онцлох мэдээлэл", en: "Today's highlights" })}</p>
          </div>
          <Link href={`/${locale}/blog`} className="text-[12px] font-bold text-gold uppercase tracking-wider">
            {t({ mn: "Бүгд", en: "All" })}
          </Link>
        </div>

        <div className="app-carousel hide-scrollbar md:grid md:grid-cols-3">
          {displayBlogs.map((blog) => (
            <motion.div key={blog.id} whileTap={{ scale: 0.97 }} className="app-card-premium w-[280px] md:w-auto flex-shrink-0">
                <Link href={`/${locale}/blog/${blog.id}`} className="block">
                    <div className="relative h-48 overflow-hidden">
                        <img
                        src={blog.cover || "/default-avatar.png"}
                        alt={blog.title?.[validLang] || blog.title?.mn || "Blog"}
                        className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 left-4 bg-white/95 px-3 py-1 rounded-full text-[11px] font-bold text-ink border border-border shadow-sm">
                           {formatDate(blog.date, validLang)}
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="text-[12px] font-bold text-gold uppercase tracking-wider mb-2">
                           {blog.author ? (typeof blog.author === 'string' ? blog.author : blog.author[validLang] || "Багш") : blog.authorName || "Багш"}
                        </p>
                        <h3 className="text-[18px] font-bold text-ink leading-tight line-clamp-2">
                            {blog.title?.[validLang] || blog.title?.mn || "Мэдээ"}
                        </h3>
                    </div>
                </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── SECTION 3: TOP PRACTITIONERS ─────────────────────────────── */}
      <section className="app-section !pt-4">
        <div className="app-section-header">
           <div>
             <h2 className="text-[22px] font-black text-ink tracking-tight">
               {t({ mn: "Шилдэг үзмэрчид", en: "Top Practitioners" })}
             </h2>
             <p className="text-[13px] text-earth">{t({ mn: "Мэргэжлийн түвшний зөвлөгөө", en: "Professional guidance" })}</p>
           </div>
        </div>

        <div className="px-5 space-y-4 md:grid md:grid-cols-2 md:space-y-0 md:gap-6">
          {displayMonks.map((p) => {
            const monkId = p._id || p.id;
            const monkName = p.name?.[validLang] || p.name?.mn || "";
            const isOnline = p.isAvailable;
            const monkExp = p.yearsOfExperience ? `${p.yearsOfExperience} жил` : "10 жил";
            const specialty = (p.specialties && p.specialties[0]) ? p.specialties[0] : (validLang === 'en' ? "Spiritual Guide" : "Засалч");
            const price = (p.services && p.services[0]?.price) ? p.services[0].price.toLocaleString() : "50,000";
            const rating = p.rating || "4.8";
            const reviews = p.reviews || 65;

            return (
              <motion.div key={monkId} whileTap={{ scale: 0.97 }}>
                <Link href={`/${locale}/monks/${monkId}`} className="app-card-premium p-5 flex gap-5 items-center">
                    {/* Avatar */}
                    <div className="relative w-24 h-24 flex-shrink-0">
                        <img
                        src={p.image || "/default-monk.jpg"}
                        alt={monkName}
                        className="relative w-full h-full rounded-[20px] object-cover border border-border shadow-sm"
                        />
                        {isOnline && (
                             <div className="absolute -top-1 -right-1 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 z-20">
                                 <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                                 <span className="text-[8px] font-bold text-white uppercase tracking-wider">Online</span>
                             </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 overflow-hidden">
                        <h3 className="text-[18px] font-black text-ink mb-1 truncate">{monkName}</h3>
                        <p className="text-[14px] text-earth font-medium mb-3 truncate">{specialty} · {monkExp}</p>
                        <div className="flex items-center gap-1.5">
                            <Star size={14} className="text-gold fill-gold" />
                            <span className="text-[14px] font-bold text-ink">{rating}</span>
                            <span className="text-[13px] text-earth">({reviews} сэтгэгдэл)</span>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col items-end gap-2">
                        <p className="text-[16px] font-black text-ink whitespace-nowrap">₮{price}</p>
                        <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center text-white shadow-gold">
                            <ArrowRight size={18} />
                        </div>
                    </div>
                </Link>
              </motion.div>
            )})}
        </div>
      </section>
    </div>
  );
}
