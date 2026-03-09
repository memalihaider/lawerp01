"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  User,
  Calendar,
  MapPin,
  Clock,
  FileText,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { sampleMatters, sampleTasks, sampleTimeEntries } from "@/lib/mock-data";

export default function MatterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const matter = sampleMatters.find((m) => m.id === id);
  if (!matter) notFound();

  const tasks = sampleTasks.filter((t) => t.matterId === id);
  const timeEntries = sampleTimeEntries.filter((t) => t.matterId === id);
  const totalHours = timeEntries.reduce((sum, e) => sum + e.hours, 0);
  const totalBilled = timeEntries.reduce((sum, e) => sum + e.hours * e.rate, 0);

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/matters"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors"
      >
        <ArrowLeft size={16} /> Back to Matters
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-mono text-muted bg-muted-light px-2 py-1 rounded">
                {matter.caseNumber}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded font-medium ${
                  matter.status === "active"
                    ? "bg-success/10 text-success"
                    : matter.status === "open"
                    ? "bg-info/10 text-info"
                    : "bg-muted-light text-muted"
                }`}
              >
                {matter.status}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded font-medium ${
                  matter.priority === "urgent"
                    ? "bg-danger/10 text-danger"
                    : matter.priority === "high"
                    ? "bg-warning/10 text-warning"
                    : "bg-info/10 text-info"
                }`}
              >
                {matter.priority} priority
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">{matter.title}</h1>
            <p className="text-muted">{matter.description}</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              + Time Entry
            </button>
            <button className="border border-border hover:border-primary text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Edit Matter
            </button>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted text-sm mb-1">
            <User size={16} /> Client
          </div>
          <div className="font-semibold text-foreground">{matter.clientName}</div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted text-sm mb-1">
            <Briefcase size={16} /> Assigned Attorney
          </div>
          <div className="font-semibold text-foreground">{matter.assignedAttorneyName}</div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted text-sm mb-1">
            <Calendar size={16} /> Opened
          </div>
          <div className="font-semibold text-foreground">{matter.openDate}</div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted text-sm mb-1">
            <Clock size={16} /> Total Billed
          </div>
          <div className="font-semibold text-foreground">
            {totalHours}h · ${totalBilled.toLocaleString()}
          </div>
        </div>
      </div>

      {matter.courtName && (
        <div className="bg-white rounded-xl border border-border p-4 flex flex-wrap gap-6">
          <div>
            <span className="text-muted text-sm flex items-center gap-1"><MapPin size={14} /> Court</span>
            <span className="font-medium text-foreground">{matter.courtName}</span>
          </div>
          {matter.opposingCounsel && (
            <div>
              <span className="text-muted text-sm flex items-center gap-1"><User size={14} /> Opposing Counsel</span>
              <span className="font-medium text-foreground">{matter.opposingCounsel}</span>
            </div>
          )}
        </div>
      )}

      {/* Tasks & Time Entries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks */}
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <CheckCircle size={20} className="text-success" /> Tasks
            </h2>
            <button className="text-sm text-accent font-medium hover:text-accent-dark">
              + Add Task
            </button>
          </div>
          {tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/50">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      task.status === "completed"
                        ? "bg-success"
                        : task.status === "overdue"
                        ? "bg-danger"
                        : task.priority === "urgent"
                        ? "bg-danger"
                        : "bg-info"
                    }`}
                  />
                  <div className="flex-1">
                    <div className={`font-medium text-sm ${task.status === "completed" ? "line-through text-muted" : "text-foreground"}`}>
                      {task.title}
                    </div>
                    <div className="text-xs text-muted mt-1">
                      {task.assignedTo} · Due: {task.dueDate}
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${
                      task.status === "completed"
                        ? "bg-success/10 text-success"
                        : task.status === "overdue"
                        ? "bg-danger/10 text-danger"
                        : task.status === "in-progress"
                        ? "bg-info/10 text-info"
                        : "bg-muted-light text-muted"
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm text-center py-8">No tasks yet.</p>
          )}
        </div>

        {/* Time Entries */}
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Clock size={20} className="text-primary" /> Time Entries
            </h2>
            <button className="text-sm text-accent font-medium hover:text-accent-dark">
              + Add Entry
            </button>
          </div>
          {timeEntries.length > 0 ? (
            <div className="space-y-3">
              {timeEntries.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/50">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-foreground">{entry.description}</div>
                    <div className="text-xs text-muted mt-1">
                      {entry.attorneyName} · {entry.date}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{entry.hours}h</div>
                    <div className="text-xs text-muted">${(entry.hours * entry.rate).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm text-center py-8">No time entries yet.</p>
          )}
        </div>
      </div>

      {/* Documents & Notes placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileText size={20} className="text-accent" /> Documents
            </h2>
            <button className="text-sm text-accent font-medium hover:text-accent-dark">
              + Upload
            </button>
          </div>
          <p className="text-muted text-sm text-center py-8">No documents uploaded yet.</p>
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <MessageSquare size={20} className="text-info" /> Notes
            </h2>
            <button className="text-sm text-accent font-medium hover:text-accent-dark">
              + Add Note
            </button>
          </div>
          <p className="text-muted text-sm text-center py-8">No notes yet.</p>
        </div>
      </div>
    </div>
  );
}
