"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useRealtimeCollection } from "@/lib/hooks";
import { createDocument, uploadFile, serverTimestamp } from "@/lib/firebase-service";
import { useToast } from "@/components/ui/Toast";
import { Search, FileText, File, Image, Upload, ExternalLink } from "lucide-react";

import { where, orderBy } from "firebase/firestore";

export default function PortalDocumentsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { data: documents, loading } = useRealtimeCollection("documents", profile?.uid ? [where("clientId", "==", profile.uid), orderBy("createdAt", "desc")] : []);
  const fileRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);

  const filtered = documents.filter((d: any) => !search || d.name?.toLowerCase().includes(search.toLowerCase()));

  const getIcon = (name: string) => {
    const ext = name?.split(".").pop()?.toLowerCase() || "";
    if (["pdf"].includes(ext)) return <FileText size={18} className="text-red-500" />;
    if (["jpg", "png", "gif"].includes(ext)) return <Image size={18} className="text-blue-500" />;
    return <File size={18} className="text-gray-500" />;
  };

  const formatSize = (bytes: number) => bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(`documents/${Date.now()}_${file.name}`, file);
      await createDocument("documents", {
        name: file.name, url, size: file.size, type: file.type,
        uploadedBy: profile?.uid, uploadedByName: profile?.displayName || profile?.email,
        clientId: profile?.uid,
        createdAt: serverTimestamp(),
      });
      toast("success", "File uploaded");
    } catch { toast("error", "Upload failed"); }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Documents</h1><p className="text-muted text-sm">Access and review documents related to your cases</p></div>
        <div><input type="file" ref={fileRef} onChange={handleUpload} className="hidden" /><button onClick={() => fileRef.current?.click()} disabled={uploading} className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"><Upload size={16} /> {uploading ? "Uploading..." : "Upload"}</button></div>
      </div>

      <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search documents..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-muted-light/50 border-b border-border"><th className="text-left py-3 px-4 text-xs font-semibold text-muted uppercase">Document</th><th className="text-left py-3 px-4 text-xs font-semibold text-muted uppercase hidden sm:table-cell">Size</th><th className="text-left py-3 px-4 text-xs font-semibold text-muted uppercase hidden md:table-cell">Uploaded By</th><th className="text-left py-3 px-4 text-xs font-semibold text-muted uppercase">Actions</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={4} className="py-8 text-center text-muted">No documents found.</td></tr> :
              filtered.map((doc: any) => (
                <tr key={doc.id} className="border-b border-border/50 hover:bg-muted-light/50">
                  <td className="py-3 px-4"><div className="flex items-center gap-3">{getIcon(doc.name)}<span className="font-medium text-foreground">{doc.name}</span></div></td>
                  <td className="py-3 px-4 hidden sm:table-cell text-muted">{doc.size ? formatSize(doc.size) : "—"}</td>
                  <td className="py-3 px-4 hidden md:table-cell text-muted">{doc.uploadedByName || "—"}</td>
                  <td className="py-3 px-4">{doc.url && <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs flex items-center gap-1"><ExternalLink size={14} /> View</a>}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
