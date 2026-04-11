"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "../contexts/LanguageContext";
import BlogCarousel from "./BlogCarousel";

interface HeroBlog {
  id: string;
  title?: {
    mn?: string;
    en?: string;
  };
  content?: {
    mn?: string;
    en?: string;
  };
  date?: string;
  authorName?: string;
  cover?: string;
  category?: string;
}

interface HeroProps {
  blogs?: HeroBlog[];
  locale: string;
}

export default function Hero({ blogs, locale }: HeroProps) {
  const { t } = useLanguage();

  return (
    <section className="hero-section">
      {/* Content */}
      <div className="hero-content">
        <div className="w-full max-w-[800px] mx-auto mb-8 relative">
          <BlogCarousel blogs={blogs || []} locale={locale} />
        </div>

        {/* Statistic Chips - Unified Horizontal Bar */}
        <div className="max-w-[800px] mx-auto mt-8 px-4">
          <div className="flex items-center justify-between bg-white border border-border rounded-[24px] shadow-sm py-5 px-6 divide-x divide-border">
            <div className="flex-1 flex flex-col items-center justify-center gap-1 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-user text-gold mb-1"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <div className="text-[28px] font-black text-ink leading-none">
                30+
              </div>
              <div className="text-[11px] font-medium text-earth uppercase tracking-widest">
                {t({ mn: "Багш нар", en: "Mentors" })}
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-1 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="5"
                height="5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-star text-gold mb-1"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <div className="text-[28px] font-black text-ink leading-none">
                5.0
              </div>
              <div className="text-[11px] font-medium text-earth uppercase tracking-widest">
                {t({ mn: "Үнэлгээ", en: "Rating" })}
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-1 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="5"
                height="5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-check-circle text-gold mb-1"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <div className="text-[28px] font-black text-ink leading-none">
                1200+
              </div>
              <div className="text-[11px] font-medium text-earth uppercase tracking-widest">
                {t({ mn: "Засал", en: "Sessions" })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
