"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Mail, Phone, Shield, Trash2 } from "lucide-react";
import { useUsers } from "@/lib/hooks";
import { deleteDocument, updateDocument } from "@/lib/firebase-service";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-danger/10 text-danger",
  partner: "bg-accent/20 text-accent-dark",
  attorney: "bg-primary/10 text-primary",
  paralegal: "bg-info/10 text-info",
  staff: "bg-muted-light text-muted-dark",
};
const ROLES = ["admin", "partner", "attorney", "paralegal", "staff"];

export default function StaffPage() {
  const { data: allUsers, loading } = useUsers();
  const staffUsers = useMemo(() => allUsers.filter((u: Record<string, unknown>) => u.role !== "client"), [allUsers]);
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editUser, setEditUser] = useState<Record<string, unknown> | null>(null);
  const [editRole, setEditRole] = useState("");

  const filtered = useMemo(() => {
    return staffUsers.filter((u: Record<string, unknown>) => {
      const q = search.toLowerCase();
      const nameMatch = !search || String(u.displayName || u.name || "").toLowerCase().includes(q) || (u.email as string)?.toLowerCase().includes(q);
      const roleMatch = roleFilter === "all" || u.role === roleFilter;
      return nameMatch && roleMatch;
    });
  }, [staffUsers, search, roleFilter]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteDocument("users", deleteId);
      toast("success", "Staff member removed");
    } catch { toast("error", "Failed to remove"); }
    finally { setDeleting(false); setDeleteId(null); }
  }

  async function handleRoleUpdate() {
    if (!editUser) return;
    try {
      await updateDocument("users", editUser.id as string, { role: editRole });
      toast("success", "Role updated");
      setEditUser(null);
    } catch { toast("error", "Failed to update role"); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff & Attorneys</h1>
          <p className="text-muted text-sm">{filtered.length} team member{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/staff/new" className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Add Staff
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input type="text" placeholder="Search staff..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setRoleFilter("all")} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${roleFilter === "all" ? "bg-primary text-white" : "bg-white border border-border text-muted hover:bg-muted-light/50"}`}>All</button>
          {ROLES.map((r) => (
            <button key={r} onClick={() => setRoleFilter(r)} className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${roleFilter === r ? "bg-primary text-white" : "bg-white border border-border text-muted hover:bg-muted-light/50"}`}>{r}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted-light/30">
              <th className="text-left px-4 py-3 font-medium text-muted">Name</th>
              <th className="text-left px-4 py-3 font-medium text-muted hidden md:table-cell">Email</th>
              <th className="text-left px-4 py-3 font-medium text-muted hidden lg:table-cell">Phone</th>
              <th className="text-left px-4 py-3 font-medium text-muted">Role</th>
              <th className="text-right px-4 py-3 font-medium text-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-muted">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-muted">No staff found</td></tr>
            ) : (
              filtered.map((u: Record<string, unknown>) => (
                <tr key={u.id as string} className="border-b border-border last:border-0 hover:bg-muted-light/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                        {String(u.displayName || u.name || "").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0,2) || "??"}
                      </div>
                      <div className="font-medium text-foreground">{String(u.displayName || u.name || "Unknown")}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted hidden md:table-cell">{u.email as string}</td>
                  <td className="px-4 py-3 text-muted hidden lg:table-cell">{u.phone as string}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setEditUser(u); setEditRole(u.role as string); }}
                      className={`text-xs px-2 py-0.5 rounded-full capitalize cursor-pointer ${ROLE_COLORS[u.role as string] || "bg-muted-light text-muted"}`}>
                      {u.role as string}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setDeleteId(u.id as string)} className="p-1.5 rounded hover:bg-danger/10 text-muted hover:text-danger transition-colors"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Change Role" size="sm">
        <p className="text-sm text-muted mb-3">Update role for <strong>{String((editUser as Record<string,unknown>)?.displayName || (editUser as Record<string,unknown>)?.name || "this user")}</strong></p>
        <select value={editRole} onChange={(e) => setEditRole(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none capitalize">
          {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
        </select>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={() => setEditUser(null)} className="px-4 py-2 text-sm rounded-lg border border-border text-muted hover:bg-muted-light transition-colors">Cancel</button>
          <button onClick={handleRoleUpdate} className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary-light transition-colors">Update</button>
        </div>
      </Modal>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Remove Staff" message="This will remove them from the system." confirmLabel="Remove" variant="danger" loading={deleting} />
    </div>
  );
}
