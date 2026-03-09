"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Star } from "lucide-react";
import { useRealtimeCollection } from "@/lib/hooks";
import { createDocument, updateDocument, deleteDocument, serverTimestamp, orderBy } from "@/lib/firebase-service";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

export default function TestimonialsCMSPage() {
  const { data: testimonials, loading } = useRealtimeCollection("cmsTestimonials", [orderBy("order", "asc")]);
  const { toast } = useToast();
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ clientName: "", company: "", quote: "", rating: 5, published: true, order: 0 });

  function openNew() { setForm({ clientName: "", company: "", quote: "", rating: 5, published: true, order: testimonials.length }); setEditItem({}); }

  function openEdit(t: Record<string, unknown>) {
    setForm({ clientName: (t.clientName as string) || "", company: (t.company as string) || "", quote: (t.quote as string) || "", rating: Number(t.rating) || 5, published: t.published !== false, order: Number(t.order) || 0 });
    setEditItem(t);
  }

  async function handleSave() {
    if (!form.clientName || !form.quote) { toast("error", "Name and quote required"); return; }
    setSaving(true);
    try {
      if (editItem?.id) { await updateDocument("cmsTestimonials", editItem.id as string, { ...form, updatedAt: serverTimestamp() }); }
      else { await createDocument("cmsTestimonials", { ...form, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }); }
      toast("success", editItem?.id ? "Updated" : "Created");
      setEditItem(null);
    } catch { toast("error", "Failed"); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try { await deleteDocument("cmsTestimonials", deleteId); toast("success", "Deleted"); } catch { toast("error", "Failed"); }
    setDeleteId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Testimonials</h1><p className="text-muted text-sm">Manage client testimonials</p></div>
        <button onClick={openNew} className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"><Plus size={16} /> Add Testimonial</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? <div className="col-span-full text-center py-12 text-muted">Loading...</div> :
         testimonials.length === 0 ? <div className="col-span-full text-center py-12 text-muted">No testimonials</div> :
         testimonials.map((t: Record<string, unknown>) => (
          <div key={t.id as string} className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex gap-0.5">
                {Array.from({ length: Number(t.rating) || 5 }).map((_, i) => <Star key={i} size={14} className="text-accent fill-accent" />)}
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(t)} className="p-1.5 rounded hover:bg-muted-light text-muted hover:text-primary transition-colors"><Edit2 size={14} /></button>
                <button onClick={() => setDeleteId(t.id as string)} className="p-1.5 rounded hover:bg-danger/10 text-muted hover:text-danger transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
            <p className="text-sm text-foreground italic mb-3">&quot;{t.quote as string}&quot;</p>
            <div className="text-sm font-medium text-foreground">{t.clientName as string}</div>
            {t.company ? <div className="text-xs text-muted">{String(t.company)}</div> : null}
            <span className={`text-xs px-2 py-0.5 rounded-full mt-2 inline-block ${t.published !== false ? "bg-success/10 text-success" : "bg-muted-light text-muted"}`}>{t.published !== false ? "Published" : "Draft"}</span>
          </div>
        ))}
      </div>

      <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title={editItem?.id ? "Edit Testimonial" : "Add Testimonial"} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-foreground mb-1">Client Name *</label><input value={form.clientName} onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Company</label><input value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
          </div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Quote *</label><textarea value={form.quote} onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none resize-none" /></div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Rating</label>
            <div className="flex gap-1">{[1, 2, 3, 4, 5].map((r) => (
              <button key={r} type="button" onClick={() => setForm((f) => ({ ...f, rating: r }))} className="p-1"><Star size={20} className={r <= form.rating ? "text-accent fill-accent" : "text-muted"} /></button>
            ))}</div></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} className="rounded" /> Published</label>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={() => setEditItem(null)} className="px-4 py-2 text-sm rounded-lg border border-border text-muted hover:bg-muted-light transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary-light transition-colors disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
        </div>
      </Modal>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Testimonial" message="Remove this testimonial?" confirmLabel="Delete" variant="danger" />
    </div>
  );
}
