"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserRole } from "@/lib/types";
import { Scale } from "lucide-react";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export default function RouteGuard({ children, allowedRoles, redirectTo = "/auth/login" }: RouteGuardProps) {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!profile) {
      router.replace(redirectTo);
      return;
    }
    if (!allowedRoles.includes(profile.role)) {
      // Redirect to appropriate portal based on role
      if (profile.role === "client") {
        router.replace("/portal");
      } else if (profile.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/staff");
      }
    }
  }, [profile, loading, allowedRoles, redirectTo, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted-light">
        <div className="text-center">
          <Scale size={40} className="mx-auto text-primary animate-pulse mb-4" />
          <p className="text-muted text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile || !allowedRoles.includes(profile.role)) {
    return null;
  }

  return <>{children}</>;
}
