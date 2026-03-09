"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Mail, Phone, Eye, Trash2, Edit2 } from "lucide-react";
import { useClients } from "@/lib/hooks";
import { deleteDocument } from "@/lib/firebase-service";
import { ConfirmModal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

export default function ClientsPage() {
  const { data: clients, loading } = useClients();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return clients;
    const q = search.toLowerCase();
    return clients.filter((c: Record<string, unknown>) =>
      String((c as Record<string,unknown>).displayName || (c as Record<string,unknown>).name || (c as Record<string,unknown>).firstName || "").toLowerCase().includes(q) ||
      (c.email as string)?.toLowerCase().includes(q) ||
      (c.company as string)?.toLowerCase().includes(q)
    );
  }, [clients, search]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteDocument("users", deleteId);
      toast("success", "Client removed");
    } catch {
      toast("error", "Failed to delete client");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clients</h1>
          <p className="text-muted text-sm">{filtered.length} client{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/clients/new" className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Add Client
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input type="text" placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-12 text-muted">Loading clients...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted">No clients found</div>
        ) : (
          filtered.map((c: Record<string, unknown>) => (
            <div key={c.id as string} className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {String((c as Record<string,unknown>).displayName || (c as Record<string,unknown>).name || "").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0,2) || "??"}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{String((c as Record<string,unknown>).displayName || (c as Record<string,unknown>).name || "Unknown")}</div>
                    {c.company ? <div className="text-xs text-muted">{String(c.company)}</div> : null}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === "active" ? "bg-success/10 text-success" : "bg-muted-light text-muted"}`}>
                  {(c.status as string) || "active"}
                </span>
              </div>
              <div className="space-y-1.5 mb-4">
                {c.email ? (
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <Mail size={12} /> {String(c.email)}
                  </div>
                ) : null}
                {c.phone ? (
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <Phone size={12} /> {String(c.phone)}
                  </div>
                ) : null}
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-border">
                <Link href={`/admin/clients/${c.id}`} className="flex-1 text-center py-1.5 text-xs font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors">View</Link>
                <button onClick={() => setDeleteId(c.id as string)} className="p-1.5 rounded hover:bg-danger/10 text-muted hover:text-danger transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Remove Client" message="Are you sure you want to remove this client?" confirmLabel="Remove" variant="danger" loading={deleting} />
    </div>
  );
}
