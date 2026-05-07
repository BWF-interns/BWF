"use client";
import { useEffect, useState } from "react";
import { adminAPI } from "../lib/api";

interface CalEvent {
  _id: string; title: string; date: string; type: string;
  description?: string; home?: string; color: string; isRecurring?: boolean;
}

const TYPE_LABELS: Record<string, { label: string; dot: string }> = {
  birthday: { label: "Birthday",    dot: "bg-pink-400" },
  holiday:  { label: "Holiday",     dot: "bg-orange-400" },
  ngo:      { label: "NGO/Global",  dot: "bg-cyan-500" },
  custom:   { label: "Custom",      dot: "bg-[#8c6d4f]" },
  academic: { label: "Academic",    dot: "bg-indigo-400" },
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function CalendarPage() {
  const [events, setEvents]       = useState<CalEvent[]>([]);
  const [today]                   = useState(new Date());
  const [viewDate, setViewDate]   = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showAdd, setShowAdd]     = useState(false);
  const [form, setForm]           = useState({ title:"", date:"", type:"custom", description:"", home:"", color:"#8c6d4f" });
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState("");

  const load = () => {
    adminAPI.getCalendarEvents({ month: String(viewDate.getMonth()+1), year: String(viewDate.getFullYear()) })
      .then(d => setEvents(d as CalEvent[]))
      .catch(() => {});
  };

  useEffect(() => { load(); setSelectedDay(null); }, [viewDate]);

  const daysInMonth  = new Date(viewDate.getFullYear(), viewDate.getMonth()+1, 0).getDate();
  const firstWeekday = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  const eventsForDay = (day: number) => {
    return events.filter(e => {
      const d = new Date(e.date);
      return d.getDate() === day && d.getMonth() === viewDate.getMonth() && d.getFullYear() === viewDate.getFullYear();
    });
  };

  const selectedEvents = selectedDay ? eventsForDay(selectedDay) : [];

  const addEvent = async () => {
    if (!form.title || !form.date) return;
    setSaving(true);
    try {
      await adminAPI.addCalendarEvent(form);
      setMsg("Event added!"); setShowAdd(false);
      setForm({ title:"", date:"", type:"custom", description:"", home:"", color:"#8c6d4f" });
      load();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const deleteEvent = async (id: string) => {
    if (id.startsWith("bday-") || id.startsWith("holiday-")) return;
    if (!confirm("Delete this event?")) return;
    try { await adminAPI.deleteCalendarEvent(id); load(); } catch { /* ignore */ }
  };

  const prevMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth()-1, 1));
  const nextMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth()+1, 1));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2f2a24]">Calendar</h1>
          <p className="text-sm text-[#8c6d4f]">Birthdays, Indian holidays, NGO events, and custom dates.</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="rounded-lg bg-[#8c6d4f] px-4 py-2 text-sm font-medium text-white hover:bg-[#795a3e] transition">
          + Add Event
        </button>
      </header>

      {msg && <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm text-emerald-700">{msg}</div>}

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(TYPE_LABELS).map(([k, v]) => (
          <span key={k} className="flex items-center gap-1.5 text-xs text-[#6e5034]">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${v.dot}`} />
            {v.label}
          </span>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 rounded-xl border border-[#efe3d5] bg-white shadow-sm overflow-hidden">
          {/* Nav */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#efe3d5]">
            <button onClick={prevMonth} className="rounded-lg p-2 hover:bg-[#f5ece1] transition text-[#8c6d4f]">◀</button>
            <h2 className="text-base font-semibold text-[#2f2a24]">{MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}</h2>
            <button onClick={nextMonth} className="rounded-lg p-2 hover:bg-[#f5ece1] transition text-[#8c6d4f]">▶</button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-[#efe3d5]">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
              <div key={d} className="py-2 text-center text-xs font-medium text-[#8c6d4f]">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstWeekday }, (_, i) => (
              <div key={`empty-${i}`} className="border-b border-r border-[#efe3d5] min-h-[72px]" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dayEvents = eventsForDay(day);
              const isToday = day === today.getDate() && viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear();
              const isSelected = day === selectedDay;
              return (
                <div key={day} onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  className={`border-b border-r border-[#efe3d5] min-h-[72px] p-1.5 cursor-pointer transition ${isSelected ? "bg-[#f8efe5]" : "hover:bg-[#fdfaf6]"}`}>
                  <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? "bg-[#8c6d4f] text-white" : "text-[#2f2a24]"}`}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0,2).map((e, j) => (
                      <div key={j} className="rounded px-1 py-0.5 text-[10px] leading-tight truncate"
                        style={{ background: `${e.color}22`, color: e.color }}>
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[10px] text-[#8c6d4f] pl-1">+{dayEvents.length-2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side Panel */}
        <div className="rounded-xl border border-[#efe3d5] bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-[#2f2a24] mb-4">
            {selectedDay
              ? `Events — ${selectedDay} ${MONTHS[viewDate.getMonth()]}`
              : "Click a day to see events"}
          </h3>
          {selectedDay && selectedEvents.length === 0 && (
            <p className="text-sm text-[#8c6d4f]">No events on this day.</p>
          )}
          <div className="space-y-3">
            {selectedEvents.map((e, i) => (
              <div key={i} className="rounded-lg border p-3 space-y-1" style={{ borderColor: `${e.color}44` }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full" style={{ background: e.color }} />
                      <p className="text-sm font-medium text-[#2f2a24]">{e.title}</p>
                    </div>
                    <p className="text-xs text-[#8c6d4f] mt-0.5 capitalize">{TYPE_LABELS[e.type]?.label ?? e.type} {e.home ? `· ${e.home}` : ""}</p>
                  </div>
                  {e.type === "custom" && !e._id.startsWith("holiday-") && (
                    <button onClick={() => deleteEvent(e._id)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                  )}
                </div>
                {e.description && <p className="text-xs text-[#6e5034]">{e.description}</p>}
              </div>
            ))}
          </div>

          {/* Upcoming events */}
          <div className="mt-6">
            <h4 className="text-xs font-semibold text-[#8c6d4f] uppercase tracking-wide mb-3">Upcoming This Month</h4>
            <div className="space-y-2">
              {events.slice(0,6).map((e, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-[#8c6d4f] w-4">{new Date(e.date).getDate()}</span>
                  <span className="inline-block h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: e.color }} />
                  <span className="truncate text-[#2f2a24]">{e.title}</span>
                </div>
              ))}
              {events.length === 0 && <p className="text-xs text-[#8c6d4f]">No events this month.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex justify-between">
              <h2 className="text-lg font-bold text-[#2f2a24]">Add Calendar Event</h2>
              <button onClick={() => setShowAdd(false)}>✕</button>
            </div>
            {[
              { label:"Event Title *", key:"title", type:"text" },
              { label:"Date *",        key:"date",  type:"date" },
              { label:"Description",   key:"description", type:"text" },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-[#6e5034] mb-1">{f.label}</label>
                <input type={f.type} value={(form as Record<string,string>)[f.key]}
                  onChange={e => setForm({...form, [f.key]: e.target.value})}
                  className="w-full rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none" />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#6e5034] mb-1">Type</label>
                <select value={form.type} onChange={e => setForm({...form, type:e.target.value})}
                  className="w-full rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none">
                  <option value="custom">Custom</option>
                  <option value="academic">Academic</option>
                  <option value="ngo">NGO Event</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6e5034] mb-1">Home (optional)</label>
                <select value={form.home} onChange={e => setForm({...form, home:e.target.value})}
                  className="w-full rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none">
                  <option value="">All Homes</option>
                  {["Jammu","Anantnag","Kupwara","Beerwah"].map(h => <option key={h}>{h}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-[#6e5034]">Color</label>
              <input type="color" value={form.color} onChange={e => setForm({...form, color:e.target.value})}
                className="h-8 w-12 rounded cursor-pointer border border-[#dfd1c2]" />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAdd(false)} className="rounded-lg border border-[#dfd1c2] px-4 py-2 text-sm hover:bg-[#f5ece1]">Cancel</button>
              <button onClick={addEvent} disabled={saving}
                className="rounded-lg bg-[#8c6d4f] px-4 py-2 text-sm font-medium text-white hover:bg-[#795a3e] disabled:opacity-50">
                {saving ? "Saving..." : "Add Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
