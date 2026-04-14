"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/contexts/NotificationContext";
import { MessageCircle, CalendarCheck, Info } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "../contexts/LanguageContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({ isOpen, onClose }: Props) {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const { language: lang } = useLanguage();

  const getIcon = (type?: string) => {
    switch (type) {
      case "message":
        return <MessageCircle size={18} className="text-[#319795]" />;
      case "booking":
        return <CalendarCheck size={18} className="text-[#D4AF77]" />;
      default:
        return <Info size={18} className="text-[#5a4d41]" />;
    }
  };

  const formatTime = (date: string | Date) => {
    const now = new Date();
    const then = new Date(date);
    const diffMins = Math.floor((now.getTime() - then.getTime()) / 60000);
    
    if (diffMins < 1) return "Одоо";
    if (diffMins < 60) return `${diffMins} мин`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} цаг`;
    return `${Math.floor(diffHours / 24)} өдөр`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[50px] right-0 z-50 w-[340px] bg-[#F8F4ED] rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.15)] border border-[#D4AF77]/30 overflow-hidden flex flex-col max-h-[400px]"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#D4AF77]/20 flex justify-between items-center bg-[#F8F4ED]">
              <h3 className="font-serif font-bold text-xl text-[#D4AF77] leading-none">
                Мэдэгдэл
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => {
                    markAsRead(undefined, true);
                    onClose();
                  }}
                  className="text-[10px] text-[#5a4d41] uppercase tracking-wider font-bold hover:text-[#D4AF77] transition-colors"
                >
                  Бүгдийг уншсан
                </button>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto hide-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-[#5a4d41] text-sm">
                  Шинэ мэдэгдэл байхгүй байна.
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((notif, idx) => (
                    <div
                      key={notif._id?.toString() || idx}
                      onClick={() => {
                        if (!notif.read) markAsRead(notif._id?.toString());
                        // Optional: Navigate to link if notif.link exists
                        // if (notif.link) router.push(notif.link);
                        // onClose();
                      }}
                      className={`relative p-4 flex gap-4 cursor-pointer hover:bg-white/40 transition-colors ${
                        !notif.read ? "bg-white/60" : ""
                      }`}
                    >
                      {/* Divider */}
                      {idx !== notifications.length - 1 && (
                        <div className="absolute bottom-0 left-16 right-4 h-[1px] bg-[#D4AF77]/20" />
                      )}

                      {/* Icon */}
                      <div className="w-10 h-10 rounded-full bg-white border border-[#D4AF77]/20 flex items-center justify-center shrink-0 shadow-sm">
                        {getIcon(notif.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-0.5 pr-2">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <h4 className={`text-sm text-[#0F2A4A] truncate ${!notif.read ? 'font-bold' : 'font-medium'}`}>
                            {typeof notif.title === 'string' ? notif.title : notif.title?.mn}
                          </h4>
                          <span className="text-[10px] text-[#319795] whitespace-nowrap shrink-0 mt-0.5 font-bold">
                            {notif.createdAt ? formatTime(notif.createdAt) : "Одоо"}
                          </span>
                        </div>
                        <p className="text-xs text-[#5a4d41] line-clamp-2 leading-relaxed">
                          {typeof notif.message === 'string' ? notif.message : notif.message?.mn}
                        </p>
                      </div>

                      {/* Unread Dot */}
                      {!notif.read && (
                        <div className="absolute top-1/2 -translate-y-1/2 right-3 w-2 h-2 rounded-full bg-[#E53E3E] shadow-sm" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-[#D4AF77]/20 bg-[#F8F4ED]/90 backdrop-blur-md text-center">
              <Link
                href={`/${lang}/profile`}
                onClick={onClose}
                className="text-[11px] font-bold text-[#319795] uppercase tracking-widest hover:opacity-80 transition-opacity"
              >
                Бүгдийг харах
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
