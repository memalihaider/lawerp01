"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { TrendingUp, DollarSign, Users, Briefcase } from "lucide-react";

const monthlyRevenue = [
  { month: "Oct", revenue: 285000, collected: 268000 },
  { month: "Nov", revenue: 312000, collected: 295000 },
  { month: "Dec", revenue: 298000, collected: 282000 },
  { month: "Jan", revenue: 342000, collected: 320000 },
  { month: "Feb", revenue: 378000, collected: 362000 },
  { month: "Mar", revenue: 425000, collected: 398000 },
];

const practiceRevenue = [
  { name: "Corporate", value: 450000, color: "#1e3a5f" },
  { name: "Litigation", value: 380000, color: "#2d5a8e" },
  { name: "Family Law", value: 120000, color: "#c8a951" },
  { name: "Estate Planning", value: 95000, color: "#8b6914" },
  { name: "Real Estate", value: 180000, color: "#3b82f6" },
  { name: "IP Law", value: 210000, color: "#10b981" },
];

const attorneyPerformance = [
  { name: "M. Chen", hours: 185, billable: 168, revenue: 92400, rate: 550, utilization: 91 },
  { name: "J. Okafor", hours: 176, billable: 155, revenue: 69750, rate: 450, utilization: 88 },
  { name: "S. Ramirez", hours: 165, billable: 142, revenue: 49700, rate: 350, utilization: 86 },
  { name: "W. Hartford", hours: 160, billable: 135, revenue: 54000, rate: 400, utilization: 84 },
  { name: "A. Patel", hours: 170, billable: 148, revenue: 59200, rate: 400, utilization: 87 },
  { name: "D. Kim", hours: 178, billable: 160, revenue: 72000, rate: 450, utilization: 90 },
];

const utilizationTrend = [
  { month: "Oct", target: 85, actual: 82 },
  { month: "Nov", target: 85, actual: 84 },
  { month: "Dec", target: 85, actual: 79 },
  { month: "Jan", target: 85, actual: 86 },
  { month: "Feb", target: 85, actual: 88 },
  { month: "Mar", target: 85, actual: 89 },
];

export default function ReportsPage() {
  const [period, setPeriod] = useState("6m");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted text-sm">Business intelligence and performance metrics</p>
        </div>
        <div className="flex gap-1 bg-muted-light rounded-lg p-0.5">
          {["1m", "3m", "6m", "1y"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                period === p ? "bg-primary text-white" : "text-muted hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: "$2.04M", change: "+12.5%", icon: DollarSign, color: "text-success" },
          { label: "Avg Utilization", value: "87.3%", change: "+3.2%", icon: TrendingUp, color: "text-primary" },
          { label: "Active Matters", value: "127", change: "+8", icon: Briefcase, color: "text-info" },
          { label: "Client Retention", value: "94.2%", change: "+1.8%", icon: Users, color: "text-accent-dark" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted">{kpi.label}</span>
              <kpi.icon size={18} className={kpi.color} />
            </div>
            <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
            <div className={`text-xs mt-1 ${kpi.color}`}>{kpi.change} from prior period</div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Revenue vs Collections</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} tickFormatter={(v) => `$${v / 1000}K`} />
              <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
              <Bar dataKey="collected" name="Collected" fill="#c8a951" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Revenue by Practice Area</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={practiceRevenue} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" paddingAngle={3}>
                {practiceRevenue.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `$${(Number(v) / 1000).toFixed(0)}K`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {practiceRevenue.map((p) => (
              <div key={p.name} className="flex items-center gap-1.5 text-xs text-muted">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                {p.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Utilization Trend */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-semibold text-foreground mb-4">Utilization Rate Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={utilizationTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" fontSize={12} />
            <YAxis fontSize={12} domain={[70, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Legend />
            <Line type="monotone" dataKey="actual" name="Actual" stroke="#1e3a5f" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="target" name="Target" stroke="#c8a951" strokeWidth={2} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Attorney Performance */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-semibold text-foreground mb-4">Attorney Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="py-3 px-4 font-medium">Attorney</th>
                <th className="py-3 px-4 font-medium">Total Hours</th>
                <th className="py-3 px-4 font-medium">Billable Hours</th>
                <th className="py-3 px-4 font-medium">Revenue</th>
                <th className="py-3 px-4 font-medium">Avg Rate</th>
                <th className="py-3 px-4 font-medium">Utilization</th>
              </tr>
            </thead>
            <tbody>
              {attorneyPerformance.map((a) => (
                <tr key={a.name} className="border-b border-border/50 hover:bg-muted-light/50">
                  <td className="py-3 px-4 font-medium text-foreground">{a.name}</td>
                  <td className="py-3 px-4 text-muted">{a.hours}</td>
                  <td className="py-3 px-4 text-muted">{a.billable}</td>
                  <td className="py-3 px-4 font-medium text-foreground">${a.revenue.toLocaleString()}</td>
                  <td className="py-3 px-4 text-muted">${a.rate}/hr</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted-light rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${a.utilization >= 85 ? "bg-success" : "bg-warning"}`}
                          style={{ width: `${a.utilization}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted">{a.utilization}%</span>
                    </div>
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
