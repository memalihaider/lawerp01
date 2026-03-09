"use client";

import { useState, useMemo } from "react";
import { Plus, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useCalendarEvents } from "@/lib/hooks";
import { createDocument, deleteDocument, serverTimestamp } from "@/lib/firebase-service";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const EVENT_COLORS: Record<string, string> = {
  hearing: "bg-danger/20 text-danger border-danger/30",
  meeting: "bg-primary/20 text-primary border-primary/30",
  deadline: "bg-warning/20 text-warning border-warning/30",
  deposition: "bg-info/20 text-info border-info/30",
  other: "bg-muted-light text-muted-dark border-border",
};

export default function CalendarPage() {
  const { data: events } = useCalendarEvents();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showNew, setShowNew] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", date: "", startTime: "09:00", endTime: "10:00", type: "meeting", description: "", location: "" });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [firstDay, daysInMonth]);

  function getEventsForDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e: Record<string, unknown>) => (e.date as string) === dateStr);
  }

  function prevMonth() { setCurrentDate(new Date(year, month - 1, 1)); }
  function nextMonth() { setCurrentDate(new Date(year, month + 1, 1)); }

  function openNew(day?: number) {
    const d = day ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : "";
    setForm({ title: "", date: d, startTime: "09:00", endTime: "10:00", type: "meeting", description: "", location: "" });
    setShowNew(true);
  }

  async function handleCreate() {
    if (!form.title || !form.date) { toast("error", "Title and date required"); return; }
    setSaving(true);
    try {
      await createDocument("calendarEvents", { ...form, createdAt: serverTimestamp() });
      toast("success", "Event created");
      setShowNew(false);
    } catch { toast("error", "Failed to create event"); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try { await deleteDocument("calendarEvents", deleteId); toast("success", "Event deleted"); } catch { toast("error", "Failed"); }
    setDeleteId(null);
  }

  const today = new Date();
  const isToday = (day: number) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Calendar</h1><p className="text-muted text-sm">Manage hearings, meetings, and deadlines</p></div>
        <button onClick={() => openNew()} className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"><Plus size={16} /> New Event</button>
      </div>

      {/* Month Navigation */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-muted-light transition-colors"><ChevronLeft size={20} /></button>
          <h2 className="text-lg font-semibold text-foreground">{MONTHS[month]} {year}</h2>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-muted-light transition-colors"><ChevronRight size={20} /></button>
        </div>

        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          {DAYS.map((d) => (
            <div key={d} className="bg-muted-light/50 px-2 py-2 text-center text-xs font-medium text-muted">{d}</div>
          ))}
          {calendarDays.map((day, idx) => (
            <div key={idx} className={`bg-white min-h-[80px] p-1 ${day ? "cursor-pointer hover:bg-primary/5" : ""}`} onClick={() => day && openNew(day)}>
              {day && (
                <>
                  <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday(day) ? "bg-primary text-white" : "text-foreground"}`}>{day}</div>
                  <div className="space-y-0.5">
                    {getEventsForDay(day).slice(0, 2).map((e: Record<string, unknown>) => (
                      <div key={e.id as string} className={`text-[10px] px-1 py-0.5 rounded border truncate ${EVENT_COLORS[e.type as string] || EVENT_COLORS.other}`} onClick={(ev) => { ev.stopPropagation(); setSelectedDate(`${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`); }}>
                        {e.title as string}
                      </div>
                    ))}
                    {getEventsForDay(day).length > 2 && <div className="text-[10px] text-muted">+{getEventsForDay(day).length - 2} more</div>}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-semibold text-foreground mb-3">Upcoming Events</h3>
        <div className="space-y-2">
          {events.slice(0, 8).map((e: Record<string, unknown>) => (
            <div key={e.id as string} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted-light/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${e.type === "hearing" ? "bg-danger" : e.type === "deadline" ? "bg-warning" : "bg-primary"}`} />
                <div>
                  <div className="text-sm font-medium text-foreground">{e.title as string}</div>
                  <div className="text-xs text-muted">{e.date as string} · {e.startTime as string} - {e.endTime as string}</div>
                </div>
              </div>
              <button onClick={() => setDeleteId(e.id as string)} className="text-xs text-muted hover:text-danger transition-colors">Delete</button>
            </div>
          ))}
          {events.length === 0 && <p className="text-sm text-muted text-center py-4">No events scheduled</p>}
        </div>
      </div>

      {/* New Event Modal */}
      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title="New Event" size="md">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-foreground mb-1">Title *</label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-sm font-medium text-foreground mb-1">Date *</label>
              <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Start</label>
              <input type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">End</label>
              <input type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-foreground mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none">
                <option value="meeting">Meeting</option><option value="hearing">Hearing</option><option value="deadline">Deadline</option><option value="deposition">Deposition</option><option value="other">Other</option>
              </select></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Location</label>
              <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
          </div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none resize-none" /></div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm rounded-lg border border-border text-muted hover:bg-muted-light transition-colors">Cancel</button>
          <button onClick={handleCreate} disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary-light transition-colors disabled:opacity-50">{saving ? "Saving..." : "Create Event"}</button>
        </div>
      </Modal>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Event" message="Delete this calendar event?" confirmLabel="Delete" variant="danger" />
    </div>
  );
}
