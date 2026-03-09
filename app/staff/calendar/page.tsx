"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useCalendarEvents } from "@/lib/hooks";
import { createDocument, updateDocument, deleteDocument, serverTimestamp } from "@/lib/firebase-service";
import { useToast } from "@/components/ui/Toast";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

export default function StaffCalendarPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: events, loading } = useCalendarEvents();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", date: "", startTime: "09:00", endTime: "10:00", type: "meeting", location: "", description: "" });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = new Date().toISOString().split("T")[0];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  function prevMonth() { setCurrentDate(new Date(year, month - 1, 1)); }
  function nextMonth() { setCurrentDate(new Date(year, month + 1, 1)); }

  function getEventsForDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e: any) => e.date === dateStr);
  }

  const typeColors: Record<string, string> = { hearing: "bg-red-500", meeting: "bg-blue-500", deadline: "bg-orange-500", deposition: "bg-green-500" };

  async function handleSave() {
    if (!form.title || !form.date) { toast("error", "Title and date required"); return; }
    try {
      if (editId) {
        await updateDocument("calendarEvents", editId, { ...form });
        toast("success", "Event updated");
      } else {
        await createDocument("calendarEvents", { ...form, createdBy: profile?.uid, createdAt: serverTimestamp() });
        toast("success", "Event created");
      }
      setShowModal(false);
      setEditId(null);
      setForm({ title: "", date: "", startTime: "09:00", endTime: "10:00", type: "meeting", location: "", description: "" });
    } catch { toast("error", "Failed to create event"); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try { await deleteDocument("calendarEvents", deleteId); toast("success", "Event deleted"); } catch { toast("error", "Failed"); }
    setDeleteId(null);
  }

  const upcomingEvents = events.filter((e: any) => e.date >= todayStr).sort((a: any, b: any) => a.date.localeCompare(b.date)).slice(0, 6);
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Calendar</h1><p className="text-muted text-sm">Your schedule</p></div>
        <button onClick={() => { setForm((f) => ({ ...f, date: todayStr })); setShowModal(true); }} className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg text-sm font-medium"><Plus size={16} /> New Event</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1 hover:bg-muted-light rounded"><ChevronLeft size={20} /></button>
            <h2 className="text-lg font-semibold text-foreground">{monthNames[month]} {year}</h2>
            <button onClick={nextMonth} className="p-1 hover:bg-muted-light rounded"><ChevronRight size={20} /></button>
          </div>
          <div className="grid grid-cols-7 gap-px text-center text-xs font-semibold text-muted mb-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="py-2">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-px">
            {days.map((day, i) => {
              if (!day) return <div key={`e${i}`} className="min-h-[70px]" />;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isToday = dateStr === todayStr;
              const dayEvents = getEventsForDay(day);
              return (
                <div key={day} className={`min-h-[70px] p-1 border border-border/30 rounded ${isToday ? "bg-primary/5 border-primary/30" : ""}`}>
                  <div className={`text-xs font-medium mb-0.5 ${isToday ? "text-primary font-bold" : "text-foreground"}`}>{day}</div>
                  {dayEvents.slice(0, 2).map((e: any) => (
                    <div key={e.id} onClick={() => { setEditId(e.id); setForm({ title: e.title, date: e.date, startTime: e.startTime || "09:00", endTime: e.endTime || "10:00", type: e.type || "meeting", location: e.location || "", description: e.description || "" }); setShowModal(true); }} className={`text-[10px] text-white px-1 py-0.5 rounded mb-0.5 truncate cursor-pointer ${typeColors[e.type] || "bg-gray-500"}`}>{e.title}</div>
                  ))}
                  {dayEvents.length > 2 && <div className="text-[10px] text-muted">+{dayEvents.length - 2}</div>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-3">Upcoming Events</h3>
          {upcomingEvents.length === 0 ? <p className="text-muted text-sm">No upcoming events.</p> : (
            <div className="space-y-3">
              {upcomingEvents.map((e: any) => (
                <div key={e.id} className="flex items-start gap-2 p-2 rounded-lg bg-muted-light/50">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${typeColors[e.type] || "bg-gray-500"}`} />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{e.title}</div>
                    <div className="text-xs text-muted">{e.date} · {e.startTime}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditId(null); setForm({ title: "", date: "", startTime: "09:00", endTime: "10:00", type: "meeting", location: "", description: "" }); }} title={editId ? "Edit Event" : "New Event"}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Title</label><input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Date</label><input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
            <div><label className="block text-sm font-medium mb-1">Type</label><select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none"><option value="meeting">Meeting</option><option value="hearing">Hearing</option><option value="deadline">Deadline</option><option value="deposition">Deposition</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Start</label><input type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
            <div><label className="block text-sm font-medium mb-1">End</label><input type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Location</label><input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-light">{editId ? "Update" : "Create"}</button>
            {editId && <button onClick={() => { setShowModal(false); setDeleteId(editId); setEditId(null); }} className="px-4 py-2 bg-danger/10 text-danger rounded-lg text-sm font-medium hover:bg-danger/20">Delete</button>}
            <button onClick={() => { setShowModal(false); setEditId(null); setForm({ title: "", date: "", startTime: "09:00", endTime: "10:00", type: "meeting", location: "", description: "" }); }} className="px-4 py-2 border border-border rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      </Modal>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Event" message="Remove this event?" variant="danger" />
    </div>
  );
}
