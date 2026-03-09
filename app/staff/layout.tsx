"use client";

import SidebarLayout, { SidebarLink } from "@/components/ui/SidebarLayout";
import RouteGuard from "@/components/RouteGuard";
import {
  LayoutDashboard,
  Briefcase,
  Clock,
  FileText,
  Calendar,
  MessageSquare,
  Settings,
} from "lucide-react";

const staffLinks: SidebarLink[] = [
  { href: "/staff", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/staff/matters",
    label: "My Matters",
    icon: Briefcase,
    children: [
      { href: "/staff/matters", label: "Active Cases" },
    ],
  },
  { href: "/staff/timesheet", label: "Timesheet", icon: Clock },
  { href: "/staff/documents", label: "Documents", icon: FileText },
  { href: "/staff/calendar", label: "Calendar", icon: Calendar },
  { href: "/staff/messages", label: "Messages", icon: MessageSquare },
  { href: "/staff/settings", label: "My Settings", icon: Settings },
];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={["admin", "partner", "attorney", "paralegal", "staff"]}>
      <SidebarLayout links={staffLinks} portalLabel="Staff Portal" portalColor="bg-[#0f4c75]">
        {children}
      </SidebarLayout>
    </RouteGuard>
  );
}
