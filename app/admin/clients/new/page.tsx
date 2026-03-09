"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDocument, serverTimestamp } from "@/lib/firebase-service";
import { useToast } from "@/components/ui/Toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewClientPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", company: "",
    address: "", city: "", state: "", zip: "", notes: "", role: "client", status: "active",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email) {
      toast("error", "Name and email are required");
      return;
    }
    setSaving(true);
    try {
      await createDocument("users", { ...form, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      toast("success", "Client added successfully");
      router.push("/admin/clients");
    } catch {
      toast("error", "Failed to add client");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/clients" className="p-2 rounded-lg hover:bg-muted-light transition-colors text-muted"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add Client</h1>
          <p className="text-muted text-sm">Create a new client record</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">First Name *</label>
            <input name="firstName" value={form.firstName} onChange={handleChange} required className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Last Name *</label>
            <input name="lastName" value={form.lastName} onChange={handleChange} required className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email *</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Company</label>
          <input name="company" value={form.company} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Address</label>
          <input name="address" value={form.address} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">City</label>
            <input name="city" value={form.city} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">State</label>
            <input name="state" value={form.state} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">ZIP</label>
            <input name="zip" value={form.zip} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Link href="/admin/clients" className="px-4 py-2 text-sm rounded-lg border border-border text-muted hover:bg-muted-light transition-colors">Cancel</Link>
          <button type="submit" disabled={saving} className="px-6 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary-light transition-colors disabled:opacity-50">
            {saving ? "Saving..." : "Add Client"}
          </button>
        </div>
      </form>
    </div>
  );
}
