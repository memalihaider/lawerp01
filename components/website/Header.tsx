"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Phone, Scale } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Practice Areas" },
  { href: "/attorneys", label: "Our Team" },
  { href: "/blog", label: "Insights" },
  { href: "/resources", label: "Resources" },
  { href: "/contact", label: "Contact" },
];

export default function WebsiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border">
      <div className="bg-primary text-white text-sm py-2">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone size={14} />
              (555) 100-2000
            </span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">info@largifylawship.com</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="hover:text-accent transition-colors">
              Client Portal
            </Link>
            <span>|</span>
            <Link href="/auth/login" className="hover:text-accent transition-colors">
              Staff Login
            </Link>
          </div>
        </div>
      </div>

      <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Scale className="text-primary" size={32} />
          <div>
            <span className="text-2xl font-bold text-primary tracking-tight">Largify Lawship</span>
            <span className="block text-xs text-muted -mt-1 tracking-widest uppercase">Attorneys at Law</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-foreground hover:text-primary font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="bg-accent hover:bg-accent-dark text-white px-6 py-2.5 rounded font-semibold transition-colors"
          >
            Free Consultation
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-white pb-4">
          <div className="max-w-7xl mx-auto px-4 flex flex-col gap-3 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-foreground hover:text-primary font-medium py-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded font-semibold text-center transition-colors mt-2"
              onClick={() => setMobileOpen(false)}
            >
              Free Consultation
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
