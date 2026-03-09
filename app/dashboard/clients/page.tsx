"use client";

import { useState } from "react";
import { Search, Plus, Phone, Mail, Building, User } from "lucide-react";

const clients = [
  { id: "C-001", name: "TechCorp International", contact: "Robert Chen", email: "r.chen@techcorp.com", phone: "(555) 123-4567", type: "Corporate", activeMaters: 2, totalBilled: 284750, status: "active" },
  { id: "C-002", name: "Marcus Henderson", contact: "Marcus Henderson", email: "m.henderson@email.com", phone: "(555) 234-5678", type: "Individual", activeMaters: 1, totalBilled: 142500, status: "active" },
  { id: "C-003", name: "Martinez Family", contact: "Elena Martinez", email: "e.martinez@email.com", phone: "(555) 345-6789", type: "Individual", activeMaters: 1, totalBilled: 28750, status: "active" },
  { id: "C-004", name: "Whitfield Trust", contact: "Harold Whitfield", email: "h.whitfield@whitfieldtrust.com", phone: "(555) 456-7890", type: "Trust", activeMaters: 1, totalBilled: 45200, status: "active" },
  { id: "C-005", name: "Apex Development Group", contact: "James Morrison", email: "j.morrison@apexdev.com", phone: "(555) 567-8901", type: "Corporate", activeMaters: 1, totalBilled: 89300, status: "active" },
  { id: "C-006", name: "NovaTech Industries", contact: "Sarah Nova", email: "s.nova@novatech.io", phone: "(555) 678-9012", type: "Corporate", activeMaters: 1, totalBilled: 167500, status: "active" },
  { id: "C-007", name: "Johnson & Associates", contact: "Michael Johnson", email: "m.johnson@jassoc.com", phone: "(555) 789-0123", type: "Corporate", activeMaters: 0, totalBilled: 215000, status: "inactive" },
  { id: "C-008", name: "Patricia Wexler", contact: "Patricia Wexler", email: "p.wexler@email.com", phone: "(555) 890-1234", type: "Individual", activeMaters: 0, totalBilled: 34500, status: "inactive" },
];

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = clients.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.contact.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || c.type.toLowerCase() === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clients</h1>
          <p className="text-muted text-sm">Manage client relationships and contact information</p>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Add Client
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="text-sm text-muted mb-1">Total Clients</div>
          <div className="text-2xl font-bold text-foreground">{clients.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="text-sm text-muted mb-1">Active</div>
          <div className="text-2xl font-bold text-success">{clients.filter((c) => c.status === "active").length}</div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="text-sm text-muted mb-1">Corporate</div>
          <div className="text-2xl font-bold text-primary">{clients.filter((c) => c.type === "Corporate").length}</div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="text-sm text-muted mb-1">Total Billed</div>
          <div className="text-2xl font-bold text-accent-dark">
            ${(clients.reduce((s, c) => s + c.totalBilled, 0) / 1000).toFixed(0)}K
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          {["all", "corporate", "individual", "trust"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                typeFilter === t ? "bg-primary text-white" : "bg-muted-light text-muted hover:bg-primary/5"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((client) => (
          <div key={client.id} className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  client.type === "Corporate" ? "bg-primary/10 text-primary" : client.type === "Trust" ? "bg-accent/20 text-accent-dark" : "bg-success/10 text-success"
                }`}>
                  {client.type === "Corporate" ? <Building size={18} /> : <User size={18} />}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{client.name}</h3>
                  <span className="text-xs text-muted">{client.type}</span>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                client.status === "active" ? "bg-success/10 text-success" : "bg-muted-light text-muted"
              }`}>
                {client.status}
              </span>
            </div>
            <div className="space-y-2 text-xs text-muted mb-4">
              <div className="flex items-center gap-2"><User size={14} /> {client.contact}</div>
              <div className="flex items-center gap-2"><Mail size={14} /> {client.email}</div>
              <div className="flex items-center gap-2"><Phone size={14} /> {client.phone}</div>
            </div>
            <div className="flex justify-between text-xs border-t border-border pt-3">
              <div>
                <span className="text-muted">Active Matters:</span>
                <span className="ml-1 font-semibold text-foreground">{client.activeMaters}</span>
              </div>
              <div>
                <span className="text-muted">Total Billed:</span>
                <span className="ml-1 font-semibold text-foreground">${client.totalBilled.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
