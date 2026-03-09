"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { serverTimestamp } from "@/lib/firebase-service";
import { useToast } from "@/components/ui/Toast";
import { Save, User, Bell } from "lucide-react";

export default function PortalSettingsPage() {
  const { profile, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("profile");
  const [form, setForm] = useState({
    displayName: "", phone: "", company: "", address: "",
    emailNotifications: true, smsNotifications: false,
    caseUpdateAlerts: true, invoiceAlerts: true, messageAlerts: true,
  });

  useEffect(() => {
    if (profile) setForm((f) => ({
      ...f,
      displayName: profile.displayName || "",
      phone: (profile as any).phone || "",
      company: (profile as any).company || "",
      address: (profile as any).address || "",
      emailNotifications: (profile as any).emailNotifications !== false,
      smsNotifications: (profile as any).smsNotifications || false,
      caseUpdateAlerts: (profile as any).caseUpdateAlerts !== false,
      invoiceAlerts: (profile as any).invoiceAlerts !== false,
      messageAlerts: (profile as any).messageAlerts !== false,
    }));
  }, [profile]);

  async function handleSave() {
    setSaving(true);
    try {
      await updateUserProfile({ ...form, updatedAt: serverTimestamp() } as any);
      toast("success", "Settings saved");
    } catch { toast("error", "Failed to save"); }
    setSaving(false);
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">My Settings</h1><p className="text-muted text-sm">Manage your account and preferences</p></div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"><Save size={16} /> {saving ? "Saving..." : "Save"}</button>
      </div>

      <div className="flex gap-2 border-b border-border pb-0">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.id ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground"}`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border p-6 space-y-5">
        {tab === "profile" && (
          <>
            <h3 className="font-semibold text-foreground">Personal Information</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                {form.displayName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?"}
              </div>
              <div>
                <div className="font-medium text-foreground">{form.displayName || "—"}</div>
                <div className="text-sm text-muted">{profile?.email}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-foreground mb-1">Full Name</label><input value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
              <div><label className="block text-sm font-medium text-foreground mb-1">Phone</label><input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
              <div><label className="block text-sm font-medium text-foreground mb-1">Company</label><input value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
            </div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Address</label><textarea rows={2} value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none resize-none" /></div>
          </>
        )}

        {tab === "notifications" && (
          <>
            <h3 className="font-semibold text-foreground">Notification Preferences</h3>
            <div className="space-y-4">
              {[
                { key: "emailNotifications", label: "Email Notifications", desc: "Receive updates via email" },
                { key: "smsNotifications", label: "SMS Notifications", desc: "Text message alerts" },
                { key: "caseUpdateAlerts", label: "Case Updates", desc: "Notify when case status changes" },
                { key: "invoiceAlerts", label: "Invoice Alerts", desc: "Notify when new invoices are issued" },
                { key: "messageAlerts", label: "Message Alerts", desc: "Notify when you receive new messages" },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div><div className="font-medium text-sm text-foreground">{item.label}</div><div className="text-xs text-muted">{item.desc}</div></div>
                  <input type="checkbox" checked={(form as any)[item.key]} onChange={(e) => setForm((f) => ({ ...f, [item.key]: e.target.checked }))} />
                </label>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
