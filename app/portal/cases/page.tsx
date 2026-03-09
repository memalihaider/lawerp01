"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRealtimeCollection } from "@/lib/hooks";
import { where } from "@/lib/firebase-service";
import { Modal } from "@/components/ui/Modal";
import { Briefcase, User, Eye } from "lucide-react";

export default function PortalCasesPage() {
  const { profile } = useAuth();
  const userId = profile?.uid || "";
  const { data: matters, loading } = useRealtimeCollection("matters", userId ? [where("clientId", "==", userId)] : undefined);
  const { data: users } = useRealtimeCollection("users");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMatter, setViewMatter] = useState<any>(null);

  const filtered = matters.filter((m: any) => statusFilter === "all" || m.status === statusFilter);
  const getAttorneyName = (id: string) => { const u = users.find((u) => u.id === id) as Record<string, unknown> | undefined; return String(u?.displayName || "—"); };
  const statusColors: Record<string, string> = { active: "bg-green-100 text-green-700", open: "bg-blue-100 text-blue-700", pending: "bg-yellow-100 text-yellow-700", closed: "bg-gray-100 text-gray-600" };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Cases</h1>
        <p className="text-muted text-sm">Track the progress of your legal matters</p>
      </div>

      <div className="flex gap-2">
        {["all", "active", "open", "pending", "closed"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${statusFilter === s ? "bg-primary text-white" : "bg-white border border-border text-muted hover:bg-muted-light"}`}>{s}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center"><Briefcase size={40} className="mx-auto text-muted mb-3" /><p className="text-muted">No cases found.</p></div>
      ) : (
        <div className="space-y-4">
          {filtered.map((c: any) => (
            <div key={c.id} className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Briefcase size={20} className="text-primary" /></div>
                  <div>
                    <h3 className="font-semibold text-foreground">{c.title}</h3>
                    <span className="text-xs text-muted">Case: {c.caseNumber || "—"} · {c.practiceArea || "General"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${statusColors[c.status] || "bg-gray-100 text-gray-600"}`}>{c.status}</span>
                  <button onClick={() => setViewMatter(c)} className="text-primary hover:underline text-xs flex items-center gap-1"><Eye size={14} /> Details</button>
                </div>
              </div>
              {c.description && <p className="text-sm text-muted mb-3">{c.description}</p>}
              <div className="flex gap-4 text-xs text-muted">
                <span className="flex items-center gap-1"><User size={14} /> {getAttorneyName(c.assignedAttorney)}</span>
                <span>Priority: <span className="capitalize font-medium">{c.priority || "normal"}</span></span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!viewMatter} onClose={() => setViewMatter(null)} title={viewMatter?.title || "Case Details"} size="lg">
        {viewMatter && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted">Case Number:</span><div className="font-medium">{viewMatter.caseNumber || "—"}</div></div>
              <div><span className="text-muted">Status:</span><div className="font-medium capitalize">{viewMatter.status}</div></div>
              <div><span className="text-muted">Practice Area:</span><div className="font-medium">{viewMatter.practiceArea || "—"}</div></div>
              <div><span className="text-muted">Priority:</span><div className="font-medium capitalize">{viewMatter.priority || "normal"}</div></div>
              <div><span className="text-muted">Attorney:</span><div className="font-medium">{getAttorneyName(viewMatter.assignedAttorney)}</div></div>
              <div><span className="text-muted">Billing Type:</span><div className="font-medium capitalize">{viewMatter.billingType || "hourly"}</div></div>
            </div>
            <div><span className="text-muted text-sm">Description:</span><p className="text-sm mt-1">{viewMatter.description || "No description provided."}</p></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
