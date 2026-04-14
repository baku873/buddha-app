import React from "react";

import { FileText } from "lucide-react";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'mn' ? 'Үйлчилгээний нөхцөл | Gevabal' : 'Terms of Service | Gevabal',
  };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  const validLang = locale === 'en' ? 'en' : 'mn';
  
  const t = (obj: { mn: string; en: string }) => obj[validLang];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#451a03] pt-32 pb-20 px-6 font-sans">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col items-center text-center space-y-6 mb-16">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
            <FileText size={32} />
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-black">
            {t({ mn: "Үйлчилгээний нөхцөл", en: "Terms of Service" })}
          </h1>
          <p className="text-xl text-[#78350F]/60">
            {t({ mn: "Бидний үйлчилгээг ашиглах нөхцөл ба дүрэм.", en: "Rules and terms for using our services." })}
          </p>
        </div>
        
        <div className="space-y-8 text-lg text-[#78350F]/80 leading-relaxed bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-amber-900/10">
          
          <section>
            <h2 className="text-2xl font-bold text-[#1C1917] mb-4">
              {t({ mn: "1. Танилцуулга", en: "1. Introduction" })}
            </h2>
            <p>
              {t({ 
                mn: "Gevabal аппликейшн нь уламжлалт шашин, зан үйлийн зөвлөгөө болон үйлчилгээг орчин үеийн технологиор дамжуулан хүргэнэ.", 
                en: "The Gevabal application provides traditional religious and ritual consultation services through modern technology." 
              })}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1C1917] mb-4">
              {t({ mn: "2. Насны хязгаарлалт", en: "2. Eligibility" })}
            </h2>
            <p>
              {t({ 
                mn: "Үйлчилгээг ашиглах, захиалга өгөхөд хэрэглэгч нь 18 ба түүнээс дээш насны байх шаардлагатай.", 
                en: "Users must be 18 years of age or older to use the service and book sessions." 
              })}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1C1917] mb-4">
              {t({ mn: "3. Үйлчилгээний чиглэл", en: "3. Services" })}
            </h2>
            <p>
              {t({ 
                mn: "Gevabal нь хэрэглэгчдийг мэргэжлийн лам, үзмэрчтэй цаг товлож уулзах, сүнслэг зөвлөгөө авах боломжоор хангана.", 
                en: "Gevabal provides users with the ability to book appointments and receive spiritual consultation with professional monks and practitioners." 
              })}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1C1917] mb-4">
              {t({ mn: "4. Төлбөр хэвийн болон буцаалт", en: "4. Payments & Refunds" })}
            </h2>
            <p>
              {t({ 
                mn: "Төлбөрийг QPay системээр хүлээн авна. Захиалсан цагаас доод тал нь 24 цагийн өмнө цуцалсан тохиолдолд төлбөрийг 100% буцааж олгоно.", 
                en: "Payments are processed via the QPay system. Sessions cancelled at least 24 hours before the scheduled time are eligible for a 100% refund." 
              })}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1C1917] mb-4">
              {t({ mn: "5. Хэрэглэгчийн ёс зүй", en: "5. User Conduct" })}
            </h2>
            <p>
              {t({ 
                mn: "Багш нарыг доромжлох, зүй бус үг хэллэг ашиглах, уулзалтыг нууцаар бичиж авахыг хатуу хориглоно.", 
                en: "Harassment of masters, use of inappropriate language, and recording sessions without permission are strictly prohibited." 
              })}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1C1917] mb-4">
              {t({ mn: "6. Оюуны өмч", en: "6. Intellectual Property" })}
            </h2>
            <p>
              {t({ 
                mn: "Аппликейшнд орсон бүх агуулга, мэдээлэл болон багш нарын зөвлөгөө нь Gevabal-ийн өмч байна.", 
                en: "All content, information, and consultations provided within the application are the intellectual property of Gevabal and the respective masters." 
              })}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1C1917] mb-4">
              {t({ mn: "7. Данс цуцлах", en: "7. Termination" })}
            </h2>
            <p>
              {t({ 
                mn: "Хэрэв хэрэглэгч үйлчилгээний нөхцөлийг зөрчвөл Gevabal нь хэрэглэгчийн дансыг түдгэлзүүлэх эсвэл хаах эрхтэй.", 
                en: "Gevabal reserves the right to suspend or terminate a user's account if they violate these terms of service." 
              })}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1C1917] mb-4">
              {t({ mn: "8. Хууль, дүрэм", en: "8. Governing Law" })}
            </h2>
            <p>
              {t({ 
                mn: "Энэхүү үйлчилгээний нөхцөлийг Монгол Улсын хууль тогтоомжийн дагуу зохицуулна.", 
                en: "These terms of service shall be governed by and construed in accordance with the laws of Mongolia." 
              })}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1C1917] mb-4">
              {t({ mn: "9. Холбоо барих", en: "9. Contact" })}
            </h2>
            <p>
              {t({ 
                mn: "Санал хүсэлт, асуулт байвал support@gevabal.mn хаягаар холбогдоно уу.", 
                en: "For any questions or feedback, please contact us at support@gevabal.mn." 
              })}
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}


// CAP_INJECT_PARAMS
export function generateStaticParams() { return [{ locale: "mn" }, { locale: "en" }]; }
