"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/auth/login"); return; }
    if (profile?.role === "admin") router.replace("/admin");
    else if (profile?.role === "client") router.replace("/portal");
    else router.replace("/staff");
  }, [user, profile, loading, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}
