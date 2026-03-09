"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useRealtimeCollection } from "@/lib/hooks";
import { createDocument, updateDocument, deleteDocument, serverTimestamp, orderBy } from "@/lib/firebase-service";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

export default function ServicesCMSPage() {
  const { data: services, loading } = useRealtimeCollection("cmsServices", [orderBy("order", "asc")]);
  const { toast } = useToast();
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", slug: "", description: "", icon: "", features: "", published: true, order: 0 });

  function openNew() { setForm({ title: "", slug: "", description: "", icon: "", features: "", published: true, order: services.length }); setEditItem({}); }

  function openEdit(s: Record<string, unknown>) {
    setForm({ title: (s.title as string) || "", slug: (s.slug as string) || "", description: (s.description as string) || "", icon: (s.icon as string) || "", features: Array.isArray(s.features) ? (s.features as string[]).join("\n") : (s.features as string) || "", published: s.published !== false, order: Number(s.order) || 0 });
    setEditItem(s);
  }

  async function handleSave() {
    if (!form.title) { toast("error", "Title required"); return; }
    setSaving(true);
    const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const data = { ...form, slug, features: form.features.split("\n").filter(Boolean) };
    try {
      if (editItem?.id) { await updateDocument("cmsServices", editItem.id as string, { ...data, updatedAt: serverTimestamp() }); }
      else { await createDocument("cmsServices", { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }); }
      toast("success", editItem?.id ? "Updated" : "Created");
      setEditItem(null);
    } catch { toast("error", "Failed"); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try { await deleteDocument("cmsServices", deleteId); toast("success", "Deleted"); } catch { toast("error", "Failed"); }
    setDeleteId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Practice Areas / Services</h1><p className="text-muted text-sm">Manage services shown on website</p></div>
        <button onClick={openNew} className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"><Plus size={16} /> Add Service</button>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted-light/30">
            <th className="text-left px-4 py-3 font-medium text-muted">Title</th>
            <th className="text-left px-4 py-3 font-medium text-muted hidden md:table-cell">Slug</th>
            <th className="text-left px-4 py-3 font-medium text-muted">Status</th>
            <th className="text-right px-4 py-3 font-medium text-muted">Actions</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={4} className="text-center py-12 text-muted">Loading...</td></tr> :
             services.length === 0 ? <tr><td colSpan={4} className="text-center py-12 text-muted">No services</td></tr> :
             services.map((s: Record<string, unknown>) => (
              <tr key={s.id as string} className="border-b border-border last:border-0 hover:bg-muted-light/20">
                <td className="px-4 py-3 font-medium text-foreground">{s.title as string}</td>
                <td className="px-4 py-3 text-muted font-mono text-xs hidden md:table-cell">/{s.slug as string}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${s.published !== false ? "bg-success/10 text-success" : "bg-muted-light text-muted"}`}>{s.published !== false ? "Published" : "Draft"}</span></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => openEdit(s)} className="p-1.5 rounded hover:bg-muted-light text-muted hover:text-primary transition-colors"><Edit2 size={14} /></button>
                    <button onClick={() => setDeleteId(s.id as string)} className="p-1.5 rounded hover:bg-danger/10 text-muted hover:text-danger transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title={editItem?.id ? "Edit Service" : "Add Service"} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-foreground mb-1">Title *</label><input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Slug</label><input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="auto-generated" className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
          </div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none resize-none" /></div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Features (one per line)</label><textarea value={form.features} onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))} rows={4} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none resize-none" placeholder="Feature 1&#10;Feature 2&#10;Feature 3" /></div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Icon (Lucide icon name)</label><input value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} placeholder="e.g. Briefcase" className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} className="rounded" /> Published</label>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={() => setEditItem(null)} className="px-4 py-2 text-sm rounded-lg border border-border text-muted hover:bg-muted-light transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary-light transition-colors disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
        </div>
      </Modal>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Service" message="Remove this practice area?" confirmLabel="Delete" variant="danger" />
    </div>
  );
}
