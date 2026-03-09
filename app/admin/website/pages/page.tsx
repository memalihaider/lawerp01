"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Eye, GripVertical } from "lucide-react";
import { useRealtimeCollection } from "@/lib/hooks";
import { createDocument, updateDocument, deleteDocument, serverTimestamp, orderBy } from "@/lib/firebase-service";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

export default function PagesPage() {
  const { data: pages, loading } = useRealtimeCollection("cmsPages", [orderBy("order", "asc")]);
  const { toast } = useToast();
  const [editPage, setEditPage] = useState<Record<string, unknown> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", slug: "", content: "", metaTitle: "", metaDescription: "", published: true, order: 0 });

  function openNew() {
    setForm({ title: "", slug: "", content: "", metaTitle: "", metaDescription: "", published: true, order: pages.length });
    setEditPage({});
  }

  function openEdit(p: Record<string, unknown>) {
    setForm({
      title: (p.title as string) || "", slug: (p.slug as string) || "", content: (p.content as string) || "",
      metaTitle: (p.metaTitle as string) || "", metaDescription: (p.metaDescription as string) || "",
      published: p.published !== false, order: Number(p.order) || 0,
    });
    setEditPage(p);
  }

  async function handleSave() {
    if (!form.title) { toast("error", "Title required"); return; }
    setSaving(true);
    const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    try {
      if (editPage?.id) {
        await updateDocument("cmsPages", editPage.id as string, { ...form, slug, updatedAt: serverTimestamp() });
        toast("success", "Page updated");
      } else {
        await createDocument("cmsPages", { ...form, slug, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        toast("success", "Page created");
      }
      setEditPage(null);
    } catch { toast("error", "Failed to save"); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try { await deleteDocument("cmsPages", deleteId); toast("success", "Page deleted"); } catch { toast("error", "Failed"); }
    setDeleteId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Pages</h1><p className="text-muted text-sm">Manage website pages</p></div>
        <button onClick={openNew} className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"><Plus size={16} /> New Page</button>
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
             pages.length === 0 ? <tr><td colSpan={4} className="text-center py-12 text-muted">No pages. Create one!</td></tr> :
             pages.map((p: Record<string, unknown>) => (
              <tr key={p.id as string} className="border-b border-border last:border-0 hover:bg-muted-light/20">
                <td className="px-4 py-3 font-medium text-foreground">{p.title as string}</td>
                <td className="px-4 py-3 text-muted font-mono text-xs hidden md:table-cell">/{p.slug as string}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${p.published !== false ? "bg-success/10 text-success" : "bg-muted-light text-muted"}`}>{p.published !== false ? "Published" : "Draft"}</span></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-muted-light text-muted hover:text-primary transition-colors"><Edit2 size={14} /></button>
                    <button onClick={() => setDeleteId(p.id as string)} className="p-1.5 rounded hover:bg-danger/10 text-muted hover:text-danger transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!editPage} onClose={() => setEditPage(null)} title={editPage?.id ? "Edit Page" : "New Page"} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-foreground mb-1">Title *</label>
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Slug</label>
              <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="auto-generated" className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
          </div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Content</label>
            <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={10} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none resize-none font-mono" placeholder="Page content (HTML or Markdown)" /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-foreground mb-1">Meta Title</label>
              <input value={form.metaTitle} onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Meta Description</label>
              <input value={form.metaDescription} onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} className="rounded" /> Published</label>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={() => setEditPage(null)} className="px-4 py-2 text-sm rounded-lg border border-border text-muted hover:bg-muted-light transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary-light transition-colors disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
        </div>
      </Modal>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Page" message="This will permanently delete this page." confirmLabel="Delete" variant="danger" />
    </div>
  );
}
