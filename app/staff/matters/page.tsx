"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRealtimeCollection } from "@/lib/hooks";
import { updateDocument } from "@/lib/firebase-service";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { Search, Eye, Briefcase } from "lucide-react";

export default function StaffMattersPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const userId = profile?.uid || "";
  const { data: allMatters, loading } = useRealtimeCollection("matters");
  const { data: users } = useRealtimeCollection("users");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMatter, setViewMatter] = useState<any>(null);

  const myMatters = allMatters.filter((m: any) => m.assignedAttorney === userId || m.assignedTo === userId || m.createdBy === userId);
  const filtered = myMatters
    .filter((m: any) => statusFilter === "all" || m.status === statusFilter)
    .filter((m: any) => !search || m.title?.toLowerCase().includes(search.toLowerCase()) || m.caseNumber?.toLowerCase().includes(search.toLowerCase()));

  const getClientName = (id: string) => {
    const u = users.find((u) => u.id === id) as Record<string, any> | undefined;
    return u ? u.displayName || u.email : id || "—";
  };

  const statuses = ["all", "active", "open", "pending", "closed"];
  const statusColors: Record<string, string> = { active: "bg-green-100 text-green-700", open: "bg-blue-100 text-blue-700", pending: "bg-yellow-100 text-yellow-700", closed: "bg-gray-100 text-gray-700", archived: "bg-gray-100 text-gray-500" };

  async function handleStatusUpdate(id: string, status: string) {
    try { await updateDocument("matters", id, { status }); toast("success", "Status updated"); } catch { toast("error", "Failed to update"); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">My Matters</h1><p className="text-muted text-sm">{myMatters.length} assigned matters</p></div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search matters..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
        <div className="flex gap-1 bg-muted-light rounded-lg p-1">
          {statuses.map((s) => <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${statusFilter === s ? "bg-white text-foreground shadow-sm" : "text-muted"}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>)}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center"><Briefcase size={40} className="mx-auto text-muted mb-3" /><p className="text-muted">No matters found.</p></div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-muted-light/50 border-b border-border"><th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Case #</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Title</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Client</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Practice Area</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Status</th><th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Actions</th></tr></thead>
            <tbody className="divide-y divide-border">
              {filtered.map((m: any) => (
                <tr key={m.id} className="hover:bg-muted-light/30">
                  <td className="px-4 py-3 text-sm font-mono text-muted">{m.caseNumber || "—"}</td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{m.title}</td>
                  <td className="px-4 py-3 text-sm text-muted">{getClientName(m.clientId)}</td>
                  <td className="px-4 py-3 text-sm text-muted">{m.practiceArea || "—"}</td>
                  <td className="px-4 py-3">
                    <select value={m.status || "open"} onChange={(e) => handleStatusUpdate(m.id, e.target.value)} className={`text-xs font-medium px-2 py-1 rounded-full border-0 outline-none cursor-pointer ${statusColors[m.status] || "bg-gray-100"}`}>
                      <option value="active">Active</option><option value="open">Open</option><option value="pending">Pending</option><option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setViewMatter(m)} className="text-primary hover:underline text-sm flex items-center gap-1"><Eye size={14} /> View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!viewMatter} onClose={() => setViewMatter(null)} title={viewMatter?.title || "Matter Details"} size="lg">
        {viewMatter && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted">Case Number:</span><div className="font-medium">{viewMatter.caseNumber}</div></div>
              <div><span className="text-muted">Status:</span><div className="font-medium capitalize">{viewMatter.status}</div></div>
              <div><span className="text-muted">Practice Area:</span><div className="font-medium">{viewMatter.practiceArea || "—"}</div></div>
              <div><span className="text-muted">Priority:</span><div className="font-medium capitalize">{viewMatter.priority || "normal"}</div></div>
              <div><span className="text-muted">Client:</span><div className="font-medium">{getClientName(viewMatter.clientId)}</div></div>
              <div><span className="text-muted">Billing Type:</span><div className="font-medium capitalize">{viewMatter.billingType || "hourly"}</div></div>
            </div>
            <div><span className="text-muted text-sm">Description:</span><p className="text-sm mt-1">{viewMatter.description || "No description."}</p></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
