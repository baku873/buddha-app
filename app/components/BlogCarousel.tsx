"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
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
  const [progress, setProgress] = useState(0);

  const AUTOPLAY_DELAY = 6000; // Slightly longer for reading
  const PROGRESS_INTERVAL = 50;

  useEffect(() => {
    if (isHovered || !blogs || blogs.length <= 1) return;

    let progressValue = 0;
    const progressTimer = setInterval(() => {
      progressValue += (PROGRESS_INTERVAL / AUTOPLAY_DELAY) * 100;
      setProgress(progressValue);

      if (progressValue >= 100) {
        progressValue = 0;
        setCurrentIndex((prev) => (prev + 1) % blogs.length);
      }
    }, PROGRESS_INTERVAL);

    return () => clearInterval(progressTimer);
  }, [blogs, isHovered, currentIndex]);

  const goToPrevious = useCallback(() => {
    setProgress(0);
    setCurrentIndex((prev) => (prev - 1 + blogs.length) % blogs.length);
  }, [blogs.length]);

  const goToNext = useCallback(() => {
    setProgress(0);
    setCurrentIndex((prev) => (prev + 1) % blogs.length);
  }, [blogs.length]);

  const goToSlide = (index: number) => {
    setProgress(0);
    setCurrentIndex(index);
  };

  const getExcerpt = (content?: string) => {
    if (!content) return "";
    const sentences = content
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);
    const firstTwo = sentences
      .slice(0, 2)
      .map((s) => s.trim())
      .join(". ");
    return firstTwo + (sentences.length > 2 ? "..." : ".");
  };

  if (!blogs || blogs.length === 0) {
    return (
      <div className="relative w-full aspect-[16/9] max-h-[500px] bg-gradient-to-br from-stone-100 to-stone-200 rounded-2xl border border-stone-200 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-amber-600" />
          </div>
          <p className="text-lg font-medium text-stone-600">
            {validLang === "mn"
              ? "Блог бичлэг байхгүй байна"
              : "No blog posts available"}
          </p>
        </div>
      </div>
    );
  }

  const currentBlog = blogs[currentIndex];

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden bg-stone-900 shadow-2xl group"
      // Fixed height for mobile to ensure button fits, aspect ratio for desktop
      style={{ minHeight: "500px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* --- BACKGROUND IMAGE --- */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
        >
          {currentBlog.cover ? (
            <Image
              src={currentBlog.cover}
              alt={currentBlog.title?.[validLang] || "Blog cover"}
              fill
              priority={currentIndex === 0}
              className="object-cover"
              sizes="100vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-stone-800 to-stone-900 flex items-center justify-center">
              <Calendar className="w-20 h-20 text-stone-600" />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* --- OVERLAYS --- */}
      {/* Mobile: Stronger gradient at bottom for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent md:bg-gradient-to-r md:from-black/80 md:via-black/40 md:to-transparent" />

      {/* --- CONTENT CONTAINER --- */}
      <div className="absolute inset-0 flex flex-col justify-end">

        {/* Main Content Area */}
        <div className="relative z-10 p-6 pb-24 md:p-10 md:pb-10 lg:p-16 md:flex md:items-center md:justify-start md:h-full">
          <motion.div
            key={`content-${currentIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="max-w-xl"
          >
            {/* 1. Meta Info (Category & Date) */}
            <div className="flex items-center gap-2 mb-3">
              {currentBlog.category && (
                <span className="px-3 py-1 bg-amber-500 text-black text-[10px] font-bold uppercase tracking-wider rounded-full">
                  {currentBlog.category}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-white/70 text-xs font-medium">
                <Calendar className="w-3 h-3" />
                {currentBlog.date
                  ? formatDate(currentBlog.date, validLang)
                  : ""}
              </span>
            </div>

            {/* 2. Title - Clear visual hierarchy */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-3 line-clamp-3 drop-shadow-lg">
              {currentBlog.title?.[validLang] ||
                currentBlog.title?.mn ||
                "Blog Title"}
            </h2>

            {/* 3. Excerpt - Content preview so user has reason to tap */}
            {(() => {
              const excerptText = getExcerpt(
                currentBlog.content?.[validLang] ||
                currentBlog.content?.mn ||
                ""
              );
              return excerptText ? (
                <p className="text-sm sm:text-base text-white/80 leading-relaxed mb-5 line-clamp-2">
                  {excerptText}
                </p>
              ) : null;
            })()}

            {/* 4. Author Row */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white/50 text-[10px] uppercase tracking-widest leading-none mb-0.5">
                  {validLang === "mn" ? "Нийтлэгч" : "Author"}
                </p>
                <p className="text-white text-sm font-semibold leading-none">
                  {currentBlog.authorName ||
                    (validLang === "mn" ? "Багш" : "Teacher")}
                </p>
              </div>
            </div>

            {/* 5. CTA Button - Full width on mobile, auto on desktop */}
            <Link
              href={`/${locale}/blog/${currentBlog.id}`}
              className="block sm:inline-block"
            >
              <motion.button
                className="w-full sm:w-auto group flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-bold text-sm rounded-xl transition-colors shadow-lg shadow-amber-500/30"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                {validLang === "mn" ? "Дэлгэрэнгүй үзэх" : "Read Article"}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* --- BOTTOM BAR (Mobile) --- */}
      {/* Arrows + Dots + Counter all in one row, thumb-friendly */}
      <div className="absolute bottom-0 left-0 right-0 z-20 md:hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-black/40 backdrop-blur-sm">

          {/* Prev Arrow */}
          {blogs.length > 1 ? (
            <button
              onClick={goToPrevious}
              className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white active:bg-white/30 transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-10 h-10" />
          )}

          {/* Dots */}
          {blogs.length > 1 && (
            <div className="flex items-center gap-2">
              {blogs.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className="relative h-1.5 rounded-full overflow-hidden transition-all duration-300"
                  style={{
                    width: index === currentIndex ? "2rem" : "0.5rem",
                    backgroundColor: "rgba(255,255,255,0.25)",
                  }}
                >
                  {index === currentIndex ? (
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-amber-500 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-white/40 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Next Arrow */}
          {blogs.length > 1 ? (
            <button
              onClick={goToNext}
              className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white active:bg-white/30 transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-10 h-10" />
          )}
        </div>
      </div>

      {/* --- DESKTOP ARROWS (hover reveal) --- */}
      {blogs.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:text-black z-20 hidden md:flex"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:text-black z-20 hidden md:flex"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* --- DESKTOP BOTTOM BAR --- */}
      {blogs.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-20 hidden md:block">
          <div className="flex items-center justify-between px-10 lg:px-16 py-4">

            {/* Slide counter */}
            <span className="text-white/50 text-sm font-medium">
              <span className="text-white font-bold">{currentIndex + 1}</span>
              <span className="mx-1.5">/</span>
              {blogs.length}
            </span>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {blogs.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className="relative h-1.5 rounded-full overflow-hidden transition-all duration-300"
                  style={{
                    width: index === currentIndex ? "2.5rem" : "0.5rem",
                    backgroundColor: "rgba(255,255,255,0.25)",
                  }}
                >
                  {index === currentIndex ? (
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-amber-500 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-white/40 hover:bg-white/70 transition-colors rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Paused indicator */}
            <AnimatePresence>
              {isHovered ? (
                <motion.div
                  className="flex items-center gap-1.5 text-white/60 text-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {validLang === "mn" ? "Зогссон" : "Paused"}
                </motion.div>
              ) : (
                // Spacer to keep dots centered
                <div className="w-16" />
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* --- DESKTOP THUMBNAIL STRIP (xl only) --- */}
      {blogs.length > 1 && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-2 z-20">
          {blogs.map((blog, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`relative w-16 h-10 rounded-lg overflow-hidden border-2 transition-all duration-300 ${index === currentIndex
                  ? "border-amber-500 scale-110 shadow-lg shadow-amber-500/30"
                  : "border-white/20 opacity-50 hover:opacity-80 hover:border-white/50"
                }`}
            >
              {blog.cover ? (
                <Image
                  src={blog.cover}
                  alt={blog.title?.[validLang] || `Slide ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="w-full h-full bg-stone-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-stone-400" />
                </div>
              )}
              {index === currentIndex && (
                <div className="absolute inset-0 bg-amber-500/20" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}