"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Filter, Plus, Briefcase } from "lucide-react";
import { sampleMatters } from "@/lib/mock-data";

export default function MattersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = sampleMatters.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.clientName.toLowerCase().includes(search.toLowerCase()) ||
      m.caseNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Matters</h1>
          <p className="text-muted text-sm">{sampleMatters.length} total matters</p>
        </div>
        <Link
          href="/dashboard/matters/new"
          className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> New Matter
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-border p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search by title, client, or case number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-muted" />
          {["all", "active", "open", "pending", "closed"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                statusFilter === s
                  ? "bg-primary text-white"
                  : "bg-muted-light text-muted hover:bg-primary/5"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Matters Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted-light border-b border-border text-left text-muted">
                <th className="py-3 px-4 font-medium">Case #</th>
                <th className="py-3 px-4 font-medium">Matter Title</th>
                <th className="py-3 px-4 font-medium">Client</th>
                <th className="py-3 px-4 font-medium">Assigned Attorney</th>
                <th className="py-3 px-4 font-medium">Practice Area</th>
                <th className="py-3 px-4 font-medium">Priority</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Opened</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((matter) => (
                <tr key={matter.id} className="border-b border-border/50 hover:bg-muted-light/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-muted">{matter.caseNumber}</td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/dashboard/matters/${matter.id}`}
                      className="font-medium text-primary hover:text-accent transition-colors"
                    >
                      {matter.title}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-muted">{matter.clientName}</td>
                  <td className="py-3 px-4 text-muted">{matter.assignedAttorneyName}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs bg-primary/5 text-primary px-2 py-1 rounded">{matter.practiceArea}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs px-2 py-1 rounded font-medium ${
                        matter.priority === "urgent"
                          ? "bg-danger/10 text-danger"
                          : matter.priority === "high"
                          ? "bg-warning/10 text-warning"
                          : matter.priority === "medium"
                          ? "bg-info/10 text-info"
                          : "bg-muted-light text-muted"
                      }`}
                    >
                      {matter.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs px-2 py-1 rounded font-medium ${
                        matter.status === "active"
                          ? "bg-success/10 text-success"
                          : matter.status === "open"
                          ? "bg-info/10 text-info"
                          : matter.status === "closed"
                          ? "bg-muted-light text-muted"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {matter.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted text-xs">{matter.openDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted">
            <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
            <p>No matters found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
