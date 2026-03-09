"use client";

import SidebarLayout, { SidebarLink } from "@/components/ui/SidebarLayout";
import RouteGuard from "@/components/RouteGuard";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  MessageSquare,
  CreditCard,
  Settings,
} from "lucide-react";

const clientLinks: SidebarLink[] = [
  { href: "/portal", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/cases", label: "My Cases", icon: Briefcase },
  { href: "/portal/documents", label: "Documents", icon: FileText },
  { href: "/portal/messages", label: "Messages", icon: MessageSquare },
  { href: "/portal/invoices", label: "Invoices", icon: CreditCard },
  { href: "/portal/settings", label: "Settings", icon: Settings },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={["client"]}>
      <SidebarLayout links={clientLinks} portalLabel="Client Portal" portalColor="bg-[#2d5016]">
        {children}
      </SidebarLayout>
    </RouteGuard>
  );
}
