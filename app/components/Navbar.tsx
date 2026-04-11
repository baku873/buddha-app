"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Home,
  Users,
  MessageSquare,
  UserCircle,
  Bell,
  Newspaper
} from "lucide-react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { UserButton } from "@clerk/nextjs";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePlatform } from "@/app/capacitor/hooks/usePlatform";
import { hapticsLight } from "@/app/capacitor/plugins/haptics";
import { LocalizedLink } from "./LocalizedLink";

const CONTENT = {
  logo: { mn: "Гэвабaл", en: "Gevabal" },
  login: { mn: "Нэвтрэх", en: "Sign In" },
  profile: { mn: "Профайл", en: "Profile" },
};

export default function NativeNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { language: lang } = useLanguage();
  const { scrollY } = useScroll();
  const { user } = useAuth();
  const { isNative, safeArea } = usePlatform();
  const { unreadCount } = useNotifications();
  
  useEffect(() => setMounted(true), []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 10);
  });

  // Removed if (!mounted) return null; to allow static shell to render instantly during SSR

  const getIsActive = (href: string) => {
    const itemPath = href === '/' ? `/${lang}` : `/${lang}${href}`;
    return pathname === itemPath || (href !== '/' && pathname.startsWith(itemPath));
  };



  const Logo = ({ className = "" }) => (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative w-9 h-9 shrink-0">
        <Image
          src="/logo.webp"
          alt="Logo"
          width={36}
          height={36}
          className="w-full h-full object-cover rounded-lg"
          priority
        />
      </div>
      <span className="font-serif font-black text-lg text-ink leading-none tracking-tight">
        {CONTENT.logo[lang]}
      </span>
    </div>
  );

  const desktopNav = [
    { name: { mn: "Нүүр", en: "Home" }, href: "/" },
    { name: { mn: "Үзмэрч", en: "Exhibitor" }, href: "/monks" },
    { name: { mn: "Блог", en: "Blog" }, href: "/blog" },
    { name: { mn: "Мессенжер", en: "Messenger" }, href: "/messenger", auth: true },
  ];

  const mobileNav = [
    { id: 'home', icon: Home, href: '/', label: { mn:'НҮҮР', en:'HOME' } },
    { id: 'blog', icon: Newspaper, href: '/blog', label: { mn:'БЛОГ', en:'BLOG' } },
    { id: 'monks', icon: Users, href: '/monks', label: { mn:'ЛАМ НАР', en:'MONKS' }, isCTA: true },
    { id: 'messenger', icon: MessageSquare, href: '/messenger', label: { mn:'МЕССЕЖ', en:'MESSAGES' }, auth: true },
    { id: 'profile', icon: UserCircle, href: '/profile', label: { mn:'ПРОФАЙЛ', en:'PROFILE' } }
  ];

  const isAuthPage = ["/sign-in", "/sign-up"].some(p => pathname.includes(p));
  const isFocusedPage = ["/booking/", "/call/"].some(p => pathname.includes(p));
  const isMessengerPage = pathname.includes("/messenger");

  if (isFocusedPage) return null;

  return (
    <>
      {/* ── DESKTOP NAVBAR ── */}
      <header className="fixed z-50 top-0 left-0 right-0 hidden md:flex justify-center bg-white/95 backdrop-blur-md border-b border-border shadow-sm py-3 px-8 transition-none">
        <nav className="w-full max-w-7xl flex items-center justify-between">
          <LocalizedLink href="/" className="hover:opacity-80 transition-opacity">
            <Logo />
          </LocalizedLink>
          <div className="flex items-center gap-1 bg-stone/50 p-1.5 rounded-full border border-border/40">
            {desktopNav.map((item) => {
              const isActive = getIsActive(item.href);
              const nextParam = encodeURIComponent(item.href);
              const targetHref = item.auth && !user ? `/sign-in?next=${nextParam}` : item.href;
              return (
                <LocalizedLink
                  key={item.href}
                  href={targetHref}
                  className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all relative
                    ${isActive ? "text-white" : "text-earth hover:bg-white/80 hover:text-gold"}`}
                >
                  {isActive && (
                    <motion.div layoutId="deskNavHighlight" className="absolute inset-0 bg-gold rounded-full -z-10 shadow-gold" />
                  )}
                  {item.name[lang]}
                </LocalizedLink>
              )
            })}
          </div>
          <div className="flex items-center gap-4">
            {mounted ? (
              user ? (
                <div className="flex items-center gap-3 pl-3 border-l border-border">
                  <LocalizedLink href="/profile" className="text-xs font-black uppercase tracking-widest text-ink hover:text-gold transition-colors">
                    {CONTENT.profile[lang]}
                  </LocalizedLink>
                  <UserButton />
                </div>
              ) : (
                <LocalizedLink href="/sign-in"><button className="btn-primary text-xs py-2.5 px-6">{CONTENT.login[lang]}</button></LocalizedLink>
              )
            ) : (
              <div className="w-24 h-10 bg-black/5 animate-pulse rounded-full" />
            )}
          </div>
        </nav>
      </header>

      {/* ── MOBILE TOP HEADER ── */}
      {!isAuthPage && !isMessengerPage && (
        <header 
          className={`md:hidden fixed top-0 left-0 right-0 z-40 transition-all duration-300 flex items-center justify-between px-5 ${
            isScrolled ? "bg-white/90 backdrop-blur-lg border-b border-stone/10" : "bg-transparent"
          }`}
          style={{ 
            height: `calc(54px + env(safe-area-inset-top, 44px))`,
            paddingTop: isNative ? `${Math.max(safeArea.top, 20)}px` : 'env(safe-area-inset-top, 44px)'
          }}
        >
          <LocalizedLink href="/" aria-label="Home" className="active:opacity-70 transition-opacity">
            <Logo />
          </LocalizedLink>

          <div className="flex items-center gap-4">
             <button className="text-earth/80 relative">
               <Bell size={22} strokeWidth={2} />
               {mounted && unreadCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-error border border-white" />}
             </button>
             {mounted ? (
               user ? (
                 <div className="scale-90"><UserButton /></div>
               ) : (
                 <LocalizedLink href="/sign-in">
                   <button className="bg-ink text-white rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest">
                      Орох
                   </button>
                 </LocalizedLink>
               )
             ) : (
                 <div className="w-16 h-8 bg-black/5 animate-pulse rounded-full" />
             )}
          </div>
        </header>
      )}

      {/* ── MOBILE BOTTOM TAB BAR (iOS Minimal Premium) ── */}
      {!isAuthPage && (
        <nav 
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-white/90 backdrop-blur-2xl border-t border-stone/10 shadow-[0_-4px_24px_rgba(0,0,0,0.04)]"
          style={{ 
             paddingBottom: `env(safe-area-inset-bottom, 0px)`,
             minHeight: `calc(64px + env(safe-area-inset-bottom, 0px))`
          }}
        >
          {mobileNav.map((item) => {
            const isActive = getIsActive(item.href);
            const isCenter = item.id === 'monks';
            const nextParam = encodeURIComponent(item.href);
            const targetHref = item.auth && !user ? `/sign-in?next=${nextParam}` : item.href;

            const handleTap = async () => {
              if (isNative) {
                await hapticsLight();
              }
            };

            return (
              <LocalizedLink
                key={item.id}
                href={targetHref}
                onClick={handleTap}
                className="relative flex flex-col items-center justify-center flex-1 h-16 active:opacity-70 transition-opacity gap-1"
              >
                <div className={`relative z-10 flex items-center justify-center ${isCenter ? 'w-12 h-12 -mt-6 bg-white border border-border rounded-full shadow-gold mb-1 flex-shrink-0' : ''}`}>
                  {isCenter && (
                     <div className="absolute inset-0 bg-gold/10 rounded-full" />
                  )}
                  <motion.div
                    animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <item.icon 
                      size={isCenter ? 24 : 24} 
                      strokeWidth={isActive ? 2.5 : 2} 
                      className={`transition-colors duration-300 ${isActive ? "text-gold" : "text-earth/60"}`} 
                    />
                  </motion.div>
                  {/* Unread dot for messenger */}
                  {item.id === "messenger" && user && unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-[#EF4444] rounded-full border-2 border-white z-20 shadow-sm" />
                  )}
                </div>
                
                <span className={`text-[9px] font-bold tracking-widest uppercase transition-colors duration-300 ${isActive ? "text-gold" : "text-earth/60"}`}>
                  {item.label[lang]}
                </span>
              </LocalizedLink>
            );
          })}
        </nav>
      )}
    </>
  );
}
