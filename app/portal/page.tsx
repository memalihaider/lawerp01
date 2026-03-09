"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRealtimeCollection } from "@/lib/hooks";
import { where } from "@/lib/firebase-service";
import { Briefcase, FileText, MessageSquare, CreditCard, Clock, AlertCircle, CheckCircle } from "lucide-react";

export default function PortalDashboard() {
  const { profile } = useAuth();
  const userId = profile?.uid || "";

  const { data: matters, loading } = useRealtimeCollection("matters", userId ? [where("clientId", "==", userId)] : undefined);
  const { data: documents } = useRealtimeCollection("documents", userId ? [where("clientId", "==", userId)] : undefined);
  const { data: invoices } = useRealtimeCollection("invoices", userId ? [where("clientId", "==", userId)] : undefined);
  const { data: allMessages } = useRealtimeCollection("messages", userId ? [where("receiverId", "==", userId)] : undefined);
  const { data: tasks } = useRealtimeCollection("tasks", userId ? [where("assignedTo", "==", userId)] : undefined);
  const { data: users } = useRealtimeCollection("users");

  const activeCases = matters.filter((m: any) => m.status === "active" || m.status === "open");
  const totalOutstanding = invoices.filter((i: any) => i.status !== "paid").reduce((s: number, i: any) => s + (i.total || i.amount || 0), 0);
  const pendingTasks = tasks.filter((t: any) => t.status !== "completed");

  const getAttorneyName = (id: string) => { const u = users.find((u) => u.id === id) as Record<string, any> | undefined; return u?.displayName || "—"; };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back, {profile?.displayName || "Client"}</h1>
        <p className="text-muted text-sm">Here&apos;s an overview of your legal matters</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Active Cases", value: activeCases.length, icon: Briefcase, color: "text-primary", bg: "bg-primary/10" },
          { label: "Documents", value: documents.length, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Messages", value: allMessages.length, icon: MessageSquare, color: "text-green-600", bg: "bg-green-50" },
          { label: "Outstanding", value: `$${totalOutstanding.toLocaleString()}`, icon: CreditCard, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-border p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}><stat.icon size={20} className={stat.color} /></div>
            <div><div className="text-xs text-muted">{stat.label}</div><div className="text-xl font-bold text-foreground">{stat.value}</div></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Active Cases</h2>
            <Link href="/portal/cases" className="text-xs text-primary hover:underline">View All</Link>
          </div>
          {activeCases.length === 0 ? <p className="text-muted text-sm">No active cases.</p> : (
            <div className="space-y-3">
              {activeCases.slice(0, 4).map((c: any) => (
                <div key={c.id} className="border border-border rounded-lg p-4 hover:bg-muted-light/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-foreground text-sm">{c.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 capitalize">{c.status}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted">
                    <span>Case: {c.caseNumber || "—"}</span>
                    <span>Attorney: {getAttorneyName(c.assignedAttorney)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <h2 className="font-semibold text-foreground mb-4">Action Items</h2>
          {pendingTasks.length === 0 ? <p className="text-muted text-sm">No pending action items.</p> : (
            <div className="space-y-3">
              {pendingTasks.slice(0, 5).map((t: any) => (
                <div key={t.id} className="flex items-center gap-3 text-sm">
                  <AlertCircle size={16} className={t.priority === "high" ? "text-red-500" : "text-yellow-500"} />
                  <span className="text-foreground">{t.title}</span>
                  {t.dueDate && <span className="text-xs text-muted ml-auto">Due: {t.dueDate}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Recent Documents</h2>
          <Link href="/portal/documents" className="text-xs text-primary hover:underline">View All</Link>
        </div>
        {documents.length === 0 ? <p className="text-muted text-sm">No documents.</p> : (
          <div className="space-y-2">
            {documents.slice(0, 5).map((doc: any) => (
              <div key={doc.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-primary" />
                  <div><div className="text-sm font-medium text-foreground">{doc.name}</div></div>
                </div>
                {doc.url && <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">View</a>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
