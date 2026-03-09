"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { attorneys, practiceAreas } from "@/lib/mock-data";

export default function NewMatterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    clientName: "",
    practiceArea: "",
    assignedAttorney: "",
    priority: "medium",
    description: "",
    courtName: "",
    opposingCounsel: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would save to Firestore
    router.push("/dashboard/matters");
  };

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/dashboard/matters"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors"
      >
        <ArrowLeft size={16} /> Back to Matters
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground">New Matter</h1>
        <p className="text-muted text-sm">Create a new case or matter in the system.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1">Matter Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-primary text-sm"
              placeholder="e.g., Smith v. Jones or ABC Corp Formation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Client Name *</label>
            <input
              type="text"
              required
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-primary text-sm"
              placeholder="Client name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Practice Area *</label>
            <select
              required
              value={form.practiceArea}
              onChange={(e) => setForm({ ...form, practiceArea: e.target.value })}
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-primary text-sm bg-white"
            >
              <option value="">Select practice area</option>
              {practiceAreas.map((a) => (
                <option key={a.slug} value={a.title}>{a.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Assigned Attorney *</label>
            <select
              required
              value={form.assignedAttorney}
              onChange={(e) => setForm({ ...form, assignedAttorney: e.target.value })}
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-primary text-sm bg-white"
            >
              <option value="">Select attorney</option>
              {attorneys.map((a) => (
                <option key={a.id} value={a.name}>{a.name} — {a.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-primary text-sm bg-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-primary text-sm resize-none"
              placeholder="Describe the matter..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Court (if applicable)</label>
            <input
              type="text"
              value={form.courtName}
              onChange={(e) => setForm({ ...form, courtName: e.target.value })}
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-primary text-sm"
              placeholder="Court name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Opposing Counsel</label>
            <input
              type="text"
              value={form.opposingCounsel}
              onChange={(e) => setForm({ ...form, opposingCounsel: e.target.value })}
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-primary text-sm"
              placeholder="Opposing counsel"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Link
            href="/dashboard/matters"
            className="px-6 py-2.5 border border-border rounded-lg text-sm font-medium text-muted hover:text-foreground transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Save size={16} /> Create Matter
          </button>
        </div>
      </form>
    </div>
  );
}
