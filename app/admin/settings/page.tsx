"use client";

import { useState, useEffect } from "react";
import { Save, Building2, Bell, Shield, Database } from "lucide-react";
import { useSiteSettings } from "@/lib/hooks";
import { setDocument, serverTimestamp } from "@/lib/firebase-service";
import { useToast } from "@/components/ui/Toast";

export default function SettingsPage() {
  const { toast } = useToast();
  const { data: settings } = useSiteSettings();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("firm");
  const [form, setForm] = useState({
    firmName: "Largify Lawship", firmType: "LLP", taxId: "", timezone: "America/New_York",
    fiscalYearStart: "January", defaultHourlyRate: 350, defaultCurrency: "USD",
    billingIncrements: "6", invoicePrefix: "INV", invoiceDueDays: 30,
    emailNotifications: true, smsNotifications: false,
    twoFactorAuth: false, sessionTimeout: 30, passwordPolicy: "strong",
    backupFrequency: "daily", dataRetentionYears: 7,
  });

  useEffect(() => {
    if (settings) setForm((f) => ({ ...f, ...settings }));
  }, [settings]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : type === "number" ? Number(value) : value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await setDocument("settings", "firm", { ...form, updatedAt: serverTimestamp() });
      toast("success", "Settings saved");
    } catch { toast("error", "Failed to save"); }
    finally { setSaving(false); }
  }

  const tabs = [
    { id: "firm", label: "Firm", icon: Building2 },
    { id: "billing", label: "Billing", icon: Database },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Settings</h1><p className="text-muted text-sm">Firm-wide configuration</p></div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
          <Save size={16} /> {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="flex gap-2 border-b border-border pb-0">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === t.id ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground"
            }`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border p-6 space-y-5">
        {activeTab === "firm" && (
          <>
            <h3 className="font-semibold text-foreground">Firm Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-foreground mb-1">Firm Name</label>
                <input name="firmName" value={form.firmName} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
              <div><label className="block text-sm font-medium text-foreground mb-1">Firm Type</label>
                <select name="firmType" value={form.firmType} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none">
                  <option value="LLP">LLP</option><option value="LLC">LLC</option><option value="PC">PC</option><option value="Solo">Solo Practice</option>
                </select></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-foreground mb-1">Tax ID</label>
                <input name="taxId" value={form.taxId} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
              <div><label className="block text-sm font-medium text-foreground mb-1">Timezone</label>
                <select name="timezone" value={form.timezone} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none">
                  <option value="America/New_York">Eastern</option><option value="America/Chicago">Central</option><option value="America/Denver">Mountain</option><option value="America/Los_Angeles">Pacific</option>
                </select></div>
            </div>
          </>
        )}

        {activeTab === "billing" && (
          <>
            <h3 className="font-semibold text-foreground">Billing Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-foreground mb-1">Default Hourly Rate ($)</label>
                <input type="number" name="defaultHourlyRate" value={form.defaultHourlyRate} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
              <div><label className="block text-sm font-medium text-foreground mb-1">Currency</label>
                <select name="defaultCurrency" value={form.defaultCurrency} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none">
                  <option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="CAD">CAD</option>
                </select></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="block text-sm font-medium text-foreground mb-1">Billing Increments (min)</label>
                <select name="billingIncrements" value={form.billingIncrements} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none">
                  <option value="6">6 min (0.1 hr)</option><option value="15">15 min (0.25 hr)</option><option value="30">30 min (0.5 hr)</option>
                </select></div>
              <div><label className="block text-sm font-medium text-foreground mb-1">Invoice Prefix</label>
                <input name="invoicePrefix" value={form.invoicePrefix} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
              <div><label className="block text-sm font-medium text-foreground mb-1">Default Due (days)</label>
                <input type="number" name="invoiceDueDays" value={form.invoiceDueDays} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
            </div>
          </>
        )}

        {activeTab === "notifications" && (
          <>
            <h3 className="font-semibold text-foreground">Notification Preferences</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div><div className="font-medium text-sm text-foreground">Email Notifications</div><div className="text-xs text-muted">Receive updates via email</div></div>
                <input type="checkbox" name="emailNotifications" checked={form.emailNotifications} onChange={handleChange} className="rounded" />
              </label>
              <label className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div><div className="font-medium text-sm text-foreground">SMS Notifications</div><div className="text-xs text-muted">Receive text message alerts</div></div>
                <input type="checkbox" name="smsNotifications" checked={form.smsNotifications} onChange={handleChange} className="rounded" />
              </label>
            </div>
          </>
        )}

        {activeTab === "security" && (
          <>
            <h3 className="font-semibold text-foreground">Security Settings</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div><div className="font-medium text-sm text-foreground">Two-Factor Authentication</div><div className="text-xs text-muted">Require 2FA for all users</div></div>
                <input type="checkbox" name="twoFactorAuth" checked={form.twoFactorAuth} onChange={handleChange} className="rounded" />
              </label>
              <div><label className="block text-sm font-medium text-foreground mb-1">Session Timeout (minutes)</label>
                <input type="number" name="sessionTimeout" value={form.sessionTimeout} onChange={handleChange} className="w-full max-w-xs px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
              <div><label className="block text-sm font-medium text-foreground mb-1">Password Policy</label>
                <select name="passwordPolicy" value={form.passwordPolicy} onChange={handleChange} className="w-full max-w-xs px-3 py-2 rounded-lg border border-border text-sm outline-none">
                  <option value="basic">Basic (8+ chars)</option><option value="strong">Strong (8+ chars, mixed case, numbers)</option><option value="strict">Strict (12+ chars, symbols required)</option>
                </select></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
