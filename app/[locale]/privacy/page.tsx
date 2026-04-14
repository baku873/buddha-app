"use client";

import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { Lock } from "lucide-react";

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#451a03] pt-32 pb-20 px-6 font-sans">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col items-center text-center space-y-6 mb-16">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Lock size={32} />
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-black">
            {t({ mn: "Нууцлал", en: "Full Privacy" })}
          </h1>
          <p className="text-xl text-[#78350F]/60">
            {t({ mn: "Таны мэдээлэл бүрэн хамгаалагдана.", en: "Your sessions are strictly confidential." })}
          </p>
        </div>
        <div className="space-y-8 text-lg text-[#78350F]/80 leading-relaxed bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-amber-900/10">
          <p>
            {t({
              mn: "Тибет аппликейшн нь хэрэглэгчийн мэдээллийн нууцлалыг чандлан хадгалах бөгөөд гуравдагч этгээдэд дамжуулахгүй болно. Бүх зан үйл болон үзмэрчтэй хийсэн уулзалт нь зөвхөн таны болон үзмэрчийн дунд үлдэнэ.",
              en: "The Tibetan application strictly maintains the privacy of user data and will not share it with third parties. All rituals and sessions with masters remain strictly between you and the guide."
            })}
          </p>
          <p>
            {t({
              mn: "Бид таны хувийн мэдээллийг зөвхөн үйлчилгээ үзүүлэх, аппликейшны хэвийн үйл ажиллагааг хангахад зориулан ашиглана.",
              en: "We use your personal data solely to provide the requested services and to ensure the proper functioning of the application."
            })}
          </p>
        </div>
      </div>
    </div>
  );
}



