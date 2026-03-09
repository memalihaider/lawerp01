"use client";

import { useState, useMemo } from "react";
import { useUsers } from "@/lib/hooks";
import { updateDocument } from "@/lib/firebase-service";
import { useToast } from "@/components/ui/Toast";
import { Shield, Check, X } from "lucide-react";

const ROLES = ["admin", "partner", "attorney", "paralegal", "staff"];
const PERMISSIONS = [
  { key: "manageMatters", label: "Manage Matters", desc: "Create, edit, and delete matters" },
  { key: "manageBilling", label: "Manage Billing", desc: "View and manage time entries, invoices" },
  { key: "manageClients", label: "Manage Clients", desc: "View and manage client records" },
  { key: "manageDocuments", label: "Manage Documents", desc: "Upload, edit, delete documents" },
  { key: "manageStaff", label: "Manage Staff", desc: "Add, edit, remove team members" },
  { key: "viewReports", label: "View Reports", desc: "Access firm analytics and reports" },
  { key: "manageCMS", label: "Website CMS", desc: "Edit website content and settings" },
  { key: "manageSettings", label: "System Settings", desc: "Modify firm-wide settings" },
];

const DEFAULT_PERMS: Record<string, string[]> = {
  admin: PERMISSIONS.map((p) => p.key),
  partner: ["manageMatters", "manageBilling", "manageClients", "manageDocuments", "viewReports"],
  attorney: ["manageMatters", "manageBilling", "manageClients", "manageDocuments"],
  paralegal: ["manageMatters", "manageDocuments"],
  staff: ["manageDocuments"],
};

export default function RolesPage() {
  const { data: allUsers } = useUsers();
  const { toast } = useToast();
  const staff = useMemo(() => allUsers.filter((u: Record<string, unknown>) => u.role !== "client"), [allUsers]);
  const [selectedRole, setSelectedRole] = useState("admin");
  const [perms, setPerms] = useState<Record<string, string[]>>(DEFAULT_PERMS);

  function togglePerm(role: string, key: string) {
    setPerms((p) => {
      const current = p[role] || [];
      return { ...p, [role]: current.includes(key) ? current.filter((k) => k !== key) : [...current, key] };
    });
  }

  async function handleSave() {
    // Update all staff users with their role's permissions
    const usersWithRole = staff.filter((u: Record<string, unknown>) => u.role === selectedRole);
    try {
      for (const u of usersWithRole) {
        await updateDocument("users", u.id as string, { permissions: perms[selectedRole] });
      }
      toast("success", `Permissions updated for ${selectedRole}s`);
    } catch {
      toast("error", "Failed to update permissions");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Roles & Permissions</h1>
        <p className="text-muted text-sm">Configure access for each role</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {ROLES.map((r) => (
          <button key={r} onClick={() => setSelectedRole(r)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${selectedRole === r ? "bg-primary text-white" : "bg-white border border-border text-muted hover:bg-muted-light/50"}`}>
            <Shield size={14} className="inline mr-1.5" />{r} ({staff.filter((u: Record<string, unknown>) => u.role === r).length})
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted-light/30">
              <th className="text-left px-4 py-3 font-medium text-muted">Permission</th>
              <th className="text-left px-4 py-3 font-medium text-muted hidden md:table-cell">Description</th>
              <th className="text-center px-4 py-3 font-medium text-muted">Enabled</th>
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS.map((p) => (
              <tr key={p.key} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">{p.label}</td>
                <td className="px-4 py-3 text-muted hidden md:table-cell">{p.desc}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => togglePerm(selectedRole, p.key)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-colors ${
                      (perms[selectedRole] || []).includes(p.key) ? "bg-success/10 text-success" : "bg-muted-light text-muted"
                    }`}>
                    {(perms[selectedRole] || []).includes(p.key) ? <Check size={16} /> : <X size={16} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} className="px-6 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary-light transition-colors">Save Permissions</button>
      </div>
    </div>
  );
}
