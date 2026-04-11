import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-gold animate-spin mb-4" />
            <p className="text-earth/60 font-black text-sm uppercase tracking-widest animate-pulse">
                Loading Dashboard...
            </p>
        </div>
    );
}
