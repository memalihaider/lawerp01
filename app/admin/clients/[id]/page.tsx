"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Edit2, Trash2, User, Briefcase, DollarSign, FileText,
  MessageSquare, Phone, Mail, Building, Save, Calendar,
} from "lucide-react";
import { useRealtimeDocument, useRealtimeCollection } from "@/lib/hooks";
import { updateDocument, deleteDocument, orderBy, where } from "@/lib/firebase-service";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

export default function ClientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const { data: client, loading } = useRealtimeDocument("users", id as string);
  const { data: matters } = useRealtimeCollection("matters", [where("clientId", "==", id as string), orderBy("createdAt", "desc")]);
  const { data: invoices } = useRealtimeCollection("invoices", [where("clientId", "==", id as string), orderBy("issueDate", "desc")]);
  const { data: documents } = useRealtimeCollection("documents", [where("clientId", "==", id as string), orderBy("uploadedAt", "desc")]);

  const [editing, setEditing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [tab, setTab] = useState<"overview" | "matters" | "invoices" | "documents">("overview");

  const c = client as Record<string, unknown> | null;

  const [editForm, setEditForm] = useState<Record<string, string>>({});

  function startEdit() {
    if (!c) return;
    setEditForm({
      displayName: (c.displayName as string) || "",
      email: (c.email as string) || "",
      phone: (c.phone as string) || "",
      company: (c.company as string) || "",
      address: (c.address as string) || "",
    });
    setEditing(true);
  }

  async function saveEdit() {
    if (!c) return;
    try {
      await updateDocument("users", c.id as string, editForm);
      toast("success", "Client updated");
      setEditing(false);
    } catch { toast("error", "Failed to update"); }
  }

  async function handleDelete() {
    if (!c) return;
    try {
      await deleteDocument("users", c.id as string);
      toast("success", "Client deleted");
      router.push("/admin/clients");
    } catch { toast("error", "Failed to delete"); }
  }

  // Stats from real data
  const totalInvoiced = useMemo(() => invoices.reduce((s: number, i: Record<string, unknown>) => s + (Number(i.total) || 0), 0), [invoices]);
  const totalPaid = useMemo(() => invoices.filter((i: Record<string, unknown>) => i.status === "paid").reduce((s: number, i: Record<string, unknown>) => s + (Number(i.total) || 0), 0), [invoices]);
  const outstanding = totalInvoiced - totalPaid;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  if (!c) {
    return (
      <div className="text-center py-20">
        <User size={48} className="mx-auto mb-4 text-muted opacity-40" />
        <h2 className="text-xl font-bold text-foreground mb-2">Client not found</h2>
        <Link href="/admin/clients" className="text-primary hover:underline text-sm">Back to Clients</Link>
      </div>
    );
  }

  const tabs = [
    { key: "overview", label: "Overview", icon: User },
    { key: "matters", label: `Matters (${matters.length})`, icon: Briefcase },
    { key: "invoices", label: `Invoices (${invoices.length})`, icon: DollarSign },
    { key: "documents", label: `Documents (${documents.length})`, icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/admin/clients" className="mt-1 p-2 hover:bg-muted-light rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-muted" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{c.displayName as string}</h1>
            <p className="text-sm text-muted">{(c.company as string) || "Individual Client"} · {(c.email as string) || ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={startEdit} className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted-light transition-colors">
            <Edit2 size={14} /> Edit
          </button>
          <button onClick={() => setDeleteConfirm(true)} className="flex items-center gap-2 px-3 py-2 border border-danger/30 text-danger rounded-lg text-sm hover:bg-danger/10 transition-colors">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="text-xs text-muted mb-1">Active Matters</div>
          <div className="text-xl font-bold text-foreground">{matters.filter((m: Record<string, unknown>) => m.status === "active" || m.status === "open").length}</div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="text-xs text-muted mb-1">Total Invoiced</div>
          <div className="text-xl font-bold text-foreground">${totalInvoiced.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="text-xs text-muted mb-1">Total Paid</div>
          <div className="text-xl font-bold text-success">${totalPaid.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="text-xs text-muted mb-1">Outstanding</div>
          <div className={`text-xl font-bold ${outstanding > 0 ? "text-warning" : "text-foreground"}`}>${outstanding.toLocaleString()}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-1 -mb-px">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground"
              }`}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-border p-5 space-y-4">
            <h3 className="font-semibold text-foreground">Contact Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3"><Mail size={16} className="text-muted" /><span>{(c.email as string) || "—"}</span></div>
              <div className="flex items-center gap-3"><Phone size={16} className="text-muted" /><span>{(c.phone as string) || "—"}</span></div>
              <div className="flex items-center gap-3"><Building size={16} className="text-muted" /><span>{(c.company as string) || "—"}</span></div>
              <div className="flex items-center gap-3"><Calendar size={16} className="text-muted" /><span>Joined: {(c.createdAt as string) || "—"}</span></div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-3">Recent Activity</h3>
            {matters.length > 0 ? (
              <div className="space-y-3">
                {matters.slice(0, 5).map((m: Record<string, unknown>) => (
                  <Link key={m.id as string} href={`/admin/matters/${m.id}`} className="flex items-center justify-between py-2 hover:bg-muted-light/50 rounded-lg px-2 transition-colors">
                    <div className="text-sm font-medium text-foreground">{m.title as string}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      m.status === "active" ? "bg-success/10 text-success" : m.status === "open" ? "bg-info/10 text-info" : "bg-muted-light text-muted"
                    }`}>{m.status as string}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted py-4 text-center">No matters found</p>
            )}
          </div>
        </div>
      )}

      {tab === "matters" && (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          {matters.length === 0 ? (
            <div className="py-12 text-center text-muted text-sm">No matters for this client</div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted-light/30">
                <th className="text-left px-4 py-3 font-medium text-muted">Matter</th>
                <th className="text-left px-4 py-3 font-medium text-muted hidden md:table-cell">Practice Area</th>
                <th className="text-left px-4 py-3 font-medium text-muted">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted hidden md:table-cell">Attorney</th>
              </tr></thead>
              <tbody>
                {matters.map((m: Record<string, unknown>) => (
                  <tr key={m.id as string} className="border-b border-border last:border-0 hover:bg-muted-light/20">
                    <td className="px-4 py-3">
                      <Link href={`/admin/matters/${m.id}`} className="font-medium text-primary hover:underline">{m.title as string}</Link>
                      <div className="text-xs text-muted">{(m.caseNumber || m.id) as string}</div>
                    </td>
                    <td className="px-4 py-3 text-muted hidden md:table-cell">{(m.practiceArea || "—") as string}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${
                      m.status === "active" ? "bg-success/10 text-success" : m.status === "open" ? "bg-info/10 text-info" : "bg-muted-light text-muted"
                    }`}>{m.status as string}</span></td>
                    <td className="px-4 py-3 text-muted hidden md:table-cell">{(m.assignedAttorneyName || "—") as string}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "invoices" && (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          {invoices.length === 0 ? (
            <div className="py-12 text-center text-muted text-sm">No invoices for this client</div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted-light/30">
                <th className="text-left px-4 py-3 font-medium text-muted">Invoice #</th>
                <th className="text-left px-4 py-3 font-medium text-muted hidden md:table-cell">Matter</th>
                <th className="text-left px-4 py-3 font-medium text-muted">Date</th>
                <th className="text-right px-4 py-3 font-medium text-muted">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-muted">Status</th>
              </tr></thead>
              <tbody>
                {invoices.map((i: Record<string, unknown>) => (
                  <tr key={i.id as string} className="border-b border-border last:border-0 hover:bg-muted-light/20">
                    <td className="px-4 py-3 font-medium">{(i.invoiceNumber || i.id) as string}</td>
                    <td className="px-4 py-3 text-muted hidden md:table-cell">{(i.matterTitle || "—") as string}</td>
                    <td className="px-4 py-3 text-muted">{(i.issueDate || "—") as string}</td>
                    <td className="px-4 py-3 text-right font-medium">${Number(i.total).toLocaleString()}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${
                      i.status === "paid" ? "bg-success/10 text-success" : i.status === "overdue" ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning"
                    }`}>{i.status as string}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "documents" && (
        <div className="bg-white rounded-xl border border-border">
          {documents.length === 0 ? (
            <div className="py-12 text-center text-muted text-sm">No documents for this client</div>
          ) : (
            <div className="divide-y divide-border">
              {documents.map((d: Record<string, unknown>) => (
                <div key={d.id as string} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-muted" />
                    <div>
                      <div className="text-sm font-medium text-foreground">{d.name as string}</div>
                      <div className="text-xs text-muted">{(d.category || "") as string} · {(d.uploadedAt || "") as string}</div>
                    </div>
                  </div>
                  {d.url ? <a href={d.url as string} target="_blank" rel="noopener noreferrer" className="text-primary text-xs hover:underline">Download</a> : null}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <Modal isOpen={editing} onClose={() => setEditing(false)} title="Edit Client" size="md">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-foreground mb-1">Name</label>
            <input value={editForm.displayName || ""} onChange={(e) => setEditForm((f) => ({ ...f, displayName: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" /></div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input value={editForm.email || ""} disabled
              className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-muted-light/50 text-muted" /></div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Phone</label>
            <input value={editForm.phone || ""} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" /></div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Company</label>
            <input value={editForm.company || ""} onChange={(e) => setEditForm((f) => ({ ...f, company: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" /></div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Address</label>
            <textarea value={editForm.address || ""} onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))} rows={2}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" /></div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm rounded-lg border border-border text-muted hover:bg-muted-light transition-colors">Cancel</button>
          <button onClick={saveEdit} className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary-light transition-colors"><Save size={14} className="inline mr-1" />Save</button>
        </div>
      </Modal>

      <ConfirmModal isOpen={deleteConfirm} onClose={() => setDeleteConfirm(false)} onConfirm={handleDelete}
        title="Delete Client" message="This will remove the client profile. Are you sure?" confirmLabel="Delete" variant="danger" />
    </div>
  );
}
