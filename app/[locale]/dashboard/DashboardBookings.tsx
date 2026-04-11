import { History, MessageCircle, Loader2, Video } from "lucide-react";

export default function DashboardBookings({
    activeBookingTab,
    setActiveBookingTab,
    upcomingBookings,
    historyBookings,
    isMonk,
    router,
    language,
    langKey,
    TEXT,
    checkRitualAvailability,
    joiningRoomId,
    allMonks,
    setActiveChatBooking,
    setChatClientInfo,
    setActiveBookingForRoom,
    joinVideoCall
}: any) {
    return (
        <div className="monastery-card p-10 bg-white/90 backdrop-blur-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 border-b border-border pb-6">
                <h2 className="text-display flex items-center gap-4">
                    <History className="text-gold" /> {isMonk ? TEXT.ritualsClient : TEXT.ritualsMy}
                </h2>
                <div className="flex bg-stone/30 p-1.5 rounded-2xl border border-border/50">
                    <button
                        onClick={() => setActiveBookingTab('upcoming')}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-design ${activeBookingTab === 'upcoming' ? 'bg-gold text-white shadow-gold' : 'text-earth/60 hover:text-earth'}`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setActiveBookingTab('history')}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-design ${activeBookingTab === 'history' ? 'bg-gold text-white shadow-gold' : 'text-earth/60 hover:text-earth'}`}
                    >
                        History
                    </button>
                </div>
            </div>

            <div className="space-y-5">
                {activeBookingTab === 'upcoming' ? (
                    upcomingBookings.length > 0 ? upcomingBookings.map((b: any) => {
                        const availability = checkRitualAvailability(b);
                        const isJoiningThis = joiningRoomId === b._id;

                        return (
                            <div key={b._id} className="p-6 rounded-[2rem] border border-border flex flex-col lg:flex-row lg:justify-between lg:items-center bg-stone/10 gap-6 transition-design hover:bg-stone/20 hover:border-gold/20 group">
                                <div
                                    className={`flex-1 ${!isMonk ? "cursor-pointer" : ""}`}
                                    onClick={() => {
                                        if (!isMonk) {
                                            router.push(`/${language}/monks/${b.monkId}`);
                                        }
                                    }}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-label text-gold">{b.serviceName?.en || "Service"}</span>
                                        <div className="h-1 w-1 rounded-full bg-border" />
                                        <span className="text-[10px] font-black text-earth/40 uppercase tracking-widest">{b.date} • {b.time}</span>
                                    </div>
                                    <h4 className={`text-h2 text-ink ${!isMonk ? "group-hover:text-gold transition-colors" : ""}`}>
                                        {isMonk ? b.clientName : (allMonks.find((m:any) => m._id === b.monkId)?.name?.[langKey] || "Monk")}
                                    </h4>
                                </div>
                                <div className="flex flex-wrap lg:flex-nowrap items-center gap-3">
                                    {b.status === 'confirmed' ? (
                                        <>
                                            <button
                                                onClick={async () => {
                                                    setActiveChatBooking(b);
                                                    if (isMonk && b.clientId) {
                                                        try {
                                                            const res = await fetch(`/api/users/${b.clientId}`);
                                                            if (res.ok) {
                                                                const userData = await res.json();
                                                                setChatClientInfo(userData);
                                                            }
                                                        } catch (e) {
                                                            console.error("Failed to fetch client info", e);
                                                        }
                                                    }
                                                }}
                                                className="flex-1 lg:flex-none px-6 py-3 bg-white text-ink border border-border rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-stone/20 transition-design"
                                            >
                                                <MessageCircle size={16} className="text-gold" /> {TEXT.chat}
                                            </button>

                                            {isMonk && (
                                                <button
                                                    onClick={async () => {
                                                        if (!confirm("Mark this ritual as completed? This will move it to history.")) return;
                                                        try {
                                                            const res = await fetch(`/api/bookings/${b._id}`, {
                                                                method: 'PATCH',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ status: 'completed', isManual: false })
                                                            });
                                                            if (res.ok) window.location.reload();
                                                        } catch (e) { console.error(e); }
                                                    }}
                                                    className="flex-1 lg:flex-none px-6 py-3 bg-ink text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-125 transition-design"
                                                >
                                                    Complete
                                                </button>
                                            )}
                                            {b.callStatus === 'active' ? (
                                                <button
                                                    onClick={() => {
                                                        setActiveBookingForRoom(b);
                                                        joinVideoCall(b);
                                                    }}
                                                    disabled={isJoiningThis}
                                                    className="flex-1 lg:flex-none px-6 py-3 bg-gold text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-gold/20 hover:brightness-110 transition-design disabled:opacity-70"
                                                >
                                                    {isJoiningThis ? <Loader2 className="animate-spin" size={16} /> : <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />}
                                                    <Video size={16} /> Join Video
                                                </button>
                                            ) : availability.isOpen ? (
                                                <button
                                                    onClick={() => {
                                                        setActiveBookingForRoom(b);
                                                        joinVideoCall(b);
                                                    }}
                                                    disabled={isJoiningThis}
                                                    className="flex-1 lg:flex-none px-6 py-3 bg-gold text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-gold hover:brightness-110 transition-design disabled:opacity-70"
                                                >
                                                    {isJoiningThis ? <Loader2 className="animate-spin" size={16} /> : <Video size={16} />}
                                                    {TEXT.enterRoom}
                                                </button>
                                            ) : (
                                                <div className="flex-1 lg:flex-none px-4 py-2 rounded-full border border-border bg-stone/10">
                                                    <span className="text-[9px] font-black uppercase text-earth/50">
                                                        {availability.message}
                                                    </span>
                                                </div>
                                            )}
                                        </>
                                    ) : <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${b.status === 'pending' ? 'bg-gold/5 text-gold border-gold/10' : 'bg-stone/10 text-earth border-border'}`}>
                                        {b.status === 'pending' ? TEXT.pending : b.status}
                                    </span>}
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="text-center py-20 border-2 border-dashed border-border rounded-[2.5rem] opacity-40">
                            <p className="text-h2 font-serif italic text-earth">No scheduled rituals found.</p>
                        </div>
                    )
                ) : (
                    historyBookings.length > 0 ? historyBookings.map((b: any) => (
                        <div key={b._id} className="p-6 rounded-[2rem] border border-border flex flex-col lg:flex-row lg:justify-between lg:items-center bg-stone/5 gap-6 opacity-60 hover:opacity-100 transition-design">
                            <div
                                className={`flex-1 ${!isMonk ? "cursor-pointer" : ""}`}
                                onClick={() => {
                                    if (!isMonk) {
                                        router.push(`/${language}/monks/${b.monkId}`);
                                    }
                                }}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-label text-earth/40">{b.serviceName?.en || "Service"}</span>
                                    <div className="h-1 w-1 rounded-full bg-border" />
                                    <span className="text-[10px] font-black text-earth/20 uppercase tracking-widest">{b.date} • {b.time}</span>
                                </div>
                                <h4 className="text-h2 text-ink line-through opacity-50">
                                    {isMonk ? b.clientName : (allMonks.find((m:any) => m._id === b.monkId)?.name?.[langKey] || "Monk")}
                                </h4>
                            </div>
                            <div className="flex items-center gap-3">
                                {isMonk && b.status === 'completed' && (
                                    <button
                                        onClick={async () => {
                                            if (!confirm("Re-open this session for further talk?")) return;
                                            try {
                                                const res = await fetch(`/api/bookings/${b._id}`, {
                                                    method: 'PATCH',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ status: 'confirmed', isManual: true })
                                                });
                                                if (res.ok) window.location.reload();
                                            } catch (e) { console.error(e); }
                                        }}
                                        className="px-6 py-2.5 bg-gold/10 text-gold rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gold hover:text-white transition-design"
                                    >
                                        Re-open Session
                                    </button>
                                )}
                                <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${b.status === 'completed' ? 'bg-success/5 text-success border-success/10' :
                                    b.status === 'rejected' ? 'bg-error/5 text-error border-error/10' :
                                        'bg-stone/10 text-earth border-border'
                                    }`}>
                                    {b.status}
                                </span>
                            </div>
                        </div>
                    )) : <p className="text-stone-400 italic text-center py-6">No history yet.</p>
                )}
            </div>
        </div>
    );
}
