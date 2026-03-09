"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { DollarSign, Briefcase, Clock, Users, TrendingUp, FileText } from "lucide-react";
import { useMatters, useInvoices, useUsers, useRealtimeCollection } from "@/lib/hooks";
import { orderBy } from "@/lib/firebase-service";

export default function ReportsPage() {
  const { data: matters } = useMatters();
  const { data: invoices } = useInvoices();
  const { data: users } = useUsers();
  const { data: timeEntries } = useRealtimeCollection("timeEntries", [orderBy("date", "desc")]);

  const stats = useMemo(() => {
    const totalRevenue = invoices.filter((i: Record<string, unknown>) => i.status === "paid").reduce((s: number, i: Record<string, unknown>) => s + Number(i.total || 0), 0);
    const outstanding = invoices.filter((i: Record<string, unknown>) => i.status === "sent" || i.status === "overdue").reduce((s: number, i: Record<string, unknown>) => s + Number(i.total || 0), 0);
    const totalHours = timeEntries.reduce((s: number, t: Record<string, unknown>) => s + Number(t.hours || 0), 0);
    const billableHours = timeEntries.filter((t: Record<string, unknown>) => t.billable).reduce((s: number, t: Record<string, unknown>) => s + Number(t.hours || 0), 0);
    const activeMatters = matters.filter((m: Record<string, unknown>) => m.status === "active" || m.status === "open").length;
    const clientCount = users.filter((u: Record<string, unknown>) => u.role === "client").length;
    return { totalRevenue, outstanding, totalHours, billableHours, activeMatters, clientCount, utilizationRate: totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0 };
  }, [matters, invoices, users, timeEntries]);

  // Practice area breakdown
  const practiceData = useMemo(() => {
    const map: Record<string, number> = {};
    matters.forEach((m: Record<string, unknown>) => { const pa = (m.practiceArea as string) || "Other"; map[pa] = (map[pa] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [matters]);

  const pieColors = ["#1e3a5f", "#2d5a8e", "#c8a951", "#8b6914", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  // Invoice status breakdown
  const invoiceStatusData = useMemo(() => {
    const map: Record<string, number> = {};
    invoices.forEach((i: Record<string, unknown>) => { const s = (i.status as string) || "draft"; map[s] = (map[s] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [invoices]);

  // Monthly revenue (mock timeline)
  const monthlyRevenue = [
    { month: "Sep", revenue: 245000 }, { month: "Oct", revenue: 285000 }, { month: "Nov", revenue: 312000 },
    { month: "Dec", revenue: 298000 }, { month: "Jan", revenue: 342000 }, { month: "Feb", revenue: 378000 },
    { month: "Mar", revenue: stats.totalRevenue || 425000 },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1><p className="text-muted text-sm">Firm performance overview</p></div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `$${(stats.totalRevenue / 1000).toFixed(0)}K`, icon: DollarSign, color: "text-success", bg: "bg-success/10" },
          { label: "Active Matters", value: stats.activeMatters, icon: Briefcase, color: "text-primary", bg: "bg-primary/10" },
          { label: "Billable Hours", value: stats.billableHours.toFixed(0), icon: Clock, color: "text-info", bg: "bg-info/10" },
          { label: "Utilization Rate", value: `${stats.utilizationRate}%`, icon: TrendingUp, color: "text-accent-dark", bg: "bg-accent/20" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-border p-4">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-2`}><s.icon size={18} className={s.color} /></div>
            <div className="text-2xl font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} tickFormatter={(v) => `$${v / 1000}K`} />
              <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
              <Line type="monotone" dataKey="revenue" stroke="#1e3a5f" strokeWidth={2} dot={{ fill: "#1e3a5f" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Practice Areas */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Matters by Practice Area</h3>
          {practiceData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={practiceData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {practiceData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {practiceData.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-1.5 text-xs text-muted">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pieColors[i % pieColors.length] }} /> {p.name} ({p.value})
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted text-center py-8">No data available</p>
          )}
        </div>
      </div>

      {/* Invoice Status */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-semibold text-foreground mb-4">Invoice Status Breakdown</h3>
        {invoiceStatusData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={invoiceStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" name="Count" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted text-center py-8">No data available</p>
        )}
      </div>
    </div>
  );
}
