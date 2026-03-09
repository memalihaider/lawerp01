"use client";

import { useState, useMemo } from "react";
import { Plus, Send, Eye, Trash2, DollarSign, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useInvoices, useMatters, useClients } from "@/lib/hooks";
import { createDocument, updateDocument, deleteDocument, serverTimestamp } from "@/lib/firebase-service";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted-light text-muted-dark",
  sent: "bg-info/10 text-info",
  paid: "bg-success/10 text-success",
  overdue: "bg-danger/10 text-danger",
  cancelled: "bg-muted-light text-muted",
};

export default function InvoicesPage() {
  const { data: invoices, loading } = useInvoices();
  const { data: matters } = useMatters();
  const { data: clients } = useClients();
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] = useState("all");
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewInvoice, setViewInvoice] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({ matterId: "", clientId: "", clientName: "", items: [{ description: "", hours: 0, rate: 350, amount: 0 }], notes: "", dueDate: "" });

  const filtered = useMemo(() => {
    if (statusFilter === "all") return invoices;
    return invoices.filter((i: Record<string, unknown>) => i.status === statusFilter);
  }, [invoices, statusFilter]);

  const totalPaid = useMemo(() => invoices.filter((i: Record<string, unknown>) => i.status === "paid").reduce((s: number, i: Record<string, unknown>) => s + Number(i.total || 0), 0), [invoices]);
  const totalOutstanding = useMemo(() => invoices.filter((i: Record<string, unknown>) => i.status === "sent" || i.status === "overdue").reduce((s: number, i: Record<string, unknown>) => s + Number(i.total || 0), 0), [invoices]);
  const totalOverdue = useMemo(() => invoices.filter((i: Record<string, unknown>) => i.status === "overdue").reduce((s: number, i: Record<string, unknown>) => s + Number(i.total || 0), 0), [invoices]);

  function updateItem(idx: number, field: string, value: string | number) {
    setForm((f) => {
      const items = [...f.items];
      (items[idx] as Record<string, unknown>)[field] = value;
      items[idx].amount = items[idx].hours * items[idx].rate;
      return { ...f, items };
    });
  }

  function addItem() {
    setForm((f) => ({ ...f, items: [...f.items, { description: "", hours: 0, rate: 350, amount: 0 }] }));
  }

  async function handleCreate() {
    if (!form.clientId) { toast("error", "Select a client"); return; }
    setSaving(true);
    const total = form.items.reduce((s, i) => s + i.amount, 0);
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    try {
      await createDocument("invoices", {
        invoiceNumber, matterId: form.matterId, clientId: form.clientId, clientName: form.clientName,
        items: form.items, total, subtotal: total, tax: 0, notes: form.notes,
        status: "draft", issueDate: new Date().toISOString().split("T")[0], dueDate: form.dueDate,
        createdAt: serverTimestamp(),
      });
      toast("success", "Invoice created");
      setShowNew(false);
    } catch { toast("error", "Failed to create invoice"); }
    finally { setSaving(false); }
  }

  async function markAsSent(id: string) {
    try { await updateDocument("invoices", id, { status: "sent" }); toast("success", "Invoice sent"); } catch { toast("error", "Failed"); }
  }

  async function markAsPaid(id: string) {
    try { await updateDocument("invoices", id, { status: "paid", paidDate: new Date().toISOString().split("T")[0] }); toast("success", "Marked as paid"); } catch { toast("error", "Failed"); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try { await deleteDocument("invoices", deleteId); toast("success", "Invoice deleted"); } catch { toast("error", "Failed to delete"); }
    setDeleteId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Invoices</h1><p className="text-muted text-sm">{filtered.length} invoice{filtered.length !== 1 ? "s" : ""}</p></div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"><Plus size={16} /> New Invoice</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-border p-4"><div className="flex items-center gap-2 mb-1"><CheckCircle size={16} className="text-success" /><span className="text-sm text-muted">Paid</span></div><div className="text-2xl font-bold text-foreground">${totalPaid.toLocaleString()}</div></div>
        <div className="bg-white rounded-xl border border-border p-4"><div className="flex items-center gap-2 mb-1"><Clock size={16} className="text-info" /><span className="text-sm text-muted">Outstanding</span></div><div className="text-2xl font-bold text-foreground">${totalOutstanding.toLocaleString()}</div></div>
        <div className="bg-white rounded-xl border border-border p-4"><div className="flex items-center gap-2 mb-1"><AlertCircle size={16} className="text-danger" /><span className="text-sm text-muted">Overdue</span></div><div className="text-2xl font-bold text-foreground">${totalOverdue.toLocaleString()}</div></div>
      </div>

      <div className="flex gap-2">
        {["all", "draft", "sent", "paid", "overdue"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${statusFilter === s ? "bg-primary text-white" : "bg-white border border-border text-muted hover:bg-muted-light/50"}`}>{s}</button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted-light/30">
            <th className="text-left px-4 py-3 font-medium text-muted">Invoice #</th>
            <th className="text-left px-4 py-3 font-medium text-muted">Client</th>
            <th className="text-left px-4 py-3 font-medium text-muted hidden md:table-cell">Date</th>
            <th className="text-left px-4 py-3 font-medium text-muted hidden lg:table-cell">Due</th>
            <th className="text-right px-4 py-3 font-medium text-muted">Amount</th>
            <th className="text-left px-4 py-3 font-medium text-muted">Status</th>
            <th className="text-right px-4 py-3 font-medium text-muted">Actions</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} className="text-center py-12 text-muted">Loading...</td></tr> :
             filtered.length === 0 ? <tr><td colSpan={7} className="text-center py-12 text-muted">No invoices found</td></tr> :
             filtered.map((inv: Record<string, unknown>) => (
              <tr key={inv.id as string} className="border-b border-border last:border-0 hover:bg-muted-light/20">
                <td className="px-4 py-3 font-mono text-xs">{inv.invoiceNumber as string}</td>
                <td className="px-4 py-3 font-medium text-foreground">{inv.clientName as string}</td>
                <td className="px-4 py-3 text-muted hidden md:table-cell">{inv.issueDate as string}</td>
                <td className="px-4 py-3 text-muted hidden lg:table-cell">{inv.dueDate as string}</td>
                <td className="px-4 py-3 text-right font-medium">${Number(inv.total).toLocaleString()}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[inv.status as string] || ""}`}>{inv.status as string}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => setViewInvoice(inv)} className="p-1.5 rounded hover:bg-muted-light text-muted hover:text-primary transition-colors"><Eye size={14} /></button>
                    {inv.status === "draft" && <button onClick={() => markAsSent(inv.id as string)} className="p-1.5 rounded hover:bg-info/10 text-muted hover:text-info transition-colors"><Send size={14} /></button>}
                    {(inv.status === "sent" || inv.status === "overdue") && <button onClick={() => markAsPaid(inv.id as string)} className="p-1.5 rounded hover:bg-success/10 text-muted hover:text-success transition-colors"><DollarSign size={14} /></button>}
                    <button onClick={() => setDeleteId(inv.id as string)} className="p-1.5 rounded hover:bg-danger/10 text-muted hover:text-danger transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      <Modal isOpen={!!viewInvoice} onClose={() => setViewInvoice(null)} title={`Invoice ${viewInvoice?.invoiceNumber || ""}`} size="lg">
        {viewInvoice && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted">Client:</span> <strong>{viewInvoice.clientName as string}</strong></div>
              <div><span className="text-muted">Status:</span> <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${STATUS_COLORS[viewInvoice.status as string] || ""}`}>{viewInvoice.status as string}</span></div>
              <div><span className="text-muted">Issue Date:</span> {viewInvoice.issueDate as string}</div>
              <div><span className="text-muted">Due Date:</span> {viewInvoice.dueDate as string}</div>
            </div>
            {Array.isArray(viewInvoice.items) && (
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead><tr className="bg-muted-light/30"><th className="text-left px-3 py-2">Description</th><th className="text-right px-3 py-2">Hours</th><th className="text-right px-3 py-2">Rate</th><th className="text-right px-3 py-2">Amount</th></tr></thead>
                <tbody>{(viewInvoice.items as Record<string, unknown>[]).map((it, i) => (
                  <tr key={i} className="border-t border-border"><td className="px-3 py-2">{it.description as string}</td><td className="px-3 py-2 text-right">{String(it.hours)}</td><td className="px-3 py-2 text-right">${String(it.rate)}</td><td className="px-3 py-2 text-right font-medium">${Number(it.amount).toLocaleString()}</td></tr>
                ))}</tbody>
              </table>
            )}
            <div className="text-right text-lg font-bold">Total: ${Number(viewInvoice.total).toLocaleString()}</div>
          </div>
        )}
      </Modal>

      {/* New Invoice Modal */}
      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title="Create Invoice" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-foreground mb-1">Client *</label>
              <select value={form.clientId} onChange={(e) => { const c = clients.find((c) => c.id === e.target.value) as Record<string, unknown> | undefined; setForm((f) => ({ ...f, clientId: e.target.value, clientName: c ? String(c.displayName || c.name || "") : "" })); }}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none"><option value="">Select...</option>
                {clients.map((c) => { const r = c as Record<string, unknown>; return <option key={c.id} value={c.id}>{String(r.displayName || r.name || c.id)}</option>; })}
              </select></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Due Date</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Line Items</label>
            {form.items.map((it, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                <input placeholder="Description" value={it.description} onChange={(e) => updateItem(i, "description", e.target.value)} className="col-span-2 px-3 py-2 rounded-lg border border-border text-sm outline-none" />
                <input type="number" placeholder="Hours" value={it.hours || ""} onChange={(e) => updateItem(i, "hours", Number(e.target.value))} className="px-3 py-2 rounded-lg border border-border text-sm outline-none" />
                <input type="number" placeholder="Rate" value={it.rate || ""} onChange={(e) => updateItem(i, "rate", Number(e.target.value))} className="px-3 py-2 rounded-lg border border-border text-sm outline-none" />
              </div>
            ))}
            <button onClick={addItem} className="text-xs text-primary hover:underline">+ Add line item</button>
          </div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none resize-none" /></div>
          <div className="text-right font-bold">Total: ${form.items.reduce((s, i) => s + i.amount, 0).toLocaleString()}</div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm rounded-lg border border-border text-muted hover:bg-muted-light transition-colors">Cancel</button>
          <button onClick={handleCreate} disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary-light transition-colors disabled:opacity-50">{saving ? "Creating..." : "Create Invoice"}</button>
        </div>
      </Modal>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Invoice" message="This will permanently delete this invoice." confirmLabel="Delete" variant="danger" />
    </div>
  );
}
