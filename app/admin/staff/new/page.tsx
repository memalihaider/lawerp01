"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDocument, serverTimestamp } from "@/lib/firebase-service";
import { useToast } from "@/components/ui/Toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const ROLES = ["attorney", "partner", "paralegal", "staff", "admin"];

export default function NewStaffPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", role: "attorney",
    title: "", barNumber: "", practiceArea: "", bio: "", status: "active",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
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
      toast("success", "Staff member added");
      router.push("/admin/staff");
    } catch { toast("error", "Failed to add staff member"); }
    finally { setSaving(false); }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/staff" className="p-2 rounded-lg hover:bg-muted-light transition-colors text-muted"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add Staff Member</h1>
          <p className="text-muted text-sm">Add to the team</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-foreground mb-1">First Name *</label>
            <input name="firstName" value={form.firstName} onChange={handleChange} required className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" /></div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Last Name *</label>
            <input name="lastName" value={form.lastName} onChange={handleChange} required className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-foreground mb-1">Email *</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" /></div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-foreground mb-1">Role</label>
            <select name="role" value={form.role} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none capitalize">
              {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select></div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Job Title</label>
            <input name="title" value={form.title} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="e.g. Senior Partner" /></div>
        </div>
        {(form.role === "attorney" || form.role === "partner") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-foreground mb-1">Bar Number</label>
              <input name="barNumber" value={form.barNumber} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Practice Area</label>
              <input name="practiceArea" value={form.practiceArea} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" /></div>
          </div>
        )}
        <div><label className="block text-sm font-medium text-foreground mb-1">Bio</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" /></div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Link href="/admin/staff" className="px-4 py-2 text-sm rounded-lg border border-border text-muted hover:bg-muted-light transition-colors">Cancel</Link>
          <button type="submit" disabled={saving} className="px-6 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary-light transition-colors disabled:opacity-50">
            {saving ? "Saving..." : "Add Staff"}
          </button>
        </div>
      </form>
    </div>
  );
}
