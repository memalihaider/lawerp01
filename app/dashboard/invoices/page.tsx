"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, DollarSign, FileText, Send, Eye } from "lucide-react";
import { sampleInvoices } from "@/lib/mock-data";

export default function InvoicesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = sampleInvoices.filter((inv) => {
    const matchesSearch =
      inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.matterTitle.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalOutstanding = sampleInvoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((s, i) => s + i.total, 0);
  const totalPaid = sampleInvoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + i.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted text-sm">Manage and track client invoices</p>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Create Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="text-sm text-muted mb-1">Total Invoices</div>
          <div className="text-2xl font-bold text-foreground">{sampleInvoices.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="text-sm text-muted mb-1">Outstanding</div>
          <div className="text-2xl font-bold text-warning">${totalOutstanding.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="text-sm text-muted mb-1">Collected</div>
          <div className="text-2xl font-bold text-success">${totalPaid.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="text-sm text-muted mb-1">Overdue</div>
          <div className="text-2xl font-bold text-danger">
            {sampleInvoices.filter((i) => i.status === "overdue").length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-border p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-2">
          {["all", "draft", "sent", "paid", "overdue"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                statusFilter === s ? "bg-primary text-white" : "bg-muted-light text-muted hover:bg-primary/5"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted-light border-b border-border text-left text-muted">
                <th className="py-3 px-4 font-medium">Invoice #</th>
                <th className="py-3 px-4 font-medium">Client</th>
                <th className="py-3 px-4 font-medium">Matter</th>
                <th className="py-3 px-4 font-medium">Issue Date</th>
                <th className="py-3 px-4 font-medium">Due Date</th>
                <th className="py-3 px-4 font-medium">Amount</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr key={inv.id} className="border-b border-border/50 hover:bg-muted-light/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs">{inv.invoiceNumber}</td>
                  <td className="py-3 px-4 font-medium">{inv.clientName}</td>
                  <td className="py-3 px-4 text-muted">{inv.matterTitle}</td>
                  <td className="py-3 px-4 text-muted">{inv.issueDate}</td>
                  <td className="py-3 px-4 text-muted">{inv.dueDate}</td>
                  <td className="py-3 px-4 font-semibold">${inv.total.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs px-2 py-1 rounded font-medium ${
                        inv.status === "paid"
                          ? "bg-success/10 text-success"
                          : inv.status === "sent"
                          ? "bg-info/10 text-info"
                          : inv.status === "overdue"
                          ? "bg-danger/10 text-danger"
                          : "bg-muted-light text-muted"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-muted hover:text-primary transition-colors" title="View">
                        <Eye size={16} />
                      </button>
                      {inv.status === "draft" && (
                        <button className="p-1 text-muted hover:text-success transition-colors" title="Send">
                          <Send size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
