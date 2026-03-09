"use client";

import { useAuth } from "@/lib/auth";
import { useRealtimeCollection } from "@/lib/hooks";
import { where, orderBy } from "@/lib/firebase-service";
import { Clock, Briefcase, FileText, CheckCircle, Calendar, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function StaffDashboard() {
  const { profile } = useAuth();
  const userId = profile?.uid || "";

  const { data: allMatters, loading } = useRealtimeCollection("matters");
  const { data: timeEntries } = useRealtimeCollection("timeEntries", userId ? [where("userId", "==", userId)] : undefined);
  const { data: events } = useRealtimeCollection("calendarEvents", [orderBy("date", "asc")]);
  const { data: tasks } = useRealtimeCollection("tasks", userId ? [where("assignedTo", "==", userId)] : undefined);

  const myMatters = allMatters.filter((m: any) => m.assignedAttorney === userId || m.assignedTo === userId);
  const activeMatters = myMatters.filter((m: any) => m.status === "active" || m.status === "open");

  const todayStr = new Date().toISOString().split("T")[0];
  const todayEvents = events.filter((e: any) => e.date === todayStr);
  const pendingTasks = tasks.filter((t: any) => t.status !== "completed");

  const thisMonthEntries = timeEntries.filter((e: any) => {
    const d = e.date || "";
    return d.startsWith(new Date().toISOString().slice(0, 7));
  });
  const totalHours = thisMonthEntries.reduce((s: number, e: any) => s + (e.hours || 0), 0);
  const billableHours = thisMonthEntries.filter((e: any) => e.billable !== false).reduce((s: number, e: any) => s + (e.hours || 0), 0);

  const stats = [
    { label: "Active Matters", value: activeMatters.length, icon: Briefcase, color: "text-blue-600 bg-blue-50" },
    { label: "Pending Tasks", value: pendingTasks.length, icon: CheckCircle, color: "text-yellow-600 bg-yellow-50" },
    { label: "Hours This Month", value: totalHours.toFixed(1), icon: Clock, color: "text-green-600 bg-green-50" },
    { label: "Billable Hours", value: billableHours.toFixed(1), icon: FileText, color: "text-purple-600 bg-purple-50" },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back, {profile?.displayName || "Staff"}</h1>
        <p className="text-muted text-sm">{profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "Staff"} Dashboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${s.color}`}><s.icon size={20} /></div>
            <div><div className="text-2xl font-bold text-foreground">{s.value}</div><div className="text-xs text-muted">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">My Active Matters</h2>
            <Link href="/staff/matters" className="text-xs text-primary hover:underline">View All</Link>
          </div>
          {activeMatters.length === 0 ? <p className="text-muted text-sm">No active matters assigned.</p> : (
            <div className="space-y-3">
              {activeMatters.slice(0, 5).map((m: any) => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-muted-light/50">
                  <div>
                    <div className="text-sm font-medium text-foreground">{m.title}</div>
                    <div className="text-xs text-muted">{m.caseNumber} · {m.practiceArea || "General"}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.priority === "high" ? "bg-red-100 text-red-700" : m.priority === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>{m.priority || "normal"}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Pending Tasks</h2>
          </div>
          {pendingTasks.length === 0 ? <p className="text-muted text-sm">All caught up!</p> : (
            <div className="space-y-3">
              {pendingTasks.slice(0, 5).map((t: any) => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted-light/50">
                  {t.priority === "high" ? <AlertTriangle size={16} className="text-red-500 shrink-0" /> : <CheckCircle size={16} className="text-muted shrink-0" />}
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{t.title}</div>
                    <div className="text-xs text-muted">{t.dueDate ? `Due ${t.dueDate}` : "No due date"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2"><Calendar size={18} /> Today&apos;s Schedule</h2>
          <Link href="/staff/calendar" className="text-xs text-primary hover:underline">Full Calendar</Link>
        </div>
        {todayEvents.length === 0 ? <p className="text-muted text-sm">No events scheduled for today.</p> : (
          <div className="space-y-2">
            {todayEvents.map((e: any) => (
              <div key={e.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                <div className={`w-1 h-10 rounded-full ${e.type === "hearing" ? "bg-red-500" : e.type === "meeting" ? "bg-blue-500" : e.type === "deadline" ? "bg-orange-500" : "bg-green-500"}`} />
                <div>
                  <div className="text-sm font-medium text-foreground">{e.title}</div>
                  <div className="text-xs text-muted">{e.startTime} - {e.endTime} {e.location ? `· ${e.location}` : ""}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
