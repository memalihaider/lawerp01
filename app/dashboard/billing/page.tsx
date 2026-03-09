"use client";

import { useState } from "react";
import { Clock, DollarSign, Plus, Play, Square, Timer, Search } from "lucide-react";
import { sampleTimeEntries, sampleMatters, attorneys } from "@/lib/mock-data";

export default function BillingPage() {
  const [search, setSearch] = useState("");
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerMatter, setTimerMatter] = useState("");
  const [timerDesc, setTimerDesc] = useState("");
  const [showNewEntry, setShowNewEntry] = useState(false);

  const totalHours = sampleTimeEntries.reduce((s, e) => s + e.hours, 0);
  const totalRevenue = sampleTimeEntries.reduce((s, e) => s + e.hours * e.rate, 0);
  const billableHours = sampleTimeEntries.filter((e) => e.billable).reduce((s, e) => s + e.hours, 0);

  const filtered = sampleTimeEntries.filter(
    (e) =>
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.matterTitle.toLowerCase().includes(search.toLowerCase()) ||
      e.attorneyName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing & Time Tracking</h1>
          <p className="text-muted text-sm">Track billable hours and manage time entries</p>
        </div>
        <button
          onClick={() => setShowNewEntry(!showNewEntry)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> New Time Entry
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="text-sm text-muted mb-1">Total Hours (MTD)</div>
          <div className="text-2xl font-bold text-foreground">{totalHours.toFixed(1)}h</div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="text-sm text-muted mb-1">Billable Hours</div>
          <div className="text-2xl font-bold text-success">{billableHours.toFixed(1)}h</div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="text-sm text-muted mb-1">Revenue (MTD)</div>
          <div className="text-2xl font-bold text-accent-dark">${totalRevenue.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="text-sm text-muted mb-1">Avg Rate</div>
          <div className="text-2xl font-bold text-primary">
            ${totalHours > 0 ? Math.round(totalRevenue / totalHours) : 0}/hr
          </div>
        </div>
      </div>

      {/* Timer */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Timer size={20} className="text-accent" /> Quick Timer
        </h2>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-1">Matter</label>
            <select
              value={timerMatter}
              onChange={(e) => setTimerMatter(e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
            >
              <option value="">Select matter</option>
              {sampleMatters.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.caseNumber} — {m.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <input
              type="text"
              value={timerDesc}
              onChange={(e) => setTimerDesc(e.target.value)}
              placeholder="What are you working on?"
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={() => setTimerRunning(!timerRunning)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              timerRunning
                ? "bg-danger hover:bg-danger/90 text-white"
                : "bg-success hover:bg-success/90 text-white"
            }`}
          >
            {timerRunning ? (
              <>
                <Square size={16} /> Stop
              </>
            ) : (
              <>
                <Play size={16} /> Start
              </>
            )}
          </button>
        </div>
        {timerRunning && (
          <div className="mt-4 p-3 bg-success/5 rounded-lg flex items-center gap-3">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-sm text-success font-medium">Timer running — 00:12:34</span>
          </div>
        )}
      </div>

      {/* New Entry Form */}
      {showNewEntry && (
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Manual Time Entry</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Matter</label>
              <select className="w-full px-4 py-2.5 border border-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary">
                <option value="">Select matter</option>
                {sampleMatters.map((m) => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Date</label>
              <input
                type="date"
                className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Hours</label>
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="0.0"
                className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">Description</label>
              <input
                type="text"
                placeholder="Work performed"
                className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex items-end">
              <button className="w-full bg-accent hover:bg-accent-dark text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                Save Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Entries Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search time entries..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted-light border-b border-border text-left text-muted">
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium">Attorney</th>
                <th className="py-3 px-4 font-medium">Matter</th>
                <th className="py-3 px-4 font-medium">Description</th>
                <th className="py-3 px-4 font-medium">Hours</th>
                <th className="py-3 px-4 font-medium">Rate</th>
                <th className="py-3 px-4 font-medium">Amount</th>
                <th className="py-3 px-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.id} className="border-b border-border/50 hover:bg-muted-light/50 transition-colors">
                  <td className="py-3 px-4 text-muted">{entry.date}</td>
                  <td className="py-3 px-4">{entry.attorneyName}</td>
                  <td className="py-3 px-4 text-primary font-medium">{entry.matterTitle}</td>
                  <td className="py-3 px-4 text-muted max-w-xs truncate">{entry.description}</td>
                  <td className="py-3 px-4 font-semibold">{entry.hours}h</td>
                  <td className="py-3 px-4 text-muted">${entry.rate}</td>
                  <td className="py-3 px-4 font-semibold">${(entry.hours * entry.rate).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs px-2 py-1 rounded font-medium ${
                        entry.status === "approved"
                          ? "bg-success/10 text-success"
                          : entry.status === "billed"
                          ? "bg-primary/10 text-primary"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {entry.status}
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
