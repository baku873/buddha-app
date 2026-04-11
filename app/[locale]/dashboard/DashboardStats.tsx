import { TrendingUp, CheckCircle, ShieldCheck } from "lucide-react";

export default function DashboardStats({
    isSpecial,
    totalEarnings,
    acceptedCount,
    language,
    TEXT
}: {
    isSpecial: boolean;
    totalEarnings: number;
    acceptedCount: number;
    language: string;
    TEXT: any;
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="monastery-card p-8 flex items-center gap-6 bg-white group hover:border-gold/30 transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-gold/5 flex items-center justify-center text-gold group-hover:bg-gold/10 transition-colors">
                    <TrendingUp size={30} />
                </div>
                <div>
                    <p className="text-label text-earth/60 mb-2">{TEXT.earnings}</p>
                    <h3 className="text-price text-2xl text-ink font-black">{totalEarnings.toLocaleString()}₮</h3>
                </div>
            </div>
            <div className="monastery-card p-8 flex items-center gap-6 bg-white group hover:border-gold/30 transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-gold/5 flex items-center justify-center text-gold group-hover:bg-gold/10 transition-colors">
                    <CheckCircle size={30} />
                </div>
                <div>
                    <p className="text-label text-earth/60 mb-2">{TEXT.acceptedBookings}</p>
                    <h3 className="text-h2 text-2xl text-ink font-black">{acceptedCount}</h3>
                </div>
            </div>
            {!isSpecial && (
                <div className="monastery-card p-8 flex items-center gap-6 bg-white group hover:border-gold/30 transition-colors">
                    <div className="w-16 h-16 rounded-2xl bg-gold/5 flex items-center justify-center text-gold group-hover:bg-gold/10 transition-colors">
                        <ShieldCheck size={30} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">{language === 'mn' ? "Тусгай сан" : "Special Fund"}</p>
                        <h3 className="text-3xl font-serif font-bold text-[#451a03]">{(acceptedCount * 10000).toLocaleString()}₮</h3>
                    </div>
                </div>
            )}
        </div>
    );
}
