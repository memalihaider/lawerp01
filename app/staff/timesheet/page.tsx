"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useRealtimeCollection } from "@/lib/hooks";
import { createDocument, updateDocument, deleteDocument, serverTimestamp, where } from "@/lib/firebase-service";
import { useToast } from "@/components/ui/Toast";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { Plus, Play, Square, Clock, Trash2, Edit2 } from "lucide-react";

export default function StaffTimesheetPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const userId = profile?.uid || "";
  const { data: entries, loading } = useRealtimeCollection("timeEntries", userId ? [where("userId", "==", userId)] : undefined);
  const { data: matters } = useRealtimeCollection("matters");

  const [showModal, setShowModal] = useState(false);
  const [editEntry, setEditEntry] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ matterId: "", description: "", hours: "", date: new Date().toISOString().split("T")[0], billable: true });

  // Timer
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerMatter, setTimerMatter] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    } else if (intervalRef.current) clearInterval(intervalRef.current);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerRunning]);

  function startTimer() { if (!timerMatter) { toast("error", "Select a matter first"); return; } setTimerRunning(true); setTimerSeconds(0); }
  async function stopTimer() {
    setTimerRunning(false);
    const hours = Math.round((timerSeconds / 3600) * 10) / 10;
    if (hours < 0.1) { toast("info", "Time too short to record"); return; }
    try {
      await createDocument("timeEntries", { userId, matterId: timerMatter, description: "Timer entry", hours, date: new Date().toISOString().split("T")[0], billable: true, createdAt: serverTimestamp() });
      toast("success", `${hours}h recorded`);
      setTimerSeconds(0);
    } catch { toast("error", "Failed to save"); }
  }

  function formatTimer(s: number) { const m = Math.floor(s / 60); const h = Math.floor(m / 60); return `${String(h).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; }

  function openAdd() { setEditEntry(null); setForm({ matterId: "", description: "", hours: "", date: new Date().toISOString().split("T")[0], billable: true }); setShowModal(true); }
  function openEdit(e: any) { setEditEntry(e); setForm({ matterId: e.matterId || "", description: e.description || "", hours: String(e.hours || ""), date: e.date || "", billable: e.billable !== false }); setShowModal(true); }

  async function handleSave() {
    if (!form.hours || !form.date) { toast("error", "Hours and date required"); return; }
    try {
      const data = { ...form, hours: parseFloat(form.hours), userId, updatedAt: serverTimestamp() };
      if (editEntry) { await updateDocument("timeEntries", editEntry.id, data); toast("success", "Entry updated"); }
      else { await createDocument("timeEntries", { ...data, createdAt: serverTimestamp() }); toast("success", "Entry added"); }
      setShowModal(false);
    } catch { toast("error", "Failed to save"); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try { await deleteDocument("timeEntries", deleteId); toast("success", "Entry deleted"); } catch { toast("error", "Failed to delete"); }
    setDeleteId(null);
  }

  const getMatterTitle = (id: string) => { const m = matters.find((m) => m.id === id) as Record<string, any> | undefined; return m?.title || id || "—"; };

  const totalHours = entries.reduce((s: number, e: any) => s + (e.hours || 0), 0);
  const billableHours = entries.filter((e: any) => e.billable !== false).reduce((s: number, e: any) => s + (e.hours || 0), 0);

  const sorted = [...entries].sort((a: any, b: any) => (b.date || "").localeCompare(a.date || ""));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Timesheet</h1><p className="text-muted text-sm">Track your time entries</p></div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"><Plus size={16} /> Add Entry</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-border p-4 text-center"><div className="text-2xl font-bold text-foreground">{totalHours.toFixed(1)}</div><div className="text-xs text-muted">Total Hours</div></div>
        <div className="bg-white rounded-xl border border-border p-4 text-center"><div className="text-2xl font-bold text-green-600">{billableHours.toFixed(1)}</div><div className="text-xs text-muted">Billable Hours</div></div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <select value={timerMatter} onChange={(e) => setTimerMatter(e.target.value)} className="flex-1 text-xs px-2 py-1 rounded border border-border outline-none">
              <option value="">Select matter...</option>
              {matters.map((m: any) => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xl font-bold text-foreground">{formatTimer(timerSeconds)}</span>
            {timerRunning ? <button onClick={stopTimer} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"><Square size={16} /></button>
              : <button onClick={startTimer} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"><Play size={16} /></button>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-muted-light/50 border-b border-border"><th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Date</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Matter</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Description</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Hours</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Billable</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Actions</th></tr></thead>
          <tbody className="divide-y divide-border">
            {sorted.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-muted text-sm">No time entries yet.</td></tr> :
              sorted.map((e: any) => (
                <tr key={e.id} className="hover:bg-muted-light/30">
                  <td className="px-4 py-3 text-sm text-muted">{e.date}</td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{getMatterTitle(e.matterId)}</td>
                  <td className="px-4 py-3 text-sm text-muted max-w-xs truncate">{e.description || "—"}</td>
                  <td className="px-4 py-3 text-sm font-medium">{e.hours?.toFixed(1)}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${e.billable !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{e.billable !== false ? "Yes" : "No"}</span></td>
                  <td className="px-4 py-3 flex gap-1">
                    <button onClick={() => openEdit(e)} className="p-1.5 text-muted hover:text-primary rounded"><Edit2 size={14} /></button>
                    <button onClick={() => setDeleteId(e.id)} className="p-1.5 text-muted hover:text-red-600 rounded"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editEntry ? "Edit Entry" : "New Time Entry"}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-foreground mb-1">Matter</label><select value={form.matterId} onChange={(e) => setForm((f) => ({ ...f, matterId: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none"><option value="">Select matter</option>{matters.map((m: any) => <option key={m.id} value={m.id}>{m.title}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Description</label><input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-foreground mb-1">Hours</label><input type="number" step="0.1" value={form.hours} onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Date</label><input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
          </div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.billable} onChange={(e) => setForm((f) => ({ ...f, billable: e.target.checked }))} /><span className="text-sm">Billable</span></label>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-light">Save</button>
            <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-border rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      </Modal>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Entry" message="Delete this time entry?" variant="danger" />
    </div>
  );
}
