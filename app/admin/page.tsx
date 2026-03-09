"use client";

import { useMemo } from "react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import {
  Briefcase, DollarSign, Users, Clock, TrendingUp, AlertCircle,
  ArrowUpRight, ArrowDownRight, FileText, Scale,
} from "lucide-react";
import { useRealtimeCollection } from "@/lib/hooks";
import { orderBy, where } from "@/lib/firebase-service";

const AREA_COLORS: Record<string, string> = {
  "Corporate Law": "#1e3a5f",
  "Litigation": "#2d5a8e",
  "Family Law": "#c8a951",
  "Estate Planning": "#8b6914",
  "Real Estate": "#3b82f6",
  "Intellectual Property": "#10b981",
  "Other": "#6b7280",
};

export default function AdminDashboard() {
  const { data: matters, loading: mLoading } = useRealtimeCollection("matters", [orderBy("createdAt", "desc")]);
  const { data: invoices } = useRealtimeCollection("invoices", [orderBy("issueDate", "desc")]);
  const { data: users } = useRealtimeCollection("users", []);
  const { data: timeEntries } = useRealtimeCollection("timeEntries", [orderBy("date", "desc")]);
  const { data: tasks } = useRealtimeCollection("tasks", [orderBy("dueDate", "asc")]);
  const { data: events } = useRealtimeCollection("events", [orderBy("date", "asc")]);

  // ── Compute all metrics purely from real-time Firestore data ──
  const metrics = useMemo(() => {
    const activeMatters = matters.filter((m: Record<string, unknown>) => m.status === "active" || m.status === "open").length;
    const totalClients = users.filter((u: Record<string, unknown>) => u.role === "client").length;
    const totalStaff = users.filter((u: Record<string, unknown>) => u.role !== "client").length;
    const billableEntries = timeEntries.filter((t: Record<string, unknown>) => t.billable);
    const billableHours = billableEntries.reduce((s: number, t: Record<string, unknown>) => s + (Number(t.hours) || 0), 0);
    const paidInvoices = invoices.filter((i: Record<string, unknown>) => i.status === "paid");
    const totalRevenue = paidInvoices.reduce((s: number, i: Record<string, unknown>) => s + (Number(i.total) || 0), 0);
    const outstanding = invoices.filter((i: Record<string, unknown>) => i.status === "sent" || i.status === "overdue");
    const outstandingAmount = outstanding.reduce((s: number, i: Record<string, unknown>) => s + (Number(i.total) || 0), 0);
    const overdueInvoices = invoices.filter((i: Record<string, unknown>) => i.status === "overdue").length;
    const pendingTasks = tasks.filter((t: Record<string, unknown>) => t.status === "pending" || t.status === "in-progress").length;
    return { activeMatters, totalClients, totalStaff, billableHours, totalRevenue, outstandingAmount, overdueInvoices, pendingTasks };
  }, [matters, users, timeEntries, invoices, tasks]);

  // ── Revenue by month from real invoices ──
  const revenueData = useMemo(() => {
    const monthMap: Record<string, number> = {};
    invoices.forEach((inv: Record<string, unknown>) => {
      if (inv.status === "paid" && inv.paidDate) {
        const d = new Date(inv.paidDate as string);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthMap[key] = (monthMap[key] || 0) + (Number(inv.total) || 0);
      }
    });
    // Also include billed (sent) invoices by issue date for pipeline view
    invoices.forEach((inv: Record<string, unknown>) => {
      if (inv.status === "sent" && inv.issueDate) {
        const d = new Date(inv.issueDate as string);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (!monthMap[key]) monthMap[key] = 0;
      }
    });
    const sorted = Object.entries(monthMap).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
    if (sorted.length === 0) return [{ month: new Date().toLocaleString("default", { month: "short" }), revenue: 0 }];
    return sorted.map(([key, val]) => ({
      month: new Date(key + "-01").toLocaleString("default", { month: "short" }),
      revenue: val,
    }));
  }, [invoices]);

  // ── Practice area distribution from real matters ──
  const practiceData = useMemo(() => {
    const areaMap: Record<string, number> = {};
    matters.forEach((m: Record<string, unknown>) => {
      const area = (m.practiceArea as string) || "Other";
      areaMap[area] = (areaMap[area] || 0) + 1;
    });
    return Object.entries(areaMap).map(([name, value]) => ({
      name,
      value,
      color: AREA_COLORS[name] || "#6b7280",
    }));
  }, [matters]);

  // ── Upcoming deadlines from tasks + events ──
  const upcomingDeadlines = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const taskItems = tasks
      .filter((t: Record<string, unknown>) => t.status !== "completed" && (t.dueDate as string) >= today)
      .slice(0, 5)
      .map((t: Record<string, unknown>) => ({ id: t.id as string, title: t.title as string, date: t.dueDate as string, type: "task", priority: t.priority as string }));
    const eventItems = events
      .filter((e: Record<string, unknown>) => (e.date as string) >= today)
      .slice(0, 5)
      .map((e: Record<string, unknown>) => ({ id: e.id as string, title: e.title as string, date: e.date as string, type: "event", priority: "medium" }));
    return [...taskItems, ...eventItems].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 8);
  }, [tasks, events]);

  // ── Recent activity from time entries ──
  const recentActivity = useMemo(() => {
    return timeEntries.slice(0, 5).map((t: Record<string, unknown>) => ({
      id: t.id as string,
      user: (t.userName as string) || "Unknown",
      action: `Logged ${Number(t.hours).toFixed(1)}h on ${t.matterTitle || "a matter"}`,
      date: t.date as string,
    }));
  }, [timeEntries]);

  const stats = [
    { label: "Active Matters", value: metrics.activeMatters, icon: Briefcase, color: "text-primary", bg: "bg-primary/10" },
    { label: "Total Revenue", value: `$${metrics.totalRevenue > 0 ? (metrics.totalRevenue / 1000).toFixed(0) + "K" : "0"}`, icon: DollarSign, color: "text-success", bg: "bg-success/10" },
    { label: "Billable Hours", value: metrics.billableHours.toFixed(1), icon: Clock, color: "text-info", bg: "bg-info/10" },
    { label: "Outstanding", value: `$${metrics.outstandingAmount > 0 ? (metrics.outstandingAmount / 1000).toFixed(0) + "K" : "0"}`, icon: AlertCircle, color: "text-warning", bg: "bg-warning/10" },
    { label: "Total Clients", value: metrics.totalClients, icon: Users, color: "text-accent-dark", bg: "bg-accent/20" },
    { label: "Staff Members", value: metrics.totalStaff, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted text-sm">Real-time overview — all data from Firestore</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/clients/new" className="flex items-center gap-2 bg-white border border-border hover:bg-muted-light text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Users size={16} /> Add Client
          </Link>
          <Link href="/admin/matters/new" className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Briefcase size={16} /> New Matter
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon size={18} className={s.color} />
              </div>
            </div>
            <div className="text-xl font-bold text-foreground">{mLoading ? "..." : s.value}</div>
            <div className="text-xs text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Overdue/Pending Alerts */}
      {(metrics.overdueInvoices > 0 || metrics.pendingTasks > 0) && (
        <div className="flex gap-3 flex-wrap">
          {metrics.overdueInvoices > 0 && (
            <Link href="/admin/invoices" className="flex items-center gap-2 bg-danger/10 text-danger px-4 py-2 rounded-lg text-sm font-medium hover:bg-danger/20 transition-colors">
              <AlertCircle size={16} /> {metrics.overdueInvoices} overdue invoice{metrics.overdueInvoices !== 1 ? "s" : ""}
            </Link>
          )}
          {metrics.pendingTasks > 0 && (
            <Link href="/admin/calendar" className="flex items-center gap-2 bg-warning/10 text-warning px-4 py-2 rounded-lg text-sm font-medium hover:bg-warning/20 transition-colors">
              <FileText size={16} /> {metrics.pendingTasks} pending task{metrics.pendingTasks !== 1 ? "s" : ""}
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart - from real invoices */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Revenue (Paid Invoices)</h3>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => `$${v / 1000}K`} />
                <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
                <Bar dataKey="revenue" name="Revenue" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted text-sm">
              <div className="text-center">
                <Scale size={32} className="mx-auto mb-2 opacity-40" />
                <p>No paid invoices yet. Revenue will appear here as invoices are paid.</p>
              </div>
            </div>
          )}
        </div>

        {/* Practice Area - from real matters */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Matters by Practice Area</h3>
          {practiceData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={practiceData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" paddingAngle={3}>
                    {practiceData.map((p) => <Cell key={p.name} fill={p.color} />)}
                  </Pie>
                  <Tooltip formatter={(v, name) => [`${v} matter${Number(v) !== 1 ? "s" : ""}`, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {practiceData.map((p) => (
                  <div key={p.name} className="flex items-center gap-1.5 text-xs text-muted">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} /> {p.name} ({p.value})
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-muted text-sm">
              No matters yet
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Matters */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Recent Matters</h3>
            <Link href="/admin/matters" className="text-xs text-primary hover:underline">View All</Link>
          </div>
          {matters.length > 0 ? (
            <div className="space-y-3">
              {matters.slice(0, 5).map((m: Record<string, unknown>) => (
                <Link key={m.id as string} href={`/admin/matters/${m.id}`} className="flex items-center justify-between py-2 hover:bg-muted-light/50 rounded-lg px-2 transition-colors">
                  <div>
                    <div className="text-sm font-medium text-foreground">{m.title as string}</div>
                    <div className="text-xs text-muted">{(m.caseNumber || m.id) as string} · {(m.clientName || "No client") as string}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    m.status === "active" ? "bg-success/10 text-success" : m.status === "open" ? "bg-info/10 text-info" : m.status === "pending" ? "bg-warning/10 text-warning" : "bg-muted-light text-muted"
                  }`}>
                    {m.status as string}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted py-6 text-center">{mLoading ? "Loading..." : "No matters yet. Create your first matter to get started."}</p>
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Upcoming Deadlines</h3>
            <Link href="/admin/calendar" className="text-xs text-primary hover:underline">View Calendar</Link>
          </div>
          {upcomingDeadlines.length > 0 ? (
            <div className="space-y-3">
              {upcomingDeadlines.map((d) => (
                <div key={d.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      d.priority === "urgent" ? "bg-danger" : d.priority === "high" ? "bg-warning" : d.type === "event" ? "bg-primary" : "bg-info"
                    }`} />
                    <div>
                      <div className="text-sm font-medium text-foreground">{d.title}</div>
                      <div className="text-xs text-muted">{d.date} · {d.type === "event" ? "Event" : "Task"}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted py-6 text-center">No upcoming deadlines</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((a) => (
              <div key={a.id} className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                  {a.user.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm text-foreground"><span className="font-medium">{a.user}</span> {a.action}</div>
                  <div className="text-xs text-muted">{a.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
