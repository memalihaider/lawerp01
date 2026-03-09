"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Eye } from "lucide-react";
import { useRealtimeCollection } from "@/lib/hooks";
import { createDocument, updateDocument, deleteDocument, serverTimestamp, orderBy } from "@/lib/firebase-service";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

export default function BlogCMSPage() {
  const { data: posts, loading } = useRealtimeCollection("cmsBlogPosts", [orderBy("createdAt", "desc")]);
  const { toast } = useToast();
  const [editPost, setEditPost] = useState<Record<string, unknown> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", slug: "", excerpt: "", content: "", author: "", category: "", tags: "", published: true, featuredImage: "" });

  function openNew() {
    setForm({ title: "", slug: "", excerpt: "", content: "", author: "", category: "", tags: "", published: true, featuredImage: "" });
    setEditPost({});
  }

  function openEdit(p: Record<string, unknown>) {
    setForm({
      title: (p.title as string) || "", slug: (p.slug as string) || "", excerpt: (p.excerpt as string) || "",
      content: (p.content as string) || "", author: (p.author as string) || "", category: (p.category as string) || "",
      tags: Array.isArray(p.tags) ? p.tags.join(", ") : (p.tags as string) || "",
      published: p.published !== false, featuredImage: (p.featuredImage as string) || "",
    });
    setEditPost(p);
  }

  async function handleSave() {
    if (!form.title) { toast("error", "Title required"); return; }
    setSaving(true);
    const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const data = { ...form, slug, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) };
    try {
      if (editPost?.id) {
        await updateDocument("cmsBlogPosts", editPost.id as string, { ...data, updatedAt: serverTimestamp() });
      } else {
        await createDocument("cmsBlogPosts", { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      }
      toast("success", editPost?.id ? "Post updated" : "Post created");
      setEditPost(null);
    } catch { toast("error", "Failed to save"); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try { await deleteDocument("cmsBlogPosts", deleteId); toast("success", "Post deleted"); } catch { toast("error", "Failed"); }
    setDeleteId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Blog Posts</h1><p className="text-muted text-sm">{posts.length} post{posts.length !== 1 ? "s" : ""}</p></div>
        <button onClick={openNew} className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"><Plus size={16} /> New Post</button>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted-light/30">
            <th className="text-left px-4 py-3 font-medium text-muted">Title</th>
            <th className="text-left px-4 py-3 font-medium text-muted hidden md:table-cell">Author</th>
            <th className="text-left px-4 py-3 font-medium text-muted hidden lg:table-cell">Category</th>
            <th className="text-left px-4 py-3 font-medium text-muted">Status</th>
            <th className="text-right px-4 py-3 font-medium text-muted">Actions</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="text-center py-12 text-muted">Loading...</td></tr> :
             posts.length === 0 ? <tr><td colSpan={5} className="text-center py-12 text-muted">No posts yet</td></tr> :
             posts.map((p: Record<string, unknown>) => (
              <tr key={p.id as string} className="border-b border-border last:border-0 hover:bg-muted-light/20">
                <td className="px-4 py-3"><div className="font-medium text-foreground">{p.title as string}</div><div className="text-xs text-muted font-mono">/{p.slug as string}</div></td>
                <td className="px-4 py-3 text-muted hidden md:table-cell">{p.author as string}</td>
                <td className="px-4 py-3 text-muted hidden lg:table-cell">{p.category as string}</td>
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

      <Modal isOpen={!!editPost} onClose={() => setEditPost(null)} title={editPost?.id ? "Edit Post" : "New Post"} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-foreground mb-1">Title *</label>
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Slug</label>
              <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="auto-generated" className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-foreground mb-1">Author</label>
              <input value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Category</label>
              <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
          </div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Excerpt</label>
            <textarea value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none resize-none" /></div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Content</label>
            <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={10} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none resize-none font-mono" /></div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Tags (comma-separated)</label>
            <input value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} className="rounded" /> Published</label>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={() => setEditPost(null)} className="px-4 py-2 text-sm rounded-lg border border-border text-muted hover:bg-muted-light transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary-light transition-colors disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
        </div>
      </Modal>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Post" message="This will permanently delete this blog post." confirmLabel="Delete" variant="danger" />
    </div>
  );
}
