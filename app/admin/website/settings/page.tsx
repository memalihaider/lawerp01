"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { useSiteSettings } from "@/lib/hooks";
import { setDocument, serverTimestamp } from "@/lib/firebase-service";
import { useToast } from "@/components/ui/Toast";

export default function SiteSettingsPage() {
  const { data: settings, loading } = useSiteSettings();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firmName: "Largify Lawship",
    tagline: "Excellence in Legal Services",
    phone: "(555) 123-4567",
    email: "info@largifylawship.com",
    address: "100 Legal Plaza, Suite 500, New York, NY 10001",
    primaryColor: "#1e3a5f",
    accentColor: "#c8a951",
    metaTitle: "Largify Lawship | Law Firm",
    metaDescription: "Premier law firm offering expert legal services.",
    googleAnalyticsId: "",
    socialFacebook: "",
    socialTwitter: "",
    socialLinkedin: "",
    footerText: "© 2026 Largify Lawship. All rights reserved.",
  });

  useEffect(() => {
    if (settings) {
      setForm((f) => ({ ...f, ...settings }));
    }
  }, [settings]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await setDocument("settings", "site", { ...form, updatedAt: serverTimestamp() });
      toast("success", "Site settings saved");
    } catch {
      toast("error", "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-center py-12 text-muted">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Site Settings</h1><p className="text-muted text-sm">General website configuration</p></div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
          <Save size={16} /> {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 space-y-5">
        <h3 className="font-semibold text-foreground">General</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-foreground mb-1">Firm Name</label>
            <input name="firmName" value={form.firmName} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Tagline</label>
            <input name="tagline" value={form.tagline} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
        </div>

        <h3 className="font-semibold text-foreground pt-4">Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-foreground mb-1">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input name="email" value={form.email} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
        </div>
        <div><label className="block text-sm font-medium text-foreground mb-1">Address</label>
          <input name="address" value={form.address} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>

        <h3 className="font-semibold text-foreground pt-4">Branding</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-foreground mb-1">Primary Color</label>
            <div className="flex gap-2 items-center"><input type="color" name="primaryColor" value={form.primaryColor} onChange={handleChange} className="w-10 h-10 rounded border border-border cursor-pointer" />
              <input name="primaryColor" value={form.primaryColor} onChange={handleChange} className="flex-1 px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div></div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Accent Color</label>
            <div className="flex gap-2 items-center"><input type="color" name="accentColor" value={form.accentColor} onChange={handleChange} className="w-10 h-10 rounded border border-border cursor-pointer" />
              <input name="accentColor" value={form.accentColor} onChange={handleChange} className="flex-1 px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div></div>
        </div>

        <h3 className="font-semibold text-foreground pt-4">SEO</h3>
        <div><label className="block text-sm font-medium text-foreground mb-1">Meta Title</label>
          <input name="metaTitle" value={form.metaTitle} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
        <div><label className="block text-sm font-medium text-foreground mb-1">Meta Description</label>
          <textarea name="metaDescription" value={form.metaDescription} onChange={handleChange} rows={2} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none resize-none" /></div>

        <h3 className="font-semibold text-foreground pt-4">Social</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className="block text-sm font-medium text-foreground mb-1">Facebook</label>
            <input name="socialFacebook" value={form.socialFacebook} onChange={handleChange} placeholder="https://..." className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Twitter</label>
            <input name="socialTwitter" value={form.socialTwitter} onChange={handleChange} placeholder="https://..." className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
          <div><label className="block text-sm font-medium text-foreground mb-1">LinkedIn</label>
            <input name="socialLinkedin" value={form.socialLinkedin} onChange={handleChange} placeholder="https://..." className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
        </div>

        <h3 className="font-semibold text-foreground pt-4">Footer</h3>
        <div><label className="block text-sm font-medium text-foreground mb-1">Footer Text</label>
          <input name="footerText" value={form.footerText} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" /></div>
      </div>
    </div>
  );
}
