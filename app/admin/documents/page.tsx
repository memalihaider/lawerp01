"use client";

import { useState, useMemo, useRef } from "react";
import { Upload, Search, FileText, Image, File, Download, Trash2, FolderOpen, Eye } from "lucide-react";
import { useDocuments } from "@/lib/hooks";
import { createDocument, deleteDocument, uploadFile, deleteFile, serverTimestamp } from "@/lib/firebase-service";
import { ConfirmModal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/lib/auth";

const FILE_ICONS: Record<string, typeof FileText> = { pdf: FileText, doc: FileText, docx: FileText, jpg: Image, jpeg: Image, png: Image };

export default function DocumentsPage() {
  const { data: documents, loading } = useDocuments();
  const { profile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteUrl, setDeleteUrl] = useState<string>("");

  const filtered = useMemo(() => {
    if (!search) return documents;
    const q = search.toLowerCase();
    return documents.filter((d: Record<string, unknown>) =>
      (d.name as string)?.toLowerCase().includes(q) || (d.category as string)?.toLowerCase().includes(q)
    );
  }, [documents, search]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const path = `documents/${Date.now()}_${file.name}`;
        const url = await uploadFile(path, file);
        await createDocument("documents", {
          name: file.name, url, path, size: file.size,
          type: file.type, category: "general",
          uploadedBy: profile?.uid || "", uploadedByName: profile?.displayName || "",
          createdAt: serverTimestamp(),
        });
      }
      toast("success", `${files.length} file(s) uploaded`);
    } catch {
      toast("error", "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      if (deleteUrl) await deleteFile(deleteUrl).catch(() => {});
      await deleteDocument("documents", deleteId);
      toast("success", "Document deleted");
    } catch { toast("error", "Failed to delete"); }
    setDeleteId(null);
    setDeleteUrl("");
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }

  function getExt(name: string) {
    return name.split(".").pop()?.toLowerCase() || "";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Documents</h1><p className="text-muted text-sm">{filtered.length} document{filtered.length !== 1 ? "s" : ""}</p></div>
        <div>
          <input ref={fileInputRef} type="file" multiple onChange={handleUpload} className="hidden" id="file-upload" />
          <label htmlFor="file-upload" className={`flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
            <Upload size={16} /> {uploading ? "Uploading..." : "Upload Files"}
          </label>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input type="text" placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted-light/30">
            <th className="text-left px-4 py-3 font-medium text-muted">Name</th>
            <th className="text-left px-4 py-3 font-medium text-muted hidden md:table-cell">Category</th>
            <th className="text-left px-4 py-3 font-medium text-muted hidden md:table-cell">Uploaded By</th>
            <th className="text-right px-4 py-3 font-medium text-muted hidden lg:table-cell">Size</th>
            <th className="text-right px-4 py-3 font-medium text-muted">Actions</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="text-center py-12 text-muted">Loading...</td></tr> :
             filtered.length === 0 ? <tr><td colSpan={5} className="text-center py-12 text-muted">No documents</td></tr> :
             filtered.map((d: Record<string, unknown>) => {
               const ext = getExt(d.name as string);
               const Icon = FILE_ICONS[ext] || File;
               return (
                 <tr key={d.id as string} className="border-b border-border last:border-0 hover:bg-muted-light/20">
                   <td className="px-4 py-3"><div className="flex items-center gap-2"><Icon size={16} className="text-primary" /><span className="font-medium text-foreground">{d.name as string}</span></div></td>
                   <td className="px-4 py-3 text-muted capitalize hidden md:table-cell">{(d.category as string) || "General"}</td>
                   <td className="px-4 py-3 text-muted hidden md:table-cell">{d.uploadedByName as string}</td>
                   <td className="px-4 py-3 text-right text-muted hidden lg:table-cell">{formatSize(Number(d.size) || 0)}</td>
                   <td className="px-4 py-3 text-right">
                     <div className="flex items-center gap-1 justify-end">
                        {d.url ? <a href={d.url as string} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-muted-light text-muted hover:text-primary transition-colors"><Eye size={14} /></a> : null}
                       <button onClick={() => { setDeleteId(d.id as string); setDeleteUrl((d.path as string) || ""); }} className="p-1.5 rounded hover:bg-danger/10 text-muted hover:text-danger transition-colors"><Trash2 size={14} /></button>
                     </div>
                   </td>
                 </tr>
               );
             })}
          </tbody>
        </table>
      </div>

      <ConfirmModal isOpen={!!deleteId} onClose={() => { setDeleteId(null); setDeleteUrl(""); }} onConfirm={handleDelete} title="Delete Document" message="This will permanently delete this document." confirmLabel="Delete" variant="danger" />
    </div>
  );
}
