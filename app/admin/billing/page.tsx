"use client";

import { useState, useMemo } from "react";
import { Plus, Clock, Play, Square, DollarSign } from "lucide-react";
import { useRealtimeCollection, useMatters } from "@/lib/hooks";
import { createDocument, updateDocument, deleteDocument, serverTimestamp, orderBy } from "@/lib/firebase-service";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/lib/auth";

export default function BillingPage() {
  const { profile } = useAuth();
  const { data: timeEntries, loading } = useRealtimeCollection("timeEntries", [orderBy("date", "desc")]);
  const { data: matters } = useMatters();
  const { toast } = useToast();

  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [timer, setTimer] = useState<{ running: boolean; start: number; matterId: string; description: string }>({ running: false, start: 0, matterId: "", description: "" });
  const [elapsed, setElapsed] = useState(0);
  const [form, setForm] = useState({ matterId: "", matterTitle: "", description: "", hours: "", date: new Date().toISOString().split("T")[0], billable: true, rate: 350 });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const totalHours = useMemo(() => timeEntries.reduce((s: number, t: Record<string, unknown>) => s + (Number(t.hours) || 0), 0), [timeEntries]);
  const billableHours = useMemo(() => timeEntries.filter((t: Record<string, unknown>) => t.billable).reduce((s: number, t: Record<string, unknown>) => s + (Number(t.hours) || 0), 0), [timeEntries]);
  const totalValue = useMemo(() => timeEntries.filter((t: Record<string, unknown>) => t.billable).reduce((s: number, t: Record<string, unknown>) => s + (Number(t.hours) || 0) * (Number(t.rate) || 0), 0), [timeEntries]);

  function startTimer() {
    if (!timer.matterId) { toast("error", "Select a matter"); return; }
    setTimer((t) => ({ ...t, running: true, start: Date.now() }));
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - Date.now()) / 1000)), 1000);
    // Store interval to clear later
    (window as unknown as Record<string, unknown>).__timerIv = iv;
  }

  async function stopTimer() {
    clearInterval((window as unknown as Record<string, unknown>).__timerIv as number);
    const hours = Math.round(((Date.now() - timer.start) / 3600000) * 100) / 100;
    const matter = matters.find((m: Record<string, unknown>) => m.id === timer.matterId);
    try {
      await createDocument("timeEntries", {
        matterId: timer.matterId, matterTitle: (matter as Record<string, unknown>)?.title || "",
        description: timer.description, hours: Math.max(hours, 0.1), date: new Date().toISOString().split("T")[0],
        billable: true, rate: 350, userId: profile?.uid || "", userName: profile?.displayName || "",
        createdAt: serverTimestamp(),
      });
      toast("success", `Logged ${hours.toFixed(2)} hours`);
    } catch { toast("error", "Failed to save time entry"); }
    setTimer({ running: false, start: 0, matterId: "", description: "" });
    setElapsed(0);
  }

  async function handleSave() {
    if (!form.matterId || !form.hours) { toast("error", "Matter and hours are required"); return; }
    setSaving(true);
    const matter = matters.find((m: Record<string, unknown>) => m.id === form.matterId);
    try {
      await createDocument("timeEntries", {
        ...form, hours: Number(form.hours), rate: Number(form.rate),
        matterTitle: (matter as Record<string, unknown>)?.title || form.matterTitle,
        userId: profile?.uid || "", userName: profile?.displayName || "",
        createdAt: serverTimestamp(),
      });
      toast("success", "Time entry added");
      setShowNew(false);
      setForm({ matterId: "", matterTitle: "", description: "", hours: "", date: new Date().toISOString().split("T")[0], billable: true, rate: 350 });
    } catch { toast("error", "Failed to add entry"); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try { await deleteDocument("timeEntries", deleteId); toast("success", "Entry deleted"); } catch { toast("error", "Failed to delete"); }
    setDeleteId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing & Time</h1>
          <p className="text-muted text-sm">Track time and manage billing</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Add Entry
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-1"><Clock size={16} className="text-info" /><span className="text-sm text-muted">Total Hours</span></div>
          <div className="text-2xl font-bold text-foreground">{totalHours.toFixed(1)}</div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-1"><Clock size={16} className="text-success" /><span className="text-sm text-muted">Billable Hours</span></div>
          <div className="text-2xl font-bold text-foreground">{billableHours.toFixed(1)}</div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-1"><DollarSign size={16} className="text-accent-dark" /><span className="text-sm text-muted">Total Value</span></div>
          <div className="text-2xl font-bold text-foreground">${totalValue.toLocaleString()}</div>
        </div>
      </div>

      {/* Timer */}
      <div className="bg-white rounded-xl border border-border p-4">
        <h3 className="font-semibold text-foreground mb-3">Timer</h3>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <select value={timer.matterId} onChange={(e) => setTimer((t) => ({ ...t, matterId: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
              <option value="">Select matter...</option>
              {matters.map((m: Record<string, unknown>) => <option key={m.id as string} value={m.id as string}>{m.title as string}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <input value={timer.description} onChange={(e) => setTimer((t) => ({ ...t, description: e.target.value }))} placeholder="What are you working on?"
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          {!timer.running ? (
            <button onClick={startTimer} className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-lg text-sm font-medium hover:bg-success/90 transition-colors">
              <Play size={14} /> Start
            </button>
          ) : (
            <button onClick={stopTimer} className="flex items-center gap-2 px-4 py-2 bg-danger text-white rounded-lg text-sm font-medium hover:bg-danger/90 transition-colors">
              <Square size={14} /> Stop
            </button>
          )}
        </div>
      </div>

      {/* Time Entries Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted-light/30">
              <th className="text-left px-4 py-3 font-medium text-muted">Date</th>
              <th className="text-left px-4 py-3 font-medium text-muted">Matter</th>
              <th className="text-left px-4 py-3 font-medium text-muted hidden md:table-cell">Description</th>
              <th className="text-right px-4 py-3 font-medium text-muted">Hours</th>
              <th className="text-right px-4 py-3 font-medium text-muted hidden lg:table-cell">Rate</th>
              <th className="text-right px-4 py-3 font-medium text-muted">Amount</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-muted">Loading...</td></tr>
            ) : timeEntries.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-muted">No time entries yet</td></tr>
            ) : (
              timeEntries.map((t: Record<string, unknown>) => (
                <tr key={t.id as string} className="border-b border-border last:border-0 hover:bg-muted-light/20">
                  <td className="px-4 py-3 text-muted">{t.date as string}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{t.matterTitle as string}</td>
                  <td className="px-4 py-3 text-muted hidden md:table-cell">{t.description as string}</td>
                  <td className="px-4 py-3 text-right font-mono">{Number(t.hours).toFixed(1)}</td>
                  <td className="px-4 py-3 text-right text-muted hidden lg:table-cell">${Number(t.rate)}</td>
                  <td className="px-4 py-3 text-right font-medium">${(Number(t.hours) * Number(t.rate)).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New Entry Modal */}
      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title="New Time Entry" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Matter *</label>
            <select value={form.matterId} onChange={(e) => setForm((f) => ({ ...f, matterId: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
              <option value="">Select...</option>
              {matters.map((m: Record<string, unknown>) => <option key={m.id as string} value={m.id as string}>{m.title as string}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-sm font-medium text-foreground mb-1">Hours *</label>
              <input type="number" step="0.1" value={form.hours} onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Rate ($)</label>
              <input type="number" value={form.rate} onChange={(e) => setForm((f) => ({ ...f, rate: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" /></div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.billable} onChange={(e) => setForm((f) => ({ ...f, billable: e.target.checked }))} className="rounded" /> Billable
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm rounded-lg border border-border text-muted hover:bg-muted-light transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary-light transition-colors disabled:opacity-50">
            {saving ? "Saving..." : "Save Entry"}
          </button>
        </div>
      </Modal>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Entry" message="Delete this time entry?" confirmLabel="Delete" variant="danger" />
    </div>
  );
}
