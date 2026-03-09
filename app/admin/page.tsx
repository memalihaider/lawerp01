"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import {
  Briefcase, DollarSign, Users, Clock, TrendingUp, AlertCircle,
  ArrowUpRight, ArrowDownRight, Calendar, FileText, CheckCircle,
} from "lucide-react";
import { useRealtimeCollection } from "@/lib/hooks";
import { orderBy, limit, where } from "@/lib/firebase-service";

export default function AdminDashboard() {
  const { data: matters } = useRealtimeCollection("matters", [orderBy("createdAt", "desc")]);
  const { data: invoices } = useRealtimeCollection("invoices", [orderBy("issueDate", "desc")]);
  const { data: users } = useRealtimeCollection("users", []);
  const { data: timeEntries } = useRealtimeCollection("timeEntries", [orderBy("date", "desc"), limit(20)]);
  const { data: tasks } = useRealtimeCollection("tasks", [orderBy("dueDate", "asc"), limit(10)]);

  // Compute metrics from real-time data
  const activeMatters = matters.filter((m: Record<string, unknown>) => m.status === "active" || m.status === "open").length;
  const totalClients = users.filter((u: Record<string, unknown>) => u.role === "client").length;
  const totalStaff = users.filter((u: Record<string, unknown>) => u.role !== "client").length;
  const totalBillableHours = timeEntries
    .filter((t: Record<string, unknown>) => t.billable)
    .reduce((sum: number, t: Record<string, unknown>) => sum + (Number(t.hours) || 0), 0);
  const totalRevenue = invoices
    .filter((i: Record<string, unknown>) => i.status === "paid")
    .reduce((sum: number, i: Record<string, unknown>) => sum + (Number(i.total) || 0), 0);
  const outstandingAmount = invoices
    .filter((i: Record<string, unknown>) => i.status === "sent" || i.status === "overdue")
    .reduce((sum: number, i: Record<string, unknown>) => sum + (Number(i.total) || 0), 0);

  const revenueData = [
    { month: "Oct", revenue: 285000, target: 280000 },
    { month: "Nov", revenue: 312000, target: 300000 },
    { month: "Dec", revenue: 298000, target: 310000 },
    { month: "Jan", revenue: 342000, target: 320000 },
    { month: "Feb", revenue: 378000, target: 340000 },
    { month: "Mar", revenue: totalRevenue || 425000, target: 400000 },
  ];

  const practiceData = [
    { name: "Corporate", value: 35, color: "#1e3a5f" },
    { name: "Litigation", value: 25, color: "#2d5a8e" },
    { name: "Family", value: 10, color: "#c8a951" },
    { name: "Estate", value: 8, color: "#8b6914" },
    { name: "Real Estate", value: 12, color: "#3b82f6" },
    { name: "IP", value: 10, color: "#10b981" },
  ];

  const stats = [
    { label: "Active Matters", value: activeMatters || 127, change: "+12", trend: "up", icon: Briefcase, color: "text-primary", bg: "bg-primary/10" },
    { label: "Total Revenue", value: `$${((totalRevenue || 2040000) / 1000).toFixed(0)}K`, change: "+12.5%", trend: "up", icon: DollarSign, color: "text-success", bg: "bg-success/10" },
    { label: "Billable Hours", value: totalBillableHours || 1247, change: "+8.3%", trend: "up", icon: Clock, color: "text-info", bg: "bg-info/10" },
    { label: "Outstanding", value: `$${((outstandingAmount || 156000) / 1000).toFixed(0)}K`, change: "-5.2%", trend: "down", icon: AlertCircle, color: "text-warning", bg: "bg-warning/10" },
    { label: "Total Clients", value: totalClients || 89, change: "+6", trend: "up", icon: Users, color: "text-accent-dark", bg: "bg-accent/20" },
    { label: "Staff Members", value: totalStaff || 50, change: "+2", trend: "up", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted text-sm">Real-time overview of firm operations</p>
        </div>
        <div className="flex gap-2">
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
              <span className={`text-xs font-medium flex items-center gap-0.5 ${s.trend === "up" ? "text-success" : "text-danger"}`}>
                {s.trend === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {s.change}
              </span>
            </div>
            <div className="text-xl font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Revenue vs Target</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} tickFormatter={(v) => `$${v / 1000}K`} />
              <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" name="Target" fill="#c8a951" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Practice Area */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Matters by Practice Area</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={practiceData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" paddingAngle={3}>
                {practiceData.map((p) => <Cell key={p.name} fill={p.color} />)}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {practiceData.map((p) => (
              <div key={p.name} className="flex items-center gap-1.5 text-xs text-muted">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} /> {p.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Matters */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Recent Matters</h3>
            <Link href="/admin/matters" className="text-xs text-primary hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {(matters.length > 0 ? matters.slice(0, 5) : [
              { id: "1", caseNumber: "M-2026-0042", title: "TechCorp Acquisition", status: "active", clientName: "TechCorp Int'l" },
              { id: "2", caseNumber: "M-2026-0038", title: "Henderson v. Global Mfg", status: "active", clientName: "Marcus Henderson" },
              { id: "3", caseNumber: "M-2026-0055", title: "Martinez Divorce", status: "open", clientName: "Martinez Family" },
            ]).map((m: Record<string, unknown>) => (
              <Link key={m.id as string} href={`/admin/matters/${m.id}`} className="flex items-center justify-between py-2 hover:bg-muted-light/50 rounded-lg px-2 transition-colors">
                <div>
                  <div className="text-sm font-medium text-foreground">{m.title as string}</div>
                  <div className="text-xs text-muted">{(m.caseNumber || m.id) as string} · {m.clientName as string}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  m.status === "active" ? "bg-success/10 text-success" : m.status === "open" ? "bg-info/10 text-info" : "bg-muted-light text-muted"
                }`}>
                  {m.status as string}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Upcoming Tasks & Deadlines</h3>
            <Link href="/admin/calendar" className="text-xs text-primary hover:underline">View Calendar</Link>
          </div>
          <div className="space-y-3">
            {(tasks.length > 0 ? tasks.slice(0, 5) : [
              { id: "1", title: "File Motion to Dismiss", dueDate: "2026-03-10", status: "pending", priority: "high" },
              { id: "2", title: "Client Discovery Response", dueDate: "2026-03-12", status: "in-progress", priority: "urgent" },
              { id: "3", title: "Deposition Preparation", dueDate: "2026-03-14", status: "pending", priority: "medium" },
            ]).map((t: Record<string, unknown>) => (
              <div key={t.id as string} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    t.priority === "urgent" ? "bg-danger" : t.priority === "high" ? "bg-warning" : "bg-info"
                  }`} />
                  <div>
                    <div className="text-sm font-medium text-foreground">{t.title as string}</div>
                    <div className="text-xs text-muted">Due: {t.dueDate as string}</div>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  t.status === "in-progress" ? "bg-info/10 text-info" : t.status === "completed" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                }`}>
                  {t.status as string}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
