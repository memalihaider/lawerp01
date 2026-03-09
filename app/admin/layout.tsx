"use client";

import SidebarLayout, { SidebarLink } from "@/components/ui/SidebarLayout";
import RouteGuard from "@/components/RouteGuard";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Clock,
  DollarSign,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  Globe,
  Shield,
  MessageSquare,
  Building,
  Gavel,
  UserCog,
} from "lucide-react";

const adminLinks: SidebarLink[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/admin/matters",
    label: "Matters",
    icon: Briefcase,
    children: [
      { href: "/admin/matters", label: "All Matters" },
      { href: "/admin/matters/new", label: "New Matter" },
    ],
  },
  {
    href: "/admin/clients",
    label: "Clients",
    icon: Users,
    children: [
      { href: "/admin/clients", label: "All Clients" },
      { href: "/admin/clients/new", label: "New Client" },
    ],
  },
  {
    href: "/admin/staff",
    label: "Staff & Attorneys",
    icon: UserCog,
    children: [
      { href: "/admin/staff", label: "All Staff" },
      { href: "/admin/staff/new", label: "Add Staff" },
      { href: "/admin/staff/roles", label: "Roles & Permissions" },
    ],
  },
  { href: "/admin/billing", label: "Billing & Time", icon: Clock },
  { href: "/admin/invoices", label: "Invoices", icon: DollarSign },
  { href: "/admin/documents", label: "Documents", icon: FileText },
  { href: "/admin/calendar", label: "Calendar", icon: Calendar },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  {
    href: "/admin/website",
    label: "Website CMS",
    icon: Globe,
    children: [
      { href: "/admin/website", label: "Site Settings" },
      { href: "/admin/website/pages", label: "Pages" },
      { href: "/admin/website/blog", label: "Blog Posts" },
      { href: "/admin/website/attorneys", label: "Attorney Profiles" },
      { href: "/admin/website/services", label: "Practice Areas" },
      { href: "/admin/website/testimonials", label: "Testimonials" },
    ],
  },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={["admin"]}>
      <SidebarLayout links={adminLinks} portalLabel="Admin Portal" portalColor="bg-primary-dark">
        {children}
      </SidebarLayout>
    </RouteGuard>
  );
}
