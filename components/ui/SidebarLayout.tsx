"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import {
  Scale,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Search,
  User,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

export interface SidebarLink {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  children?: { href: string; label: string }[];
}

interface SidebarLayoutProps {
  children: React.ReactNode;
  links: SidebarLink[];
  portalLabel: string;
  portalColor?: string;
}

export default function SidebarLayout({
  children,
  links,
  portalLabel,
  portalColor = "bg-primary-dark",
}: SidebarLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Quick search navigation
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    const base = links[0]?.href?.split("/")[1] || "admin";
    const prefix = `/${base}`;
    const routeMap: Record<string, string[]> = {
      matter: [`${prefix}/matters`], case: [`${prefix}/matters`], client: [`${prefix}/clients`],
      invoice: [`${prefix}/invoices`], billing: [`${prefix}/billing`], time: [`${prefix}/billing`],
      document: [`${prefix}/documents`], file: [`${prefix}/documents`],
      calendar: [`${prefix}/calendar`], event: [`${prefix}/calendar`],
      message: [`${prefix}/messages`], chat: [`${prefix}/messages`],
      report: [`${prefix}/reports`], setting: [`${prefix}/settings`],
      staff: [`${prefix}/staff`], team: [`${prefix}/staff`],
    };
    for (const [keyword, routes] of Object.entries(routeMap)) {
      if (q.includes(keyword)) { router.push(routes[0]); setSearchQuery(""); return; }
    }
    router.push(`${prefix}/matters`);
    setSearchQuery("");
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
  };

  const initials = profile?.displayName
    ? profile.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <div className="flex h-screen bg-muted-light overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${portalColor} text-white flex flex-col transition-all duration-300 z-50
          ${collapsed ? "w-16" : "w-64"}
          ${mobileOpen ? "fixed inset-y-0 left-0 w-64" : "hidden lg:flex"}
          lg:relative lg:flex`}
      >
        {/* Logo */}
        <div className="p-4 flex items-center gap-2 border-b border-white/10">
          <Scale size={24} className="text-accent flex-shrink-0" />
          {(!collapsed || mobileOpen) && (
            <div className="flex-1 min-w-0">
              <span className="text-lg font-bold tracking-tight">Largify Lawship</span>
              <span className="text-[10px] text-white/50 block -mt-1">{portalLabel}</span>
            </div>
          )}
          {mobileOpen && (
            <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1 text-white/70">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {links.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== links[0]?.href && pathname.startsWith(link.href));
            const hasChildren = link.children && link.children.length > 0;
            const isExpanded = expandedGroup === link.href;

            return (
              <div key={link.href}>
                <Link
                  href={hasChildren ? "#" : link.href}
                  onClick={(e) => {
                    if (hasChildren) {
                      e.preventDefault();
                      setExpandedGroup(isExpanded ? null : link.href);
                    } else {
                      setMobileOpen(false);
                    }
                  }}
                  className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                  title={collapsed && !mobileOpen ? link.label : undefined}
                >
                  <link.icon size={20} className="flex-shrink-0" />
                  {(!collapsed || mobileOpen) && (
                    <>
                      <span className="flex-1">{link.label}</span>
                      {link.badge !== undefined && link.badge > 0 && (
                        <span className="bg-danger text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                          {link.badge}
                        </span>
                      )}
                      {hasChildren && (
                        <ChevronDown
                          size={14}
                          className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      )}
                    </>
                  )}
                </Link>

                {/* Sub-links */}
                {hasChildren && isExpanded && (!collapsed || mobileOpen) && (
                  <div className="ml-8 mr-2 mt-1 space-y-0.5">
                    {link.children!.map((child) => {
                      const childActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className={`block px-3 py-1.5 rounded text-xs transition-colors ${
                            childActive
                              ? "text-accent font-medium"
                              : "text-white/50 hover:text-white/80"
                          }`}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User & Collapse */}
        <div className="border-t border-white/10 p-2">
          {(!collapsed || mobileOpen) && profile && (
            <div className="px-4 py-2 mb-1">
              <div className="text-sm font-medium truncate">{profile.displayName}</div>
              <div className="text-[10px] text-white/50 capitalize">{profile.role}</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center gap-3 px-4 py-2.5 w-full text-white/70 hover:text-white transition-colors text-sm"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            {!collapsed && <span>Collapse</span>}
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-2.5 w-full text-white/70 hover:text-white transition-colors text-sm"
          >
            <LogOut size={20} className="flex-shrink-0" />
            {(!collapsed || mobileOpen) && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-border px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-muted hover:text-foreground"
            >
              <Menu size={20} />
            </button>
            <form onSubmit={handleSearch} className="relative hidden sm:block">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search matters, clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-border rounded-lg text-sm w-64 lg:w-80 focus:outline-none focus:border-primary"
              />
            </form>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative" ref={notifRef}>
              <button onClick={() => setShowNotifs(!showNotifs)} className="relative p-2 text-muted hover:text-foreground transition-colors">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
              </button>
              {showNotifs && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-border shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border bg-muted-light/50">
                    <h4 className="font-semibold text-sm text-foreground">Notifications</h4>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {links.slice(0, 4).map((link) => (
                      <Link key={link.href} href={link.href} onClick={() => setShowNotifs(false)} className="block px-4 py-3 hover:bg-muted-light/50 border-b border-border/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <link.icon size={14} className="text-primary" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">New activity in {link.label}</div>
                            <div className="text-xs text-muted">Check for updates</div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link href={links[0]?.href || "#"} onClick={() => setShowNotifs(false)} className="block px-4 py-2 text-center text-xs text-primary font-medium hover:bg-muted-light/50 border-t border-border">
                    View Dashboard
                  </Link>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 pl-3 border-l border-border">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{initials}</span>
              </div>
              <div className="hidden sm:block text-sm">
                <div className="font-medium text-foreground">{profile?.displayName || "User"}</div>
                <div className="text-muted text-xs capitalize">{profile?.role || "Loading..."}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
