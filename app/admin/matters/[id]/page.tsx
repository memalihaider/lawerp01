"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Edit2, Trash2, Plus, Clock, FileText, MessageSquare, CheckCircle,
  AlertCircle, Calendar, DollarSign, User, Briefcase, Save, X,
} from "lucide-react";
import { useRealtimeDocument, useRealtimeCollection } from "@/lib/hooks";
import {
  updateDocument, deleteDocument, createDocument, orderBy, where, serverTimestamp,
} from "@/lib/firebase-service";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/lib/auth";

const STATUS_OPTIONS = ["open", "active", "pending", "closed", "archived"];
const PRIORITY_OPTIONS = ["low", "medium", "high", "urgent"];
const STATUS_COLORS: Record<string, string> = {
  active: "bg-success/10 text-success", open: "bg-info/10 text-info",
  pending: "bg-warning/10 text-warning", closed: "bg-muted-light text-muted",
  archived: "bg-muted-light text-muted-dark",
};
const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-muted-light text-muted", medium: "bg-info/10 text-info",
  high: "bg-warning/10 text-warning", urgent: "bg-danger/10 text-danger",
};
const TASK_STATUS = ["pending", "in-progress", "completed"];

export default function MatterDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { profile } = useAuth();
  const { toast } = useToast();

  const { data: matter, loading } = useRealtimeDocument("matters", id as string);
  const { data: tasks } = useRealtimeCollection("tasks", [where("matterId", "==", id as string), orderBy("dueDate", "asc")]);
  const { data: timeEntries } = useRealtimeCollection("timeEntries", [where("matterId", "==", id as string), orderBy("date", "desc")]);
  const { data: documents } = useRealtimeCollection("documents", [where("matterId", "==", id as string), orderBy("uploadedAt", "desc")]);
  const { data: notes } = useRealtimeCollection("notes", [where("matterId", "==", id as string), orderBy("createdAt", "desc")]);
  const { data: users } = useRealtimeCollection("users", []);

  const [tab, setTab] = useState<"overview" | "tasks" | "time" | "documents" | "notes">("overview");
  const [editing, setEditing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);

  const m = matter as Record<string, unknown> | null;

  // Edit form
  const [editForm, setEditForm] = useState<Record<string, string>>({});

  function startEdit() {
    if (!m) return;
    setEditForm({
      title: (m.title as string) || "",
      status: (m.status as string) || "open",
      priority: (m.priority as string) || "medium",
      practiceArea: (m.practiceArea as string) || "",
      description: (m.description as string) || "",
      courtName: (m.courtName as string) || "",
      opposingCounsel: (m.opposingCounsel as string) || "",
      assignedAttorneyId: (m.assignedAttorneyId as string) || "",
    });
    setEditing(true);
  }

  async function saveEdit() {
    if (!m) return;
    try {
      const attorney = users.find((u: Record<string, unknown>) => u.id === editForm.assignedAttorneyId) as Record<string, unknown> | undefined;
      await updateDocument("matters", m.id as string, {
        ...editForm,
        assignedAttorneyName: attorney?.displayName || editForm.assignedAttorneyId,
      });
      toast("success", "Matter updated");
      setEditing(false);
    } catch { toast("error", "Failed to update matter"); }
  }

  async function handleDelete() {
    if (!m) return;
    try {
      await deleteDocument("matters", m.id as string);
      toast("success", "Matter deleted");
      router.push("/admin/matters");
    } catch { toast("error", "Failed to delete"); }
  }

  // ── Task form ──
  const [taskForm, setTaskForm] = useState({ title: "", description: "", assignedTo: "", dueDate: "", priority: "medium" });

  async function addTask() {
    if (!taskForm.title || !taskForm.dueDate) { toast("error", "Title and due date are required"); return; }
    try {
      await createDocument("tasks", {
        matterId: id, title: taskForm.title, description: taskForm.description,
        assignedTo: taskForm.assignedTo, dueDate: taskForm.dueDate, priority: taskForm.priority,
        status: "pending", createdBy: profile?.uid || "",
      });
      toast("success", "Task added");
      setShowTaskModal(false);
      setTaskForm({ title: "", description: "", assignedTo: "", dueDate: "", priority: "medium" });
    } catch { toast("error", "Failed to add task"); }
  }

  async function updateTaskStatus(taskId: string, status: string) {
    try {
      await updateDocument("tasks", taskId, { status });
      toast("success", "Task updated");
    } catch { toast("error", "Failed to update task"); }
  }

  async function deleteTask(taskId: string) {
    try { await deleteDocument("tasks", taskId); toast("success", "Task deleted"); }
    catch { toast("error", "Failed to delete"); }
  }

  // ── Note form ──
  const [noteContent, setNoteContent] = useState("");

  async function addNote() {
    if (!noteContent.trim()) return;
    try {
      await createDocument("notes", {
        matterId: id, content: noteContent, author: profile?.displayName || "Admin",
        authorId: profile?.uid || "", createdAt: serverTimestamp(),
      });
      toast("success", "Note added");
      setShowNoteModal(false);
      setNoteContent("");
    } catch { toast("error", "Failed to add note"); }
  }

  // ── Time entry form ──
  const [timeForm, setTimeForm] = useState({ description: "", hours: "", date: new Date().toISOString().split("T")[0], rate: "350", billable: true });

  async function addTimeEntry() {
    if (!timeForm.hours) { toast("error", "Hours required"); return; }
    try {
      await createDocument("timeEntries", {
        matterId: id, matterTitle: (m?.title as string) || "",
        description: timeForm.description, hours: Number(timeForm.hours),
        date: timeForm.date, rate: Number(timeForm.rate), billable: timeForm.billable,
        userId: profile?.uid || "", userName: profile?.displayName || "",
      });
      toast("success", "Time entry added");
      setShowTimeModal(false);
      setTimeForm({ description: "", hours: "", date: new Date().toISOString().split("T")[0], rate: "350", billable: true });
    } catch { toast("error", "Failed to add time entry"); }
  }

  // ── Computed stats ──
  const totalHours = useMemo(() => timeEntries.reduce((s: number, t: Record<string, unknown>) => s + (Number(t.hours) || 0), 0), [timeEntries]);
  const totalBilled = useMemo(() => timeEntries.reduce((s: number, t: Record<string, unknown>) => s + ((Number(t.hours) || 0) * (Number(t.rate) || 0)), 0), [timeEntries]);
  const completedTasks = tasks.filter((t: Record<string, unknown>) => t.status === "completed").length;
  const attorneys = users.filter((u: Record<string, unknown>) => u.role !== "client");

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  if (!m) {
    return (
      <div className="text-center py-20">
        <Briefcase size={48} className="mx-auto mb-4 text-muted opacity-40" />
        <h2 className="text-xl font-bold text-foreground mb-2">Matter not found</h2>
        <Link href="/admin/matters" className="text-primary hover:underline text-sm">Back to Matters</Link>
      </div>
    );
  }

  const tabs = [
    { key: "overview", label: "Overview", icon: Briefcase },
    { key: "tasks", label: `Tasks (${tasks.length})`, icon: CheckCircle },
    { key: "time", label: `Time (${timeEntries.length})`, icon: Clock },
    { key: "documents", label: `Documents (${documents.length})`, icon: FileText },
    { key: "notes", label: `Notes (${notes.length})`, icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/admin/matters" className="mt-1 p-2 hover:bg-muted-light rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-muted" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-foreground">{m.title as string}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[(m.status as string)] || ""}`}>{m.status as string}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLORS[(m.priority as string)] || ""}`}>{m.priority as string}</span>
            </div>
            <p className="text-sm text-muted">
              {(m.caseNumber || m.id) as string} · {(m.clientName || "No client") as string} · {(m.practiceArea || "") as string}
            </p>
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
          <div className="text-xs text-muted mb-1">Total Hours</div>
          <div className="text-xl font-bold text-foreground">{totalHours.toFixed(1)}</div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="text-xs text-muted mb-1">Total Billed</div>
          <div className="text-xl font-bold text-foreground">${totalBilled.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="text-xs text-muted mb-1">Tasks Completed</div>
          <div className="text-xl font-bold text-foreground">{completedTasks}/{tasks.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="text-xs text-muted mb-1">Documents</div>
          <div className="text-xl font-bold text-foreground">{documents.length}</div>
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
            <h3 className="font-semibold text-foreground">Case Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted">Case Number:</span><div className="font-medium">{(m.caseNumber || m.id) as string}</div></div>
              <div><span className="text-muted">Practice Area:</span><div className="font-medium">{(m.practiceArea || "—") as string}</div></div>
              <div><span className="text-muted">Client:</span><div className="font-medium">{(m.clientName || "—") as string}</div></div>
              <div><span className="text-muted">Assigned Attorney:</span><div className="font-medium">{(m.assignedAttorneyName || "—") as string}</div></div>
              <div><span className="text-muted">Court:</span><div className="font-medium">{(m.courtName || "—") as string}</div></div>
              <div><span className="text-muted">Opposing Counsel:</span><div className="font-medium">{(m.opposingCounsel || "—") as string}</div></div>
              <div><span className="text-muted">Opened:</span><div className="font-medium">{(m.openDate || m.createdAt || "—") as string}</div></div>
              <div><span className="text-muted">Closed:</span><div className="font-medium">{(m.closeDate || "—") as string}</div></div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-3">Description</h3>
            <p className="text-sm text-muted leading-relaxed">{(m.description as string) || "No description provided."}</p>
          </div>
        </div>
      )}

      {tab === "tasks" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowTaskModal(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors">
              <Plus size={16} /> Add Task
            </button>
          </div>
          {tasks.length === 0 ? (
            <div className="bg-white rounded-xl border border-border py-12 text-center text-muted text-sm">No tasks yet</div>
          ) : (
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-muted-light/30">
                  <th className="text-left px-4 py-3 font-medium text-muted">Task</th>
                  <th className="text-left px-4 py-3 font-medium text-muted hidden md:table-cell">Assigned To</th>
                  <th className="text-left px-4 py-3 font-medium text-muted">Due Date</th>
                  <th className="text-left px-4 py-3 font-medium text-muted">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-muted">Actions</th>
                </tr></thead>
                <tbody>
                  {tasks.map((t: Record<string, unknown>) => (
                    <tr key={t.id as string} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{t.title as string}</div>
                        {t.description ? <div className="text-xs text-muted mt-0.5">{t.description as string}</div> : null}
                      </td>
                      <td className="px-4 py-3 text-muted hidden md:table-cell">{(t.assignedTo as string) || "—"}</td>
                      <td className="px-4 py-3 text-muted">{t.dueDate as string}</td>
                      <td className="px-4 py-3">
                        <select value={t.status as string} onChange={(e) => updateTaskStatus(t.id as string, e.target.value)}
                          className="text-xs px-2 py-1 rounded-lg border border-border bg-white">
                          {TASK_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => deleteTask(t.id as string)} className="text-danger hover:text-danger/80"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "time" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowTimeModal(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors">
              <Plus size={16} /> Log Time
            </button>
          </div>
          {timeEntries.length === 0 ? (
            <div className="bg-white rounded-xl border border-border py-12 text-center text-muted text-sm">No time entries yet</div>
          ) : (
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-muted-light/30">
                  <th className="text-left px-4 py-3 font-medium text-muted">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-muted">Description</th>
                  <th className="text-left px-4 py-3 font-medium text-muted hidden md:table-cell">By</th>
                  <th className="text-right px-4 py-3 font-medium text-muted">Hours</th>
                  <th className="text-right px-4 py-3 font-medium text-muted">Amount</th>
                </tr></thead>
                <tbody>
                  {timeEntries.map((t: Record<string, unknown>) => (
                    <tr key={t.id as string} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-muted">{t.date as string}</td>
                      <td className="px-4 py-3 text-foreground">{(t.description as string) || "—"}</td>
                      <td className="px-4 py-3 text-muted hidden md:table-cell">{(t.userName as string) || "—"}</td>
                      <td className="px-4 py-3 text-right font-mono">{Number(t.hours).toFixed(1)}</td>
                      <td className="px-4 py-3 text-right font-medium">${(Number(t.hours) * Number(t.rate)).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "documents" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Link href="/admin/documents" className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors">
              <FileText size={16} /> Manage Documents
            </Link>
          </div>
          {documents.length === 0 ? (
            <div className="bg-white rounded-xl border border-border py-12 text-center text-muted text-sm">No documents uploaded for this matter</div>
          ) : (
            <div className="bg-white rounded-xl border border-border divide-y divide-border">
              {documents.map((d: Record<string, unknown>) => (
                <div key={d.id as string} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-muted" />
                    <div>
                      <div className="text-sm font-medium text-foreground">{d.name as string}</div>
                      <div className="text-xs text-muted">{d.category as string} · {d.uploadedAt as string}</div>
                    </div>
                  </div>
                  {d.url ? (
                    <a href={d.url as string} target="_blank" rel="noopener noreferrer" className="text-primary text-xs hover:underline">Download</a>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "notes" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowNoteModal(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors">
              <Plus size={16} /> Add Note
            </button>
          </div>
          {notes.length === 0 ? (
            <div className="bg-white rounded-xl border border-border py-12 text-center text-muted text-sm">No notes yet</div>
          ) : (
            <div className="space-y-3">
              {notes.map((n: Record<string, unknown>) => (
                <div key={n.id as string} className="bg-white rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{n.author as string}</span>
                    <span className="text-xs text-muted">{typeof n.createdAt === "object" && n.createdAt ? "Just now" : (n.createdAt as string)}</span>
                  </div>
                  <p className="text-sm text-muted whitespace-pre-wrap">{n.content as string}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Edit Modal ── */}
      <Modal isOpen={editing} onClose={() => setEditing(false)} title="Edit Matter" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Title</label>
            <input value={editForm.title || ""} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Status</label>
              <select value={editForm.status || ""} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Priority</label>
              <select value={editForm.priority || ""} onChange={(e) => setEditForm((f) => ({ ...f, priority: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Assigned Attorney</label>
            <select value={editForm.assignedAttorneyId || ""} onChange={(e) => setEditForm((f) => ({ ...f, assignedAttorneyId: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
              <option value="">Select...</option>
              {attorneys.map((u: Record<string, unknown>) => <option key={u.id as string} value={u.id as string}>{u.displayName as string}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Court Name</label>
              <input value={editForm.courtName || ""} onChange={(e) => setEditForm((f) => ({ ...f, courtName: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Opposing Counsel</label>
              <input value={editForm.opposingCounsel || ""} onChange={(e) => setEditForm((f) => ({ ...f, opposingCounsel: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea value={editForm.description || ""} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} rows={4}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm rounded-lg border border-border text-muted hover:bg-muted-light transition-colors">Cancel</button>
          <button onClick={saveEdit} className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary-light transition-colors"><Save size={14} className="inline mr-1" />Save Changes</button>
        </div>
      </Modal>

      {/* ── Add Task Modal ── */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Add Task" size="md">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-foreground mb-1">Title *</label>
            <input value={taskForm.title} onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" /></div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea value={taskForm.description} onChange={(e) => setTaskForm((f) => ({ ...f, description: e.target.value }))} rows={2}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-foreground mb-1">Due Date *</label>
              <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm((f) => ({ ...f, dueDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Priority</label>
              <select value={taskForm.priority} onChange={(e) => setTaskForm((f) => ({ ...f, priority: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select></div>
          </div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Assigned To</label>
            <select value={taskForm.assignedTo} onChange={(e) => setTaskForm((f) => ({ ...f, assignedTo: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
              <option value="">Select...</option>
              {attorneys.map((u: Record<string, unknown>) => <option key={u.id as string} value={u.displayName as string}>{u.displayName as string}</option>)}
            </select></div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={() => setShowTaskModal(false)} className="px-4 py-2 text-sm rounded-lg border border-border text-muted hover:bg-muted-light transition-colors">Cancel</button>
          <button onClick={addTask} className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary-light transition-colors">Add Task</button>
        </div>
      </Modal>

      {/* ── Add Note Modal ── */}
      <Modal isOpen={showNoteModal} onClose={() => setShowNoteModal(false)} title="Add Note" size="md">
        <div><textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)} rows={5} placeholder="Write your note..."
          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" /></div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={() => setShowNoteModal(false)} className="px-4 py-2 text-sm rounded-lg border border-border text-muted hover:bg-muted-light transition-colors">Cancel</button>
          <button onClick={addNote} className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary-light transition-colors">Save Note</button>
        </div>
      </Modal>

      {/* ── Log Time Modal ── */}
      <Modal isOpen={showTimeModal} onClose={() => setShowTimeModal(false)} title="Log Time" size="md">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea value={timeForm.description} onChange={(e) => setTimeForm((f) => ({ ...f, description: e.target.value }))} rows={2}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-sm font-medium text-foreground mb-1">Hours *</label>
              <input type="number" step="0.1" value={timeForm.hours} onChange={(e) => setTimeForm((f) => ({ ...f, hours: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Rate ($)</label>
              <input type="number" value={timeForm.rate} onChange={(e) => setTimeForm((f) => ({ ...f, rate: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Date</label>
              <input type="date" value={timeForm.date} onChange={(e) => setTimeForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" /></div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={timeForm.billable} onChange={(e) => setTimeForm((f) => ({ ...f, billable: e.target.checked }))} className="rounded" /> Billable
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={() => setShowTimeModal(false)} className="px-4 py-2 text-sm rounded-lg border border-border text-muted hover:bg-muted-light transition-colors">Cancel</button>
          <button onClick={addTimeEntry} className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary-light transition-colors">Log Time</button>
        </div>
      </Modal>

      {/* ── Delete Confirm ── */}
      <ConfirmModal isOpen={deleteConfirm} onClose={() => setDeleteConfirm(false)} onConfirm={handleDelete}
        title="Delete Matter" message="Are you sure you want to delete this matter? This action cannot be undone." confirmLabel="Delete" variant="danger" />
    </div>
  );
}
