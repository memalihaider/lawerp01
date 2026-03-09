"use client";

import Link from "next/link";
import { Globe, FileText, BookOpen, Users, Briefcase, MessageSquare, Settings } from "lucide-react";

const cmsLinks = [
  { href: "/admin/website/settings", icon: Settings, title: "Site Settings", desc: "Firm name, logo, contact info, colors, SEO" },
  { href: "/admin/website/pages", icon: FileText, title: "Pages", desc: "Edit homepage, about, and custom pages" },
  { href: "/admin/website/blog", icon: BookOpen, title: "Blog Posts", desc: "Create and manage blog articles" },
  { href: "/admin/website/attorneys", icon: Users, title: "Attorney Profiles", desc: "Manage attorney bios and photos" },
  { href: "/admin/website/services", icon: Briefcase, title: "Practice Areas", desc: "Edit services and practice areas" },
  { href: "/admin/website/testimonials", icon: MessageSquare, title: "Testimonials", desc: "Manage client testimonials" },
];

export default function WebsiteCMSPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Website CMS</h1>
        <p className="text-muted text-sm">Manage and customize your firm&apos;s website</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cmsLinks.map((link) => (
          <Link key={link.href} href={link.href}
            className="bg-white rounded-xl border border-border p-5 hover:shadow-md hover:border-primary/30 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
              <link.icon size={20} className="text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">{link.title}</h3>
            <p className="text-sm text-muted">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
