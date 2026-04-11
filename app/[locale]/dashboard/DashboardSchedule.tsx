import { Clock, Save, Calendar, Ban, Loader2 } from "lucide-react";

export default function DashboardSchedule({
    schedule,
    setSchedule,
    blockedSlots,
    setBlockedSlots,
    selectedBlockDate,
    setSelectedBlockDate,
    isSaving,
    saveScheduleSettings,
    TEXT,
    DAYS_EN,
    DAYS_MN,
    ALL_24_SLOTS,
    dailySlotsForBlocking,
    toggleWeeklySlot,
    toggleBlockWholeDay,
    toggleBlockSlot
}: any) {
    return (
        <div className="monastery-card p-10 bg-white/80 backdrop-blur-md">
            <div className="flex justify-between items-center mb-10 border-b border-border pb-6">
                <h2 className="text-display flex items-center gap-4"><Clock className="text-gold" /> {TEXT.availability}</h2>
                <button onClick={saveScheduleSettings} disabled={isSaving} className="cta-button h-12 px-6 shadow-gold group">
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} className="mr-2" />} 
                    <span className="text-xs uppercase tracking-widest">{TEXT.updateBtn}</span>
                </button>
            </div>

            {/* STEP 1: WEEKLY HOURS */}
            <div className="mb-14">
                <div className="mb-8 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-gold text-white flex items-center justify-center text-xs font-black shadow-gold">1</div>
                    <div>
                        <h3 className="text-h2 text-ink">{TEXT.step1}</h3>
                        <p className="text-label text-earth/50 lowercase mt-0.5">{TEXT.step1Desc}</p>
                    </div>
                </div>
                <div className="space-y-6">
                    {DAYS_EN.map((day: string, idx: number) => {
                        const config = schedule.find((s:any) => s.day === day) || { day, start: "00:00", end: "24:00", active: false, slots: [] };
                        return (
                            <div key={day} className={`p-6 rounded-[2rem] border transition-design ${config.active ? 'bg-stone/20 border-gold/10' : 'bg-transparent border-border opacity-40'}`}>
                                <div className="flex items-center gap-4 mb-5">
                                    <input
                                        type="checkbox"
                                        checked={config.active}
                                        onChange={(e) => {
                                            const newSchedule = [...schedule];
                                            const dayIdx = newSchedule.findIndex((s:any) => s.day === day);
                                            if (dayIdx > -1) {
                                                newSchedule[dayIdx].active = e.target.checked;
                                                if (e.target.checked && (!newSchedule[dayIdx].slots || newSchedule[dayIdx].slots?.length === 0)) {
                                                    newSchedule[dayIdx].slots = ALL_24_SLOTS;
                                                }
                                            } else {
                                                newSchedule.push({ day, start: "00:00", end: "24:00", active: e.target.checked, slots: ALL_24_SLOTS });
                                            }
                                            setSchedule(newSchedule);
                                        }}
                                        className="w-6 h-6 rounded-lg accent-gold cursor-pointer"
                                    />
                                    <span className="text-h2 text-ink">{DAYS_MN[idx]}</span>
                                </div>

                                {config.active && (
                                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                        {ALL_24_SLOTS.map((time: string) => {
                                            const isAvailable = config.slots?.includes(time);
                                            return (
                                                <button
                                                    key={time}
                                                    onClick={() => toggleWeeklySlot(day, time)}
                                                    className={`py-2 px-1 rounded-xl border font-black text-[10px] transition-design ${isAvailable
                                                        ? 'bg-gold border-gold text-white shadow-sm'
                                                        : 'bg-white border-border text-earth/40 line-through'
                                                        }`}
                                                >
                                                    {time}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* STEP 2: EXCEPTIONS */}
            <div>
                <div className="mb-8 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-gold text-white flex items-center justify-center text-xs font-black shadow-gold">2</div>
                    <div>
                        <h3 className="text-h2 text-ink">{TEXT.step2}</h3>
                        <p className="text-label text-earth/50 lowercase mt-0.5">{TEXT.step2Desc}</p>
                    </div>
                </div>
                <div className="bg-stone/30 rounded-[2.5rem] p-8 border border-border">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gold group-focus-within:scale-110 transition-transform" size={18} />
                            <input
                                type="date"
                                value={selectedBlockDate}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setSelectedBlockDate(e.target.value)}
                                className="pl-12 pr-6 py-3.5 rounded-2xl border border-border bg-white font-black text-xs outline-none focus:border-gold transition-design"
                            />
                        </div>
                        <button
                            onClick={toggleBlockWholeDay}
                            className={`px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-design border ${dailySlotsForBlocking.every((time:string) => blockedSlots.some((b:any) => b.date === selectedBlockDate && b.time === time))
                                ? 'bg-white border-gold text-gold hover:bg-gold/5'
                                : 'bg-gold border-gold text-white shadow-gold hover:brightness-110'
                                }`}
                        >
                            {dailySlotsForBlocking.every((time:string) => blockedSlots.some((b:any) => b.date === selectedBlockDate && b.time === time))
                                ? TEXT.unblockDay : TEXT.blockDay}
                        </button>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
                        {dailySlotsForBlocking.map((time:string) => {
                            const isBlocked = blockedSlots.some((b:any) => b.date === selectedBlockDate && b.time === time);
                            return (
                                <button
                                    key={time}
                                    onClick={() => toggleBlockSlot(time)}
                                    className={`py-2.5 px-1 rounded-xl border font-black text-[10px] transition-design ${isBlocked
                                        ? 'bg-red-50 border-red-200 text-red-600 shadow-sm'
                                        : 'bg-white border-border text-ink hover:border-gold/30'
                                        }`}
                                >
                                    <div className="flex items-center justify-between px-1">
                                        <span>{time}</span>
                                        {isBlocked && <Ban size={8} />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
