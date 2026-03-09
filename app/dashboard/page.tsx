"use client";

import Link from "next/link";
import {
  Briefcase,
  Clock,
  DollarSign,
  Users,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  dashboardMetrics,
  monthlyRevenue,
  practiceAreaRevenue,
  sampleMatters,
  sampleTasks,
  sampleTimeEntries,
} from "@/lib/mock-data";

const metricCards = [
  {
    label: "Active Matters",
    value: dashboardMetrics.activeMatters,
    total: dashboardMetrics.totalMatters,
    icon: Briefcase,
    color: "text-primary",
    bg: "bg-primary/5",
    change: "+3 this month",
    up: true,
  },
  {
    label: "Billable Hours (MTD)",
    value: dashboardMetrics.billableHoursThisMonth.toLocaleString(),
    icon: Clock,
    color: "text-success",
    bg: "bg-success/5",
    change: "+8% vs last month",
    up: true,
  },
  {
    label: "Revenue (MTD)",
    value: `$${(dashboardMetrics.revenueThisMonth / 1000).toFixed(0)}K`,
    icon: DollarSign,
    color: "text-accent-dark",
    bg: "bg-accent/5",
    change: "+12% vs last month",
    up: true,
  },
  {
    label: "Outstanding Invoices",
    value: `$${(dashboardMetrics.outstandingInvoices / 1000).toFixed(0)}K`,
    icon: AlertTriangle,
    color: "text-warning",
    bg: "bg-warning/5",
    change: "3 overdue",
    up: false,
  },
  {
    label: "Collection Rate",
    value: `${dashboardMetrics.collectionRate}%`,
    icon: TrendingUp,
    color: "text-info",
    bg: "bg-info/5",
    change: "+2.1% vs last month",
    up: true,
  },
  {
    label: "New Clients (MTD)",
    value: dashboardMetrics.newClientsThisMonth,
    icon: Users,
    color: "text-primary-light",
    bg: "bg-primary/5",
    change: "+2 vs last month",
    up: true,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted text-sm">Welcome back, Margaret. Here&apos;s your firm overview.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/matters/new"
            className="bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + New Matter
          </Link>
          <Link
            href="/dashboard/billing"
            className="bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Time Entry
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricCards.map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${m.bg}`}>
                <m.icon size={20} className={m.color} />
              </div>
              <span
                className={`flex items-center gap-1 text-xs font-medium ${
                  m.up ? "text-success" : "text-warning"
                }`}
              >
                {m.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {m.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground">{m.value}</div>
            <div className="text-sm text-muted">
              {m.label}
              {m.total ? ` (${m.total} total)` : ""}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-border p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}K`} />
              <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
              <Bar dataKey="revenue" fill="#c8a951" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Practice Area Revenue */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Revenue by Practice Area</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={practiceAreaRevenue}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={false}
                fontSize={10}
              >
                {practiceAreaRevenue.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: Tasks & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Upcoming Tasks</h2>
            <Link href="/dashboard/matters" className="text-sm text-accent font-medium hover:text-accent-dark">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {sampleTasks
              .filter((t) => t.status !== "completed")
              .slice(0, 5)
              .map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted-light transition-colors">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      task.priority === "urgent"
                        ? "bg-danger"
                        : task.priority === "high"
                        ? "bg-warning"
                        : "bg-info"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground truncate">{task.title}</div>
                    <div className="text-xs text-muted">
                      {task.assignedTo} · Due: {task.dueDate}
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded font-medium ${
                      task.status === "overdue"
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
        </div>

        {/* Recent Time Entries */}
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Recent Time Entries</h2>
            <Link href="/dashboard/billing" className="text-sm text-accent font-medium hover:text-accent-dark">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {sampleTimeEntries.slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted-light transition-colors">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock size={14} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground truncate">{entry.description}</div>
                  <div className="text-xs text-muted">
                    {entry.attorneyName} · {entry.matterTitle}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-foreground">{entry.hours}h</div>
                  <div className="text-xs text-muted">${(entry.hours * entry.rate).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Matters */}
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Active Matters</h2>
          <Link href="/dashboard/matters" className="text-sm text-accent font-medium hover:text-accent-dark">
            View All Matters
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="py-3 pr-4 font-medium">Case #</th>
                <th className="py-3 pr-4 font-medium">Matter</th>
                <th className="py-3 pr-4 font-medium">Client</th>
                <th className="py-3 pr-4 font-medium">Attorney</th>
                <th className="py-3 pr-4 font-medium">Practice Area</th>
                <th className="py-3 pr-4 font-medium">Priority</th>
                <th className="py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {sampleMatters
                .filter((m) => m.status === "active")
                .map((matter) => (
                  <tr key={matter.id} className="border-b border-border/50 hover:bg-muted-light transition-colors">
                    <td className="py-3 pr-4 font-mono text-xs">{matter.caseNumber}</td>
                    <td className="py-3 pr-4">
                      <Link href={`/dashboard/matters/${matter.id}`} className="font-medium text-primary hover:text-accent">
                        {matter.title}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-muted">{matter.clientName}</td>
                    <td className="py-3 pr-4 text-muted">{matter.assignedAttorneyName}</td>
                    <td className="py-3 pr-4">
                      <span className="text-xs bg-primary/5 text-primary px-2 py-1 rounded">{matter.practiceArea}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`text-xs px-2 py-1 rounded font-medium ${
                          matter.priority === "urgent"
                            ? "bg-danger/10 text-danger"
                            : matter.priority === "high"
                            ? "bg-warning/10 text-warning"
                            : "bg-info/10 text-info"
                        }`}
                      >
                        {matter.priority}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="text-xs bg-success/10 text-success px-2 py-1 rounded font-medium">
                        {matter.status}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
