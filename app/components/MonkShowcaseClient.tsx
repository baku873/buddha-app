"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../contexts/LanguageContext";
import { Monk } from "@/database/types";
import MonkCard from "./MonkCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  getCachedMonks,
  cacheMonks,
} from "@/app/capacitor/storage/offlineStorage";
import LargeHeader from "./LargeHeader";

export default function MonkShowcaseClient({
  initialMonks,
  hideHeader = false,
}: {
  initialMonks: Monk[];
  hideHeader?: boolean;
}) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [monks, setMonks] = useState<Monk[]>(initialMonks || []);

  useEffect(() => {
    const refreshMonks = async () => {
      try {
        // 1. Try to load from cache
        const cached = await getCachedMonks();
        if (cached && cached.length > 0) {
          setMonks(cached);
        }

        // 2. Fetch fresh data in the background
        const res = await fetch("/api/monks");
        if (res.ok) {
          const freshData = await res.json();
          setMonks(freshData);
          await cacheMonks(freshData); // Use the 15m TTL defined in helper
        }
      } catch (err) {
        console.warn("Background monk refresh failed", err);
      }
    };

    refreshMonks();
  }, []);

  const filteredMonks = useMemo<Monk[]>(() => {
    const query = searchQuery.toLowerCase();
    // Sorting preferred names
    const preferredNames = [
      "Буянцог",
      "Ундраа",
      "Амина",
      "Доржбаатар",
      "Эрдэнэ",
      "Цэцэг",
    ];
    const getMonkRank = (m: Monk) => {
      const nameMn = m.name?.mn || "";
      const nameEn = m.name?.en || "";
      const index = preferredNames.findIndex(
        (p) =>
          nameMn.toLowerCase().includes(p.toLowerCase()) ||
          nameEn.toLowerCase().includes(p.toLowerCase()),
      );
      return index === -1 ? 999 : index;
    };

    const result = monks.filter((monk) => {
      if (monk.isAvailable === false && !hideHeader) return false;

      const matchesQuery =
        !query ||
        (monk.name?.mn || "").toLowerCase().includes(query) ||
        (monk.name?.en || "").toLowerCase().includes(query) ||
        monk.specialties?.some((s) => s.toLowerCase().includes(query));

      return matchesQuery;
    });

    // Sort by rank then by monkNumber
    return result.sort((a, b) => {
      const rankA = getMonkRank(a);
      const rankB = getMonkRank(b);
      if (rankA !== rankB) return rankA - rankB;
      return (a.monkNumber || 99) - (b.monkNumber || 99);
    });
  }, [searchQuery, hideHeader, monks]);

  const handleMonkClick = (monkId: string) => {
    const validLang = (["mn", "en"].includes(language) ? language : "mn") as
      | "mn"
      | "en";
    router.push(`/${validLang}/monks/${monkId}`);
  };

  return (
    <div
      className={hideHeader ? "" : "min-h-[100svh] bg-cream pb-24"}
      style={
        hideHeader
          ? {}
          : {
              paddingTop:
                "calc(var(--header-height-mobile) + env(safe-area-inset-top, 0px))",
            }
      }
    >
      {/* Header Area */}
      {!hideHeader && (
        <div className="sticky top-[calc(var(--header-height-mobile)+env(safe-area-inset-top,0px))] bg-cream/80 backdrop-blur-xl z-30 border-b border-stone/30">
          <LargeHeader
            title={t({ mn: "Багш", en: "Mentors" })}
            highlight={t({ mn: "Нээлттэй", en: "Available" })}
            subtitle={t({
              mn: "Танд хамгийн зохицох багшийг хайж олоорой",
              en: "Find the right mentor for your journey",
            })}
            right={
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-stone/50 flex items-center justify-center">
                <Sparkles size={22} className="text-gold" />
              </div>
            }
          />
          <div className="px-6 pb-4">
            <div className="relative group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-earth/50 group-focus-within:text-gold transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder={t({
                  mn: "Нэр, чадвараар хайх...",
                  en: "Search by name or skill...",
                })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone/20 border border-transparent focus:border-gold/10 focus:bg-white transition-all rounded-2xl py-3.5 pl-11 pr-4 text-[15px] text-ink placeholder-earth/40 outline-none shadow-inner"
              />
            </div>
          </div>
        </div>
      )}

      <div className={hideHeader ? "px-0" : "px-5 pb-10 mt-6"}>
        <AnimatePresence mode="popLayout">
          {filteredMonks.length > 0 ? (
            <motion.div layout className="flex flex-col">
              {filteredMonks.map((monk, index) => (
                <MonkCard
                  key={monk._id?.toString()}
                  monk={monk}
                  index={index}
                  onClick={() => handleMonkClick(monk._id?.toString() || "")}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-32 px-10"
            >
              <div className="w-20 h-20 rounded-[2.5rem] bg-stone/20 flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-earth/40" />
              </div>
              <h3 className="text-lg font-black text-ink mb-2">
                {t({ mn: "Илэрц олдсонгүй", en: "No mentors found" })}
              </h3>
              <p className="text-[14px] text-earth/60">
                {t({
                  mn: "Та хайлтаа өөрчлөөд үзээрэй.",
                  en: "Try adjusting your search query.",
                })}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
