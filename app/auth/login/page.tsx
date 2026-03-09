"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scale, LogIn, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Demo login buttons
  const demoLogin = (role: string) => {
    if (role === "admin") {
      router.push("/dashboard");
    } else {
      router.push("/portal");
    }
  };

  return (
    <div className="min-h-screen bg-muted-light flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Scale className="text-primary" size={32} />
            <span className="text-2xl font-bold text-primary">Largify Lawship</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-border p-8">
          {error && (
            <div className="bg-danger/10 text-danger text-sm p-3 rounded-lg mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-primary"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-primary pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              <LogIn size={18} /> {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm text-muted">
            <Link href="/auth/forgot-password" className="text-primary hover:text-accent font-medium">
              Forgot password?
            </Link>
            <span>
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="text-primary font-semibold hover:text-accent">
                Create Account
              </Link>
            </span>
          </div>
        </div>

        {/* Demo Access */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-border p-6">
          <p className="text-sm font-medium text-foreground mb-3 text-center">Demo Access</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => demoLogin("admin")}
              className="bg-primary/5 hover:bg-primary/10 text-primary py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Staff Dashboard
            </button>
            <button
              onClick={() => demoLogin("client")}
              className="bg-accent/5 hover:bg-accent/10 text-accent-dark py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Client Portal
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-muted hover:text-primary">&larr; Back to Website</Link>
        </div>
      </div>
    </div>
  );
}
