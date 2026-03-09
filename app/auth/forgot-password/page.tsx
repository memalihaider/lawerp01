"use client";

import { useState } from "react";
import Link from "next/link";
import { Scale, Mail, ArrowLeft } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch {
      // Don't reveal if email exists or not for security
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-muted-light flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Scale className="text-primary" size={32} />
            <span className="text-2xl font-bold text-primary">Largify Lawship</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
          <p className="text-muted mt-1">Enter your email to receive a reset link</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-border p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={24} className="text-success" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Check Your Email</h3>
              <p className="text-muted text-sm mb-6">
                If an account exists with that email, we&apos;ve sent a password reset link.
                Please check your inbox and spam folder.
              </p>
              <Link href="/auth/login" className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:text-accent">
                <ArrowLeft size={16} /> Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-danger/10 text-danger text-sm p-3 rounded-lg mb-4">{error}</div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-primary"
                    placeholder="you@example.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  <Mail size={18} /> {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
              <div className="mt-4 text-center">
                <Link href="/auth/login" className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary">
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
