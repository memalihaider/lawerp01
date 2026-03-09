"use client";

import { useState } from "react";
import { Save, Building, Bell, Shield, Palette, Users } from "lucide-react";

type Tab = "firm" | "users" | "notifications" | "billing" | "security" | "appearance";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "firm", label: "Firm Profile", icon: Building },
  { id: "users", label: "User Management", icon: Users },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing Rates", icon: Save },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
];

const teamMembers = [
  { name: "Margaret Chen", email: "m.chen@largifylawship.com", role: "Partner", status: "active" },
  { name: "James Okafor", email: "j.okafor@largifylawship.com", role: "Senior Associate", status: "active" },
  { name: "Sofia Ramirez", email: "s.ramirez@largifylawship.com", role: "Associate", status: "active" },
  { name: "William Hartford", email: "w.hartford@largifylawship.com", role: "Of Counsel", status: "active" },
  { name: "Aisha Patel", email: "a.patel@largifylawship.com", role: "Associate", status: "active" },
  { name: "David Kim", email: "d.kim@largifylawship.com", role: "Associate", status: "active" },
  { name: "Sarah Mitchell", email: "s.mitchell@largifylawship.com", role: "Paralegal", status: "active" },
  { name: "Tom Richards", email: "t.richards@largifylawship.com", role: "Admin", status: "inactive" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("firm");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted text-sm">Manage firm configuration and preferences</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Save size={16} /> {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-56 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id ? "bg-primary text-white" : "text-muted hover:bg-muted-light"
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl border border-border p-6">
          {activeTab === "firm" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Firm Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Firm Name</label>
                  <input type="text" defaultValue="Largify Lawship LLP" className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
                  <input type="tel" defaultValue="(555) 000-1234" className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                  <input type="email" defaultValue="info@largifylawship.com" className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Website</label>
                  <input type="url" defaultValue="https://largifylawship.com" className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Address</label>
                  <input type="text" defaultValue="One Largify Lawship Plaza, Suite 4200, New York, NY 10004" className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                  <textarea rows={3} defaultValue="Full-service law firm providing comprehensive legal solutions across corporate, litigation, family, estate planning, real estate, and intellectual property law." className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary resize-none" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">User Management</h3>
                <button className="text-sm text-primary hover:underline">+ Invite User</button>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted">
                    <th className="py-3 px-4 font-medium">Name</th>
                    <th className="py-3 px-4 font-medium">Email</th>
                    <th className="py-3 px-4 font-medium">Role</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((m) => (
                    <tr key={m.email} className="border-b border-border/50 hover:bg-muted-light/50">
                      <td className="py-3 px-4 font-medium text-foreground">{m.name}</td>
                      <td className="py-3 px-4 text-muted">{m.email}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs bg-primary/5 text-primary px-2 py-1 rounded">{m.role}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          m.status === "active" ? "bg-success/10 text-success" : "bg-muted-light text-muted"
                        }`}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Notification Preferences</h3>
              {[
                { label: "New matter assigned", desc: "When a new matter is assigned to you", default: true },
                { label: "Task deadlines", desc: "Reminders before task due dates", default: true },
                { label: "Court date reminders", desc: "Alerts for upcoming court dates", default: true },
                { label: "Invoice payments", desc: "When client payments are received", default: true },
                { label: "Document uploads", desc: "When documents are uploaded to your matters", default: false },
                { label: "Weekly summary", desc: "Weekly email digest of activity", default: true },
                { label: "Client messages", desc: "When clients send messages via portal", default: true },
                { label: "System updates", desc: "Platform maintenance and updates", default: false },
              ].map((n) => (
                <div key={n.label} className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-sm font-medium text-foreground">{n.label}</div>
                    <div className="text-xs text-muted">{n.desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={n.default} className="sr-only peer" />
                    <div className="w-9 h-5 bg-muted-light rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Billing Rates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Default Hourly Rate</label>
                  <input type="text" defaultValue="$350.00" className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Billing Increment</label>
                  <select defaultValue="6" className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary">
                    <option value="6">6 minutes (0.1 hr)</option>
                    <option value="15">15 minutes (0.25 hr)</option>
                    <option value="30">30 minutes (0.5 hr)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Invoice Due Days</label>
                  <input type="number" defaultValue={30} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Late Fee (%)</label>
                  <input type="text" defaultValue="1.5" className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Rate by Role</h4>
                {[
                  { role: "Partner", rate: "$550" },
                  { role: "Senior Associate", rate: "$450" },
                  { role: "Associate", rate: "$350" },
                  { role: "Of Counsel", rate: "$400" },
                  { role: "Paralegal", rate: "$175" },
                ].map((r) => (
                  <div key={r.role} className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-sm text-muted">{r.role}</span>
                    <input type="text" defaultValue={r.rate} className="w-24 px-2 py-1 border border-border rounded text-sm text-right focus:outline-none focus:border-primary" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Security Settings</h3>
              {[
                { label: "Two-Factor Authentication", desc: "Require 2FA for all users", default: true },
                { label: "Session Timeout", desc: "Auto-logout after 30 minutes of inactivity", default: true },
                { label: "IP Whitelisting", desc: "Restrict access to approved IP addresses", default: false },
                { label: "Audit Logging", desc: "Log all user actions for compliance", default: true },
                { label: "Password Expiry", desc: "Require password change every 90 days", default: true },
                { label: "Client Portal Access Logs", desc: "Track client portal login activity", default: true },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-sm font-medium text-foreground">{s.label}</div>
                    <div className="text-xs text-muted">{s.desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={s.default} className="sr-only peer" />
                    <div className="w-9 h-5 bg-muted-light rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Appearance</h3>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Theme</label>
                <div className="flex gap-3">
                  {["Light", "Dark", "System"].map((t) => (
                    <button
                      key={t}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        t === "Light" ? "bg-primary text-white border-primary" : "border-border text-muted hover:border-primary"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Sidebar Style</label>
                <div className="flex gap-3">
                  {["Expanded", "Compact", "Auto-collapse"].map((s) => (
                    <button
                      key={s}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        s === "Expanded" ? "bg-primary text-white border-primary" : "border-border text-muted hover:border-primary"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Date Format</label>
                <select defaultValue="us" className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary">
                  <option value="us">MM/DD/YYYY</option>
                  <option value="eu">DD/MM/YYYY</option>
                  <option value="iso">YYYY-MM-DD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Timezone</label>
                <select defaultValue="est" className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary">
                  <option value="est">Eastern (ET)</option>
                  <option value="cst">Central (CT)</option>
                  <option value="mst">Mountain (MT)</option>
                  <option value="pst">Pacific (PT)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
