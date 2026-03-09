"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useRealtimeCollection } from "@/lib/hooks";
import { createDocument, deleteDocument, uploadFile, deleteFile, serverTimestamp } from "@/lib/firebase-service";
import { useToast } from "@/components/ui/Toast";
import { ConfirmModal } from "@/components/ui/Modal";
import { Upload, FileText, Image, File, Trash2, ExternalLink, Search } from "lucide-react";

export default function StaffDocumentsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { data: documents, loading } = useRealtimeCollection("documents");
  const fileRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteUrl, setDeleteUrl] = useState<string>("");

  const filtered = documents.filter((d: any) => !search || d.name?.toLowerCase().includes(search.toLowerCase()));

  const getIcon = (name: string) => {
    const ext = name?.split(".").pop()?.toLowerCase() || "";
    if (["pdf"].includes(ext)) return <FileText size={18} className="text-red-500" />;
    if (["jpg", "png", "gif", "svg"].includes(ext)) return <Image size={18} className="text-blue-500" />;
    return <File size={18} className="text-gray-500" />;
  };

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(`documents/${Date.now()}_${file.name}`, file);
      await createDocument("documents", {
        name: file.name, url, size: file.size, type: file.type,
        uploadedBy: profile?.uid, uploadedByName: profile?.displayName || profile?.email,
        createdAt: serverTimestamp(),
      });
      toast("success", "File uploaded");
    } catch { toast("error", "Upload failed"); }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      if (deleteUrl) await deleteFile(deleteUrl).catch(() => {});
      await deleteDocument("documents", deleteId);
      toast("success", "Document deleted");
    } catch { toast("error", "Failed to delete"); }
    setDeleteId(null); setDeleteUrl("");
  }

  const formatSize = (bytes: number) => bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Documents</h1><p className="text-muted text-sm">{documents.length} documents</p></div>
        <div>
          <input type="file" ref={fileRef} onChange={handleUpload} className="hidden" />
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
            <Upload size={16} /> {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>

      <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search documents..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-muted-light/50 border-b border-border"><th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">File</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Size</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Uploaded By</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Actions</th></tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? <tr><td colSpan={4} className="px-4 py-8 text-center text-muted text-sm">No documents found.</td></tr> :
              filtered.map((d: any) => (
                <tr key={d.id} className="hover:bg-muted-light/30">
                  <td className="px-4 py-3"><div className="flex items-center gap-2">{getIcon(d.name)}<span className="text-sm font-medium text-foreground">{d.name}</span></div></td>
                  <td className="px-4 py-3 text-sm text-muted">{d.size ? formatSize(d.size) : "—"}</td>
                  <td className="px-4 py-3 text-sm text-muted">{d.uploadedByName || "—"}</td>
                  <td className="px-4 py-3 flex gap-1">
                    {d.url && <a href={d.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-primary hover:bg-primary/10 rounded"><ExternalLink size={14} /></a>}
                    <button onClick={() => { setDeleteId(d.id); setDeleteUrl(d.url || ""); }} className="p-1.5 text-muted hover:text-red-600 rounded"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal isOpen={!!deleteId} onClose={() => { setDeleteId(null); setDeleteUrl(""); }} onConfirm={handleDelete} title="Delete Document" message="This will permanently delete this document." variant="danger" />
    </div>
  );
}
