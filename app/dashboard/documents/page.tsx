"use client";

import { useState } from "react";
import { FileText, Upload, Search, Folder, File, Image, FileCode, Grid, List } from "lucide-react";

const sampleDocuments = [
  { id: "D-001", name: "Acquisition Agreement - Draft v3.docx", type: "docx", size: 245000, matter: "TechCorp Acquisition", category: "contract", uploadedBy: "Margaret Chen", date: "2026-03-08" },
  { id: "D-002", name: "Motion to Dismiss - Class Cert.pdf", type: "pdf", size: 890000, matter: "Henderson v. Global Mfg", category: "pleading", uploadedBy: "James Okafor", date: "2026-03-07" },
  { id: "D-003", name: "Custody Motion - Martinez.pdf", type: "pdf", size: 320000, matter: "Martinez Divorce", category: "pleading", uploadedBy: "Sofia Ramirez", date: "2026-03-06" },
  { id: "D-004", name: "Whitfield Asset Inventory.xlsx", type: "xlsx", size: 156000, matter: "Whitfield Estate Plan", category: "internal", uploadedBy: "William Hartford", date: "2026-03-05" },
  { id: "D-005", name: "Zoning Variance Application.pdf", type: "pdf", size: 1200000, matter: "Apex Tower Development", category: "correspondence", uploadedBy: "Aisha Patel", date: "2026-03-04" },
  { id: "D-006", name: "Patent Claims - App #3.docx", type: "docx", size: 178000, matter: "NovaTech Patent Portfolio", category: "contract", uploadedBy: "David Kim", date: "2026-03-03" },
  { id: "D-007", name: "Due Diligence Report.pdf", type: "pdf", size: 2450000, matter: "TechCorp Acquisition", category: "internal", uploadedBy: "Margaret Chen", date: "2026-03-02" },
  { id: "D-008", name: "Employment Records - Exhibit A.pdf", type: "pdf", size: 560000, matter: "Henderson v. Global Mfg", category: "evidence", uploadedBy: "James Okafor", date: "2026-03-01" },
];

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  switch (type) {
    case "pdf": return <FileText size={20} className="text-danger" />;
    case "docx": return <FileCode size={20} className="text-info" />;
    case "xlsx": return <File size={20} className="text-success" />;
    case "jpg": case "png": return <Image size={20} className="text-accent" />;
    default: return <File size={20} className="text-muted" />;
  }
}

export default function DocumentsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const filtered = sampleDocuments.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.matter.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "all" || d.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documents</h1>
          <p className="text-muted text-sm">Centralized document management and storage</p>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Upload size={16} /> Upload Document
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="text-sm text-muted mb-1">Total Documents</div>
          <div className="text-2xl font-bold text-foreground">{sampleDocuments.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="text-sm text-muted mb-1">Total Size</div>
          <div className="text-2xl font-bold text-info">
            {formatSize(sampleDocuments.reduce((s, d) => s + d.size, 0))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="text-sm text-muted mb-1">Uploaded This Month</div>
          <div className="text-2xl font-bold text-success">{sampleDocuments.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="text-sm text-muted mb-1">Categories</div>
          <div className="text-2xl font-bold text-accent-dark">5</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-border p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          {["all", "pleading", "contract", "correspondence", "evidence", "internal"].map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                categoryFilter === c ? "bg-primary text-white" : "bg-muted-light text-muted hover:bg-primary/5"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-1 border border-border rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded ${viewMode === "list" ? "bg-primary text-white" : "text-muted"}`}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded ${viewMode === "grid" ? "bg-primary text-white" : "text-muted"}`}
          >
            <Grid size={16} />
          </button>
        </div>
      </div>

      {/* Documents */}
      {viewMode === "list" ? (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted-light border-b border-border text-left text-muted">
                <th className="py-3 px-4 font-medium">Name</th>
                <th className="py-3 px-4 font-medium">Matter</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Size</th>
                <th className="py-3 px-4 font-medium">Uploaded By</th>
                <th className="py-3 px-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => (
                <tr key={doc.id} className="border-b border-border/50 hover:bg-muted-light/50 transition-colors cursor-pointer">
                  <td className="py-3 px-4 flex items-center gap-3">
                    {getFileIcon(doc.type)}
                    <span className="font-medium text-foreground">{doc.name}</span>
                  </td>
                  <td className="py-3 px-4 text-primary">{doc.matter}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs bg-primary/5 text-primary px-2 py-1 rounded capitalize">{doc.category}</span>
                  </td>
                  <td className="py-3 px-4 text-muted">{formatSize(doc.size)}</td>
                  <td className="py-3 px-4 text-muted">{doc.uploadedBy}</td>
                  <td className="py-3 px-4 text-muted">{doc.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl border border-border p-4 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                {getFileIcon(doc.type)}
                <span className="text-xs bg-primary/5 text-primary px-2 py-0.5 rounded capitalize">{doc.category}</span>
              </div>
              <h3 className="font-medium text-sm text-foreground mb-1 truncate">{doc.name}</h3>
              <p className="text-xs text-muted mb-2">{doc.matter}</p>
              <div className="text-xs text-muted flex justify-between">
                <span>{formatSize(doc.size)}</span>
                <span>{doc.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
