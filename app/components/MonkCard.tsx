"use client";

import React from "react";
import Image from "next/image";
import { Monk } from "@/database/types";
import { useLanguage } from "../contexts/LanguageContext";
import { Heart, Star, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface MonkCardProps {
    monk: Monk;
    index?: number;
    onClick?: () => void;
}

export default function MonkCard({ monk, index = 0, onClick }: MonkCardProps) {
    const { t, language: lang } = useLanguage();
    const { user } = useAuth();
    const validLang = (['mn', 'en'].includes(lang) ? lang : 'mn') as 'mn' | 'en';

    const name = monk.name?.[validLang] || monk.name?.mn || monk.name?.en || "Unknown";
    const titleText = monk.title?.[validLang] || monk.title?.mn || monk.title?.en || "Үзмэрч";
    const years = monk.yearsOfExperience || 10;
    const price = (monk.services && monk.services[0]?.price) ? monk.services[0].price.toLocaleString() : "50,000";
    const isOnline = monk.isAvailable !== false;
    const rating = (monk as any).rating || "4.8";
    const reviews = (monk as any).reviews || 65;

    const specialty = Array.isArray(monk.specialties) && monk.specialties.length > 0
        ? monk.specialties[0]
        : (validLang === 'en' ? "Spiritual Guide" : "Засалч");

    return (
        <motion.div
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            className="app-card-premium p-4 mb-4 flex gap-4 items-center cursor-pointer"
        >
            {/* Avatar & Status */}
            <div className="relative w-20 h-20 flex-shrink-0">
                <div className={`absolute inset-0 rounded-full ${isOnline ? "aura-pulse" : "bg-stone/50"}`} />
                <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white shadow-sm z-10">
                    <Image
                        src={monk.image || "/default-monk.jpg"}
                        alt={name}
                        fill
                        priority={index < 3}
                        loading={index < 3 ? undefined : "lazy"}
                        className="object-cover"
                    />
                </div>
                {isOnline && (
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                            <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                            <span className="text-[9px] font-bold text-white uppercase tracking-wider">Online</span>
                        </div>
                    )}
            </div>

            {/* Info Container */}
            <div className="flex-1 min-w-0 pr-2 overflow-hidden">
                <div className="flex flex-col gap-0.5">
                    <h3 className="text-base font-black text-ink leading-tight truncate">{name}</h3>
                    <p className="text-[10px] font-black text-gold uppercase tracking-widest opacity-80 line-clamp-1">{titleText}</p>
                </div>

                <p className="text-[11px] text-earth/60 mt-1 truncate">{specialty} · {years} жил</p>

                <div className="flex items-center gap-1.5 mt-2">
                    <div className="flex items-center gap-1">
                        <Star size={10} className="text-gold fill-gold" />
                        <span className="text-[11px] font-black text-ink">{rating}</span>
                        <span className="text-[10px] text-earth/40">({reviews})</span>
                    </div>
                </div>
            </div>

            {/* Right: Booking Focus */}
            <div className="flex flex-col items-end shrink-0">
                <p className="text-sm font-black text-ink mb-2">₮{price}</p>
                <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-white shadow-sm">
                    <ArrowRight size={14} />
                </div>
            </div>
        </motion.div>
    );
}
