"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRealtimeCollection } from "@/lib/hooks";
import { where } from "@/lib/firebase-service";
import { Modal } from "@/components/ui/Modal";
import { CreditCard, Eye, CheckCircle, Clock, AlertCircle } from "lucide-react";

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  paid: { icon: CheckCircle, color: "bg-green-100 text-green-700", label: "Paid" },
  pending: { icon: Clock, color: "bg-blue-100 text-blue-700", label: "Pending" },
  overdue: { icon: AlertCircle, color: "bg-red-100 text-red-700", label: "Overdue" },
  sent: { icon: Clock, color: "bg-yellow-100 text-yellow-700", label: "Sent" },
  draft: { icon: Clock, color: "bg-gray-100 text-gray-600", label: "Draft" },
};

export default function PortalInvoicesPage() {
  const { profile } = useAuth();
  const userId = profile?.uid || "";
  const { data: invoices, loading } = useRealtimeCollection("invoices", userId ? [where("clientId", "==", userId)] : undefined);
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewInvoice, setViewInvoice] = useState<any>(null);

  const filtered = invoices.filter((i: any) => statusFilter === "all" || i.status === statusFilter);
  const totalBilled = invoices.reduce((s: number, i: any) => s + (i.total || i.amount || 0), 0);
  const totalOutstanding = invoices.filter((i: any) => i.status !== "paid").reduce((s: number, i: any) => s + (i.total || i.amount || 0), 0);
  const totalPaid = invoices.filter((i: any) => i.status === "paid").reduce((s: number, i: any) => s + (i.total || i.amount || 0), 0);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Invoices & Billing</h1><p className="text-muted text-sm">View and manage your invoices</p></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-border p-4"><div className="text-sm text-muted mb-1">Total Billed</div><div className="text-2xl font-bold text-foreground">${totalBilled.toLocaleString()}</div></div>
        <div className="bg-white rounded-xl border border-border p-4"><div className="text-sm text-muted mb-1">Outstanding</div><div className="text-2xl font-bold text-red-600">${totalOutstanding.toLocaleString()}</div></div>
        <div className="bg-white rounded-xl border border-border p-4"><div className="text-sm text-muted mb-1">Paid</div><div className="text-2xl font-bold text-green-600">${totalPaid.toLocaleString()}</div></div>
      </div>

      <div className="flex gap-2">
        {["all", "pending", "sent", "overdue", "paid"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${statusFilter === s ? "bg-primary text-white" : "bg-white border border-border text-muted hover:bg-muted-light"}`}>{s}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center"><CreditCard size={40} className="mx-auto text-muted mb-3" /><p className="text-muted">No invoices found.</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inv: any) => {
            const sc = statusConfig[inv.status] || statusConfig.pending;
            return (
              <div key={inv.id} onClick={() => setViewInvoice(inv)} className="bg-white rounded-xl border border-border p-5 cursor-pointer hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <CreditCard size={18} className="text-primary" />
                    <div><h3 className="font-semibold text-foreground text-sm">{inv.invoiceNumber || inv.id}</h3><span className="text-xs text-muted">{inv.matterTitle || "—"}</span></div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1 ${sc.color}`}><sc.icon size={12} /> {sc.label}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-2xl font-bold text-foreground">${(inv.total || inv.amount || 0).toLocaleString()}</span>
                  <div className="text-xs text-muted text-right">{inv.dueDate && <div>Due: {inv.dueDate}</div>}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={!!viewInvoice} onClose={() => setViewInvoice(null)} title={`Invoice ${viewInvoice?.invoiceNumber || viewInvoice?.id || ""}`} size="lg">
        {viewInvoice && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted">Status:</span><div className="font-medium capitalize">{viewInvoice.status}</div></div>
              <div><span className="text-muted">Due Date:</span><div className="font-medium">{viewInvoice.dueDate || "—"}</div></div>
            </div>
            {viewInvoice.items?.length > 0 && (
              <div className="border-t border-border pt-3">
                <h4 className="text-xs font-semibold text-muted mb-2">LINE ITEMS</h4>
                {viewInvoice.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-xs py-1.5 border-b border-border/50">
                    <span className="text-foreground">{item.description || item.desc}</span>
                    <span className="font-medium">${(item.amount || item.total || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between font-bold text-sm border-t border-border pt-3"><span>Total</span><span>${(viewInvoice.total || viewInvoice.amount || 0).toLocaleString()}</span></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
