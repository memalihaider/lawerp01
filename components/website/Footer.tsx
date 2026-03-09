import Link from "next/link";
import { Scale, Phone, Mail, MapPin } from "lucide-react";
import { practiceAreas } from "@/lib/mock-data";

export default function WebsiteFooter() {
  return (
    <footer className="bg-primary-dark text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Scale size={28} className="text-accent" />
              <span className="text-xl font-bold tracking-tight">Largify Lawship</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              A full-service law firm committed to exceptional advocacy and client service.
              Serving businesses and individuals with integrity since 2005.
            </p>
            <div className="flex flex-col gap-2 text-sm text-white/70">
              <span className="flex items-center gap-2"><Phone size={14} className="text-accent" /> (555) 100-2000</span>
              <span className="flex items-center gap-2"><Mail size={14} className="text-accent" /> info@largifylawship.com</span>
              <span className="flex items-center gap-2"><MapPin size={14} className="text-accent" /> 200 Park Avenue, Suite 3000, New York, NY 10166</span>
            </div>
          </div>

          {/* Practice Areas */}
          <div>
            <h3 className="font-semibold text-accent mb-4 uppercase text-sm tracking-wider">Practice Areas</h3>
            <ul className="space-y-2 text-sm text-white/70">
              {practiceAreas.map((area) => (
                <li key={area.slug}>
                  <Link href={`/services/${area.slug}`} className="hover:text-white transition-colors">
                    {area.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-accent mb-4 uppercase text-sm tracking-wider">Quick Links</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/attorneys" className="hover:text-white transition-colors">Our Attorneys</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Insights & Articles</Link></li>
              <li><Link href="/resources" className="hover:text-white transition-colors">Resources</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/auth/login" className="hover:text-white transition-colors">Client Portal</Link></li>
              <li><Link href="/auth/login" className="hover:text-white transition-colors">Staff Login</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-accent mb-4 uppercase text-sm tracking-wider">Stay Informed</h3>
            <p className="text-sm text-white/70 mb-4">
              Subscribe to our newsletter for legal insights and firm updates.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email Address"
                className="flex-1 px-3 py-2 rounded bg-white/10 border border-white/20 text-sm placeholder:text-white/40 focus:outline-none focus:border-accent"
              />
              <button className="bg-accent hover:bg-accent-dark px-4 py-2 rounded text-sm font-semibold transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/50">
          <p>&copy; 2026 Largify Lawship. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
