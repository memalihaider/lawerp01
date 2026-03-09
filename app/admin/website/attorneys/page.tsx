"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useRealtimeCollection } from "@/lib/hooks";
import { createDocument, updateDocument, deleteDocument, serverTimestamp, orderBy } from "@/lib/firebase-service";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

export default function AttorneysCMSPage() {
  const { data: attorneys, loading } = useRealtimeCollection("cmsAttorneys", [orderBy("order", "asc")]);
  const { toast } = useToast();
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", title: "", practiceArea: "", email: "", phone: "", bio: "", education: "", barAdmissions: "", imageUrl: "", order: 0, published: true });

  function openNew() { setForm({ name: "", title: "", practiceArea: "", email: "", phone: "", bio: "", education: "", barAdmissions: "", imageUrl: "", order: attorneys.length, published: true }); setEditItem({}); }

  function openEdit(a: Record<string, unknown>) {
    setForm({ name: (a.name as string) || "", title: (a.title as string) || "", practiceArea: (a.practiceArea as string) || "", email: (a.email as string) || "", phone: (a.phone as string) || "", bio: (a.bio as string) || "", education: (a.education as string) || "", barAdmissions: (a.barAdmissions as string) || "", imageUrl: (a.imageUrl as string) || "", order: Number(a.order) || 0, published: a.published !== false });
    setEditItem(a);
  }

  async function handleSave() {
    if (!form.name) { toast("error", "Name required"); return; }
    setSaving(true);
    try {
      if (editItem?.id) { await updateDocument("cmsAttorneys", editItem.id as string, { ...form, updatedAt: serverTimestamp() }); }
      else { await createDocument("cmsAttorneys", { ...form, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }); }
      toast("success", editItem?.id ? "Updated" : "Created");
      setEditItem(null);
    } catch { toast("error", "Failed to save"); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try { await deleteDocument("cmsAttorneys", deleteId); toast("success", "Deleted"); } catch { toast("error", "Failed"); }
    setDeleteId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Attorney Profiles</h1><p className="text-muted text-sm">Manage attorney display on website</p></div>
        <button onClick={openNew} className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"><Plus size={16} /> Add Attorney</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <div className="col-span-full text-center py-12 text-muted">Loading...</div> :
         attorneys.length === 0 ? <div className="col-span-full text-center py-12 text-muted">No profiles. Add one!</div> :
         attorneys.map((a: Record<string, unknown>) => (
          <div key={a.id as string} className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {((a.name as string)?.[0] || "A").toUpperCase()}
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(a)} className="p-1.5 rounded hover:bg-muted-light text-muted hover:text-primary transition-colors"><Edit2 size={14} /></button>
                <button onClick={() => setDeleteId(a.id as string)} className="p-1.5 rounded hover:bg-danger/10 text-muted hover:text-danger transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="font-medium text-foreground">{a.name as string}</div>
            <div className="text-sm text-muted">{a.title as string}</div>
            <div className="text-xs text-primary mt-1">{a.practiceArea as string}</div>
            <span className={`text-xs px-2 py-0.5 rounded-full mt-2 inline-block ${a.published !== false ? "bg-success/10 text-success" : "bg-muted-light text-muted"}`}>{a.published !== false ? "Published" : "Draft"}</span>
          </div>
        ))}
      </div>

      <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title={editItem?.id ? "Edit Attorney" : "Add Attorney"} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-foreground mb-1">Name *</label><input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Title</label><input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Senior Partner" className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-foreground mb-1">Practice Area</label><input value={form.practiceArea} onChange={(e) => setForm((f) => ({ ...f, practiceArea: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Email</label><input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
          </div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Bio</label><textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} rows={4} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none resize-none" /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-foreground mb-1">Education</label><input value={form.education} onChange={(e) => setForm((f) => ({ ...f, education: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Bar Admissions</label><input value={form.barAdmissions} onChange={(e) => setForm((f) => ({ ...f, barAdmissions: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} className="rounded" /> Published</label>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={() => setEditItem(null)} className="px-4 py-2 text-sm rounded-lg border border-border text-muted hover:bg-muted-light transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary-light transition-colors disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
        </div>
      </Modal>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Attorney" message="Remove this attorney profile?" confirmLabel="Delete" variant="danger" />
    </div>
  );
}
