"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { formatDate } from "../lib/dateUtils";

interface Blog {
  id: string;
  title?: {
    mn?: string;
    en?: string;
  };
  content?: {
    mn?: string;
    en?: string;
  };
  cover?: string;
  date?: string;
  authorName?: string;
  category?: string;
}

interface BlogCarouselProps {
  blogs: Blog[];
  locale: string;
}

export default function BlogCarousel({ blogs, locale }: BlogCarouselProps) {
  const { language } = useLanguage();
  const validLang = (["mn", "en"].includes(language) ? language : "mn") as
    | "mn"
    | "en";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-scroll effect
  useEffect(() => {
    if (isHovered || !blogs || blogs.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % blogs.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [blogs, isHovered]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + blogs.length) % blogs.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % blogs.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const getExcerpt = (content?: string) => {
    if (!content) return "";

    // Split by sentences (common sentence endings)
    const sentences = content
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);

    // Take first 2 sentences and clean them up
    const firstTwo = sentences
      .slice(0, 2)
      .map((s) => s.trim())
      .join(". ");

    return firstTwo + (sentences.length > 2 ? "..." : "");
  };

  if (!blogs || blogs.length === 0) {
    return (
      <div className="flex items-center justify-center h-[360px] bg-gradient-to-br from-stone via-white to-stone rounded-3xl border border-border">
        <div className="text-center">
          <div className="w-8 h-16 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-gold" />
          </div>
          <p className="text-[16px] font-medium text-earth">
            {validLang === "mn"
              ? "Блог бичлэг байхгүй байна"
              : "No blog posts available"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-[400px] lg:h-[360px] rounded-2xl overflow-hidden shadow-xl border border-border"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentIndex}
          className="absolute inset-0"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
            duration: 0.6,
          }}
        >
          {blogs[currentIndex].cover ? (
            <img
              src={blogs[currentIndex].cover}
              alt={blogs[currentIndex].title?.[validLang] || "Blog cover"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-stone via-white to-stone flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-gold" />
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Content overlay */}
      <div className="absolute inset-0 flex items-end justify-center pb-12 px-12 sm:px-20 z-0">
        <motion.div
          className="w-[fit-content] min-w-[240px] max-w-[280px] sm:max-w-[320px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="bg-white/95 backdrop-blur-lg rounded-[20px] p-4 shadow-2xl border border-white/40">
            {/* Category badge */}
            <div className="flex items-center gap-1.5 mb-1.5">
              {blogs[currentIndex].category && (
                <span className="px-2 py-0.5 bg-gold/10 text-gold text-[9px] font-bold uppercase tracking-wider rounded-full">
                  {blogs[currentIndex].category}
                </span>
              )}
              <span className="text-[9px] font-medium text-earth uppercase tracking-wider">
                {blogs[currentIndex].date
                  ? formatDate(blogs[currentIndex].date, validLang)
                  : ""}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-[16px] sm:text-[18px] font-bold text-ink leading-tight mb-2 line-clamp-2">
              {blogs[currentIndex].title?.[validLang] ||
                blogs[currentIndex].title?.mn ||
                "Blog Title"}
            </h2>

            {/* Excerpt (first 2 sentences) */}
            {(() => {
              const excerptText = getExcerpt(
                blogs[currentIndex].content?.[validLang] ||
                blogs[currentIndex].content?.mn ||
                ""
              );
              return excerptText ? (
                <p className="text-[12px] sm:text-[13px] text-earth leading-relaxed mb-3 line-clamp-2">
                  {excerptText}
                </p>
              ) : null;
            })()}

            {/* Meta info and CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-stone/30">
              {/* Author */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gold/10 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-gold" />
                </div>
                <span className="text-[13px] font-medium text-earth">
                  {blogs[currentIndex].authorName ||
                    (validLang === "mn" ? "Багш" : "Teacher")}
                </span>
              </div>

              {/* Read More Button */}
              <Link href={`/${locale}/blog/${blogs[currentIndex].id}`}>
                <motion.button
                  className="group relative overflow-hidden px-4 py-2 bg-gold text-white font-bold text-[11px] uppercase tracking-wider rounded-full shadow-md shadow-gold/20 transition-all hover:shadow-lg hover:shadow-gold/30"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    {validLang === "mn" ? "Дэлгэрэнгүй" : "Read More"}
                    <ArrowRight className="w-1.5 h-1.5 transition-transform group-hover:translate-x-1" />
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Navigation arrows */}
      {blogs.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg border border-border hover:bg-white transition-all hover:scale-110 z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-ink" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg border border-border hover:bg-white transition-all hover:scale-110 z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-ink" />
          </button>
        </>
      )}

      {/* Progress dots */}
      {blogs.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {blogs.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentIndex
                ? "bg-gold scale-125 shadow-gold"
                : "bg-white/50 hover:bg-white/70"
                }`}
            />
          ))}
        </div>
      )}

      {/* Pause indicator */}
      {isHovered && (
        <motion.div
          className="absolute top-6 right-6 bg-black/60 text-white px-3 py-1 rounded-full text-[11px] font-medium backdrop-blur z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {validLang === "mn" ? "Зогссон" : "Paused"}
          </div>
        </motion.div>
      )}
    </div>
  );
}
