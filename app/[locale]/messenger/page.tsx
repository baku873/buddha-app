"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { Send, ArrowLeft, Search, MessageSquare, Loader2, User, Sparkles } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useRealtimeMessages } from "@/app/hooks/useRealtimeMessages";
import { LocalizedLink } from "@/app/components/LocalizedLink";

interface Conversation {
  otherId: string;
  otherName: string;
  otherImage: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  isMonk: boolean;
}

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  text: string;
  createdAt: string;
  read: boolean;
}

interface MonkUser {
  _id: string;
  name: { mn: string; en: string };
  image: string;
  title: { mn: string; en: string };
  isSpecial?: boolean;
}

export default function MessengerPage() {
  const { user, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const monkIdFromUrl = searchParams.get("monkId");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [allMonks, setAllMonks] = useState<MonkUser[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  
  const { messages, setMessages, isConnected, isFallbackMode, sendMessage } = useRealtimeMessages(
    selectedConv?.otherId || null,
    user?._id || user?.id || null
  );

  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"chats" | "monks">("chats");
  const [searchQuery, setSearchQuery] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/${language}/sign-in`);
    }
  }, [authLoading, user, router, language]);

  // Fetch Conversations
  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        
        if (monkIdFromUrl && !data.find((c: Conversation) => c.otherId === monkIdFromUrl)) {
           fetchMonkInfo(monkIdFromUrl);
        } else if (monkIdFromUrl) {
           const existing = data.find((c: Conversation) => c.otherId === monkIdFromUrl);
           if (existing) setSelectedConv(existing);
        }
      }
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch All Monks
  const fetchAllMonks = async () => {
    try {
      const res = await fetch("/api/monks");
      if (res.ok) {
        const data = await res.json();
        setAllMonks(data);
      }
    } catch (error) {
      console.error("Failed to fetch all monks", error);
    }
  };

  const fetchMonkInfo = async (id: string) => {
    try {
      const res = await fetch(`/api/monks/${id}`);
      if (res.ok) {
        const monkData = await res.json();
        const tempConv: Conversation = {
          otherId: id,
          otherName: monkData.name[language] || monkData.name.mn || monkData.name.en,
          otherImage: monkData.image || "/default-monk.jpg",
          lastMessage: "",
          lastMessageAt: new Date().toISOString(),
          unreadCount: 0,
          isMonk: true
        };
        setSelectedConv(tempConv);
      }
    } catch (error) {
      console.error("Failed to fetch monk info", error);
    }
  };

  // Fetch Messages for selected conversation
  const fetchMessages = async (otherId: string) => {
    setMessagesLoading(true);
    try {
      const res = await fetch(`/api/messages/${otherId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchAllMonks();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConv) {
      setMessages([]); // Clear previous conversation messages
      fetchMessages(selectedConv.otherId);
    }
  }, [selectedConv]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/messages/${selectedConv.otherId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newMessage })
      });

      if (res.ok) {
        const sentMsg = await res.json();
        
        // Push WS message for realtime broadcasting
        if (isConnected) {
          sendMessage(sentMsg.text);
        } else {
          setMessages([...messages, sentMsg]);
        }
        
        setNewMessage("");
        
        setConversations(prev => {
          const exists = prev.find(c => c.otherId === selectedConv.otherId);
          if (exists) {
            return prev.map(c => 
              c.otherId === selectedConv.otherId 
                ? { ...c, lastMessage: sentMsg.text, lastMessageAt: sentMsg.createdAt } 
                : c
            );
          } else {
            return [{
              otherId: selectedConv.otherId,
              otherName: selectedConv.otherName,
              otherImage: selectedConv.otherImage,
              lastMessage: sentMsg.text,
              lastMessageAt: sentMsg.createdAt,
              unreadCount: 0,
              isMonk: true
            }, ...prev];
          }
        });
      }
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setSending(false);
    }
  };

  const startChatWithMonk = (monk: MonkUser) => {
    const existingConv = conversations.find(c => c.otherId === monk._id);
    if (existingConv) {
      setSelectedConv(existingConv);
    } else {
      setSelectedConv({
        otherId: monk._id,
        otherName: monk.name[language] || monk.name.mn || monk.name.en,
        otherImage: monk.image || "/default-monk.jpg",
        lastMessage: "",
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0,
        isMonk: true
      });
    }
    setActiveTab("chats");
  };

  const filteredConversations = conversations.filter(c => 
    c.otherName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMonks = allMonks.filter(m => 
    (m.name[language] || m.name.mn || m.name.en).toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- UTILITY: GROUP MESSAGES BY DATE ---
  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    msgs.forEach(msg => {
      const date = new Date(msg.createdAt).toLocaleDateString(language === 'mn' ? 'mn-MN' : 'en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  if (authLoading || (loading && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-10 h-10 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  // --- COMPONENT: CONVERSATION LIST ---
  if (!selectedConv) return (
    <div className="min-h-[100svh] bg-[#FDFBF7] flex flex-col">
      {/* Header */}
      <header className="px-6 border-b border-stone/10 bg-[#FDFBF7]/80 backdrop-blur-xl sticky top-0 z-20"
        style={{ paddingTop: "calc(20px + env(safe-area-inset-top, 44px))", paddingBottom: 16 }}>
        <div className="flex items-center justify-between mb-6">
           <div>
             <h1 className="text-[28px] font-black text-ink tracking-tight">
               {t({ mn: "Мессенжер", en: "Messages" })}
             </h1>
             <p className="text-[11px] font-bold text-earth/40 uppercase tracking-widest mt-0.5">
               {conversations.length} {t({ mn: "Яриа", en: "Conversations" })}
             </p>
           </div>
           <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-stone/10 flex items-center justify-center">
             <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}>
               <Sparkles size={24} className="text-gold" />
             </motion.div>
           </div>
        </div>

        {/* Segmented Control */}
        <div className="relative flex p-1.5 bg-stone/20 rounded-2xl">
          <motion.div
             className="absolute inset-y-1.5 left-1.5 bg-white rounded-xl shadow-sm z-0"
             animate={{ x: activeTab === "chats" ? "0%" : "calc(100% + 3px)" }}
             initial={false}
             transition={{ type: "spring", stiffness: 450, damping: 40 }}
             style={{ width: "calc(50% - 7px)" }}
          />
          {(["chats", "monks"] as const).map(tab => (
            <button key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative z-10 flex-1 py-2.5 text-[14px] font-black transition-colors duration-300 ${
                activeTab === tab ? "text-ink" : "text-earth/50"
              }`}
            >
              {tab === "chats" ? t({ mn: "Яриа", en: "Chats" }) : t({ mn: "Багш нар", en: "Monks" })}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-6 pb-32">
        {/* Search - Inside scroll to keep header minimal */}
        <div className="py-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-earth/30 group-focus-within:text-gold transition-colors" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'chats' ? t({ mn: "Зурвас хайх...", en: "Search messages..." }) : t({ mn: "Багш хайх...", en: "Find a guide..." })}
              className="w-full bg-stone/10 border-2 border-transparent focus:border-gold/5 focus:bg-white rounded-3xl py-4 pl-12 pr-4 text-[15px] text-ink placeholder:text-earth/30 outline-none transition-all shadow-inner"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-24 skeleton rounded-[2.5rem]" />)}
            </motion.div>
          ) : activeTab === "chats" ? (
            filteredConversations.length === 0 ? (
              <motion.div key="no-chats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24 px-10">
                <div className="w-24 h-24 rounded-[3rem] bg-stone/20 flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <MessageSquare size={40} className="text-earth/20" />
                </div>
                <h3 className="text-[20px] font-black text-ink mb-3">
                  {t({ mn: "Одоогоор яриа алга", en: "Inner Peace Awaits" })}
                </h3>
                <p className="text-[15px] text-earth/50 leading-relaxed max-w-[240px] mx-auto">
                  {t({ mn: "Өөрт тохирох багшийг сонгон сэтгэлийн яриаг эхлүүлээрэй.", en: "Begin a soulful dialogue with an experienced guide today." })}
                </p>
                <button 
                  onClick={() => setActiveTab('monks')}
                  className="mt-8 bg-ink text-white px-8 py-3.5 rounded-full text-[13px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-transform"
                >
                  {t({ mn: "Багш хайх", en: "Find a Guide" })}
                </button>
              </motion.div>
            ) : (
              <motion.div key="chats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                {filteredConversations.map((conv) => (
                  <button key={conv.otherId} onClick={() => setSelectedConv(conv)}
                    className="w-full flex items-center gap-5 p-4 bg-white border border-stone/10 rounded-[2rem] text-left active:scale-[0.98] transition-all shadow-[0_2px_10px_rgba(120,104,81,0.05)] hover:shadow-md">
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 rounded-[1.8rem] overflow-hidden border-2 border-white shadow-soft">
                        <Image src={conv.otherImage || "/default-monk.jpg"} alt={conv.otherName}
                          width={64} height={64} className="w-full h-full object-cover" />
                      </div>
                      {conv.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 min-w-[24px] h-6 rounded-full bg-gold border-2 border-white flex items-center justify-center px-1.5 shadow-gold">
                          <span className="text-[10px] font-black text-white">{conv.unreadCount}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1.5">
                        <span className="text-[16px] font-black text-ink truncate">{conv.otherName}</span>
                        <span className="text-[11px] font-bold text-earth/40 shrink-0 ml-2">
                          {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                        </span>
                      </div>
                      <p className="text-[14px] text-earth/60 truncate pr-6 line-clamp-1">
                        {conv.lastMessage || t({ mn: "Шинэ яриа эхлэх...", en: "Start a conversation..." })}
                      </p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )
          ) : (
            // MONKS TAB (Enhanced Cards)
            <motion.div key="monks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pt-2">
              {filteredMonks.map(monk => (
                <button key={monk._id}
                  onClick={() => startChatWithMonk(monk)}
                  className="w-full flex items-center gap-5 p-5 bg-white border border-stone/10 rounded-[2.5rem] text-left active:scale-[0.98] transition-all shadow-sm hover:shadow-gold/5">
                  <div className="w-16 h-16 rounded-3xl overflow-hidden shadow-card border-2 border-stone/5">
                    <Image src={monk.image || "/default-monk.jpg"} alt={monk.name.mn || ""}
                      width={64} height={64} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[16px] font-black text-ink">{monk.name[language as 'mn' | 'en'] || monk.name.mn}</p>
                      {monk.isSpecial && <div className="w-1.5 h-1.5 rounded-full bg-gold" />}
                    </div>
                    <p className="text-[11px] font-bold text-gold uppercase tracking-[0.15em] opacity-80 mb-1">{monk.title?.[language as 'mn' | 'en'] || monk.title?.mn}</p>
                    <div className="flex items-center gap-1.5">
                       <p className="text-[11px] font-black text-earth/30 uppercase tracking-widest">{t({ mn: "Яг одоо боломжтой", en: "Available now" })}</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-stone/10 flex items-center justify-center">
                    <Send size={18} className="text-gold" />
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  // --- COMPONENT: CHAT WINDOW (Premium Redesign) ---
  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="min-h-[100svh] bg-[#FDFBF7] flex flex-col">
      {/* Premium Chat Header */}
      <header className="px-5 bg-white/90 backdrop-blur-3xl border-b border-stone/10 flex items-center gap-4 sticky top-0 z-50 shadow-sm"
        style={{ paddingTop: "calc(12px + env(safe-area-inset-top, 44px))", paddingBottom: 16 }}>
        <button onClick={() => setSelectedConv(null)}
          className="w-12 h-12 rounded-full bg-stone/20 active:bg-stone/30 flex items-center justify-center shrink-0 transition-colors">
          <ArrowLeft size={24} className="text-ink" />
        </button>
        <LocalizedLink href={`/monks/${selectedConv.otherId}`} className="flex items-center gap-4 flex-1 min-w-0 active:opacity-70 transition-opacity">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-soft border-2 border-white">
               <Image src={selectedConv.otherImage || "/default-monk.jpg"} alt={selectedConv.otherName}
                width={48} height={48} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[17px] font-black text-ink truncate leading-tight">{selectedConv.otherName}</p>
            <p className="text-[11px] font-bold text-earth/50 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {t({ mn: "Онлайн", en: "Guide is present" })}
            </p>
          </div>
        </LocalizedLink>
      </header>

      {/* Messages Scroll Area */}
      <div 
        className="flex-1 overflow-y-auto px-6 pt-8 pb-32 space-y-8"
        onScroll={(e) => {
          // Could add logic for scroll-up-to-load-more here
        }}
      >
        <AnimatePresence mode="popLayout">
          {messagesLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => <div key={i} className={`h-14 skeleton rounded-[2rem] max-w-[70%] ${i % 2 === 0 ? "ml-auto" : ""}`} />)}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
              <div className="w-20 h-20 rounded-[3rem] bg-stone/20 flex items-center justify-center mb-8">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 3 }}>
                  <Sparkles size={34} className="text-gold/30" />
                </motion.div>
              </div>
              <p className="text-[12px] font-black text-earth/30 uppercase tracking-[0.25em] leading-[2.2] max-w-[220px]">
                {t({ mn: "Сэтгэлийн гүнээс ярилцаарай", en: "A Dialogue of Souls Begins" })}
              </p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, dateMsgs]) => (
              <div key={date} className="space-y-6">
                {/* Date Separator */}
                <div className="flex justify-center my-10">
                  <span className="px-4 py-1.5 bg-stone/20 rounded-full text-[10px] font-black text-earth/40 uppercase tracking-widest">
                    {date}
                  </span>
                </div>
                
                {dateMsgs.map((msg, idx) => {
                  const isMine = msg.senderId === user?._id || msg.senderId === user?.id;
                  const prevMsg = dateMsgs[idx - 1];
                  const nextMsg = dateMsgs[idx + 1];
                  
                  const isFirstInSequence = !prevMsg || prevMsg.senderId !== msg.senderId;
                  const isLastInSequence = !nextMsg || nextMsg.senderId !== msg.senderId;

                  return (
                    <motion.div 
                      key={msg._id} 
                      initial={{ opacity: 0, x: isMine ? 20 : -20, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${isMine ? "justify-end" : "justify-start"} ${isFirstInSequence ? "mt-4" : "mt-1"}`}
                    >
                      <div className={`
                        max-w-[82%] px-5 py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-[15px] leading-[1.6] relative
                        ${isMine
                          ? "bg-gradient-to-br from-gold to-[#D97706] text-white"
                          : "bg-white border border-stone/10 text-ink"}
                        ${isFirstInSequence && isLastInSequence ? "rounded-[2rem]" :""}
                        ${isFirstInSequence && !isLastInSequence ? (isMine ? "rounded-[2rem] rounded-br-[0.5rem]" : "rounded-[2rem] rounded-bl-[0.5rem]") : ""}
                        ${!isFirstInSequence && !isLastInSequence ? (isMine ? "rounded-[2rem] rounded-r-[0.5rem]" : "rounded-[2rem] rounded-l-[0.5rem]") : ""}
                        ${!isFirstInSequence && isLastInSequence ? (isMine ? "rounded-[2rem] rounded-tr-[0.5rem]" : "rounded-[2rem] rounded-tl-[0.5rem]") : ""}
                      `}>
                        {msg.text}
                        {isLastInSequence && (
                          <div className={`text-[9px] mt-2 font-bold uppercase tracking-widest opacity-60 ${isMine ? "text-right" : "text-left"}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} className="h-10" />
      </div>

      {/* PREMIUM FLOATING INPUT HUB */}
      <div 
        className="fixed left-0 right-0 px-6 z-40 transition-all duration-300"
        style={{ bottom: "calc(var(--tab-bar-height, 83px) + env(safe-area-inset-bottom, 0px) + 20px)" }}
      >
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/95 backdrop-blur-2xl border border-stone/20 shadow-[0_15px_40px_rgba(80,70,50,0.15)] rounded-[2.5rem] p-2 flex items-center gap-3"
        >
          <div className="w-11 h-11 rounded-full bg-stone/10 flex items-center justify-center shrink-0 active:scale-95 transition-transform">
             <User size={20} className="text-earth/40" />
          </div>
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSendMessage(e as any)}
            placeholder={t({ mn: "Асуулт асуух...", en: "Seek guidance..." })}
            className="flex-1 bg-transparent py-4 px-2 text-[15.5px] text-ink placeholder:text-earth/30 outline-none"
          />
          <button
            type="submit"
            onClick={(e) => handleSendMessage(e as any)}
            disabled={sending || !newMessage.trim()}
            className="w-12 h-12 rounded-full bg-gold flex items-center justify-center shrink-0 disabled:opacity-20 active:scale-90 transition-all shadow-gold"
          >
            {sending ? <Loader2 size={22} className="text-white animate-spin" /> : <Send size={22} className="text-white" />}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
