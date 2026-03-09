"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDocument, serverTimestamp } from "@/lib/firebase-service";
import { useClients, useUsers } from "@/lib/hooks";
import { useToast } from "@/components/ui/Toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const PRACTICE_AREAS = ["Corporate Law", "Litigation", "Family Law", "Estate Planning", "Real Estate", "Intellectual Property", "Criminal Defense", "Employment Law", "Tax Law", "Immigration"];
const PRIORITIES = ["low", "medium", "high", "urgent"];

export default function NewMatterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: clients } = useClients();
  const { data: users } = useUsers();
  const attorneys = users.filter((u: Record<string, unknown>) => ["admin", "partner", "attorney"].includes(u.role as string));

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    caseNumber: "",
    clientId: "",
    clientName: "",
    practiceArea: "",
    description: "",
    assignedAttorneyId: "",
    assignedAttorneyName: "",
    priority: "medium",
    status: "open",
    billingType: "hourly",
    hourlyRate: 350,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((f) => {
      const updated = { ...f, [name]: value };
      if (name === "clientId") {
        const c = clients.find((c) => c.id === value) as Record<string, unknown> | undefined;
        if (c) updated.clientName = String(c.displayName || c.name || "");
      }
      if (name === "assignedAttorneyId") {
        const a = attorneys.find((a) => a.id === value) as Record<string, unknown> | undefined;
        if (a) updated.assignedAttorneyName = String(a.displayName || a.name || "");
      }
      return updated;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.practiceArea) {
      toast("error", "Please fill in required fields");
      return;
    }
    setSaving(true);
    try {
      const caseNumber = form.caseNumber || `M-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
      await createDocument("matters", {
        ...form,
        caseNumber,
        hourlyRate: Number(form.hourlyRate),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast("success", "Matter created successfully");
      router.push("/admin/matters");
    } catch {
      toast("error", "Failed to create matter");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/matters" className="p-2 rounded-lg hover:bg-muted-light transition-colors text-muted">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">New Matter</h1>
          <p className="text-muted text-sm">Create a new case / matter</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
            <input name="title" value={form.title} onChange={handleChange} required className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="e.g. TechCorp Acquisition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Case Number</label>
            <input name="caseNumber" value={form.caseNumber} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Auto-generated if blank" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Client</label>
            <select name="clientId" value={form.clientId} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
              <option value="">Select client...</option>
              {clients.map((c) => { const r = c as Record<string, unknown>; return (
                <option key={c.id} value={c.id}>{String(r.displayName || r.name || r.firstName || c.id)}</option>
              ); })}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Practice Area *</label>
            <select name="practiceArea" value={form.practiceArea} onChange={handleChange} required className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
              <option value="">Select...</option>
              {PRACTICE_AREAS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" placeholder="Describe the matter..." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Assigned Attorney</label>
            <select name="assignedAttorneyId" value={form.assignedAttorneyId} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
              <option value="">Select...</option>
              {attorneys.map((a) => { const r = a as Record<string, unknown>; return (
                <option key={a.id} value={a.id}>{String(r.displayName || r.name || r.firstName || a.id)}</option>
              ); })}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Priority</label>
            <select name="priority" value={form.priority} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
              {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Billing Type</label>
            <select name="billingType" value={form.billingType} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
              <option value="hourly">Hourly</option>
              <option value="flat">Flat Fee</option>
              <option value="contingency">Contingency</option>
              <option value="retainer">Retainer</option>
            </select>
          </div>
        </div>

        {form.billingType === "hourly" && (
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-foreground mb-1">Hourly Rate ($)</label>
            <input type="number" name="hourlyRate" value={form.hourlyRate} onChange={handleChange} min={0} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Link href="/admin/matters" className="px-4 py-2 text-sm rounded-lg border border-border text-muted hover:bg-muted-light transition-colors">Cancel</Link>
          <button type="submit" disabled={saving} className="px-6 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary-light transition-colors disabled:opacity-50">
            {saving ? "Creating..." : "Create Matter"}
          </button>
        </div>
      </form>
    </div>
  );
}
