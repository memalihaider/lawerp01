"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Filter, MoreVertical, Eye, Edit2, Trash2, ChevronDown } from "lucide-react";
import { useMatters, useClients } from "@/lib/hooks";
import { deleteDocument, updateDocument } from "@/lib/firebase-service";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

const STATUS_OPTIONS = ["all", "active", "open", "pending", "closed", "archived"];
const STATUS_COLORS: Record<string, string> = {
  active: "bg-success/10 text-success",
  open: "bg-info/10 text-info",
  pending: "bg-warning/10 text-warning",
  closed: "bg-muted-light text-muted",
  archived: "bg-muted-light text-muted-dark",
};

export default function MattersPage() {
  const { data: matters, loading } = useMatters();
  const { data: clients } = useClients();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editMatter, setEditMatter] = useState<Record<string, unknown> | null>(null);
  const [editStatus, setEditStatus] = useState("");

  const filtered = useMemo(() => {
    return matters.filter((m: Record<string, unknown>) => {
      const matchSearch =
        !search ||
        (m.title as string)?.toLowerCase().includes(search.toLowerCase()) ||
        (m.caseNumber as string)?.toLowerCase().includes(search.toLowerCase()) ||
        (m.clientName as string)?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || m.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [matters, search, statusFilter]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteDocument("matters", deleteId);
      toast("success", "Matter deleted");
    } catch {
      toast("error", "Failed to delete matter");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  async function handleStatusUpdate() {
    if (!editMatter || !editStatus) return;
    try {
      await updateDocument("matters", editMatter.id as string, { status: editStatus });
      toast("success", "Status updated");
      setEditMatter(null);
    } catch {
      toast("error", "Failed to update status");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Matters</h1>
          <p className="text-muted text-sm">{filtered.length} matter{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/matters/new" className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> New Matter
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search matters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
        </div>
        <div className="flex gap-2">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                statusFilter === s ? "bg-primary text-white" : "bg-white border border-border text-muted hover:bg-muted-light/50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Matter List */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted-light/30">
              <th className="text-left px-4 py-3 font-medium text-muted">Case No.</th>
              <th className="text-left px-4 py-3 font-medium text-muted">Title</th>
              <th className="text-left px-4 py-3 font-medium text-muted hidden md:table-cell">Client</th>
              <th className="text-left px-4 py-3 font-medium text-muted hidden lg:table-cell">Practice Area</th>
              <th className="text-left px-4 py-3 font-medium text-muted">Status</th>
              <th className="text-right px-4 py-3 font-medium text-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-muted">Loading matters...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-muted">No matters found</td></tr>
            ) : (
              filtered.map((m: Record<string, unknown>) => (
                <tr key={m.id as string} className="border-b border-border last:border-0 hover:bg-muted-light/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted">{(m.caseNumber || `M-${(m.id as string).slice(0, 6)}`) as string}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/matters/${m.id}`} className="text-primary font-medium hover:underline">{m.title as string}</Link>
                  </td>
                  <td className="px-4 py-3 text-muted hidden md:table-cell">{m.clientName as string}</td>
                  <td className="px-4 py-3 text-muted hidden lg:table-cell">{m.practiceArea as string}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => { setEditMatter(m); setEditStatus(m.status as string); }}
                      className={`text-xs px-2 py-0.5 rounded-full cursor-pointer inline-flex items-center gap-1 ${STATUS_COLORS[m.status as string] || "bg-muted-light text-muted"}`}
                    >
                      {m.status as string} <ChevronDown size={10} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Link href={`/admin/matters/${m.id}`} className="p-1.5 rounded hover:bg-muted-light transition-colors text-muted hover:text-primary">
                        <Eye size={14} />
                      </Link>
                      <button onClick={() => setDeleteId(m.id as string)} className="p-1.5 rounded hover:bg-danger/10 transition-colors text-muted hover:text-danger">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Status Edit Modal */}
      <Modal isOpen={!!editMatter} onClose={() => setEditMatter(null)} title="Update Matter Status" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-muted">Change status for: <strong>{editMatter?.title as string}</strong></p>
          <select
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          >
            {STATUS_OPTIONS.filter((s) => s !== "all").map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={() => setEditMatter(null)} className="px-4 py-2 text-sm rounded-lg border border-border text-muted hover:bg-muted-light transition-colors">Cancel</button>
          <button onClick={handleStatusUpdate} className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary-light transition-colors">Update</button>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Matter"
        message="Are you sure you want to delete this matter? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
