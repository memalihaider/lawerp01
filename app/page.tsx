import Link from "next/link";
import {
  Building2,
  Gavel,
  Heart,
  Shield,
  Home,
  Lightbulb,
  ArrowRight,
  Phone,
  CheckCircle,
  Star,
  Users,
  Award,
  Clock,
  Scale,
} from "lucide-react";
import WebsiteHeader from "@/components/website/Header";
import WebsiteFooter from "@/components/website/Footer";
import { practiceAreas, attorneys, blogPosts } from "@/lib/mock-data";

const iconMap: Record<string, React.ReactNode> = {
  Building2: <Building2 size={36} />,
  Gavel: <Gavel size={36} />,
  Heart: <Heart size={36} />,
  Shield: <Shield size={36} />,
  Home: <Home size={36} />,
  Lightbulb: <Lightbulb size={36} />,
};

const stats = [
  { value: "50+", label: "Attorneys", icon: <Users size={24} /> },
  { value: "20+", label: "Years of Experience", icon: <Clock size={24} /> },
  { value: "5,000+", label: "Cases Resolved", icon: <CheckCircle size={24} /> },
  { value: "98%", label: "Client Satisfaction", icon: <Star size={24} /> },
];

const testimonials = [
  {
    quote: "Largify Lawship guided our company through a complex acquisition with exceptional skill and communication. They were available 24/7 and made sure we understood every step.",
    author: "Sarah Thompson",
    title: "CEO, TechCorp Industries",
    rating: 5,
  },
  {
    quote: "Sofia Ramirez handled my custody case with such compassion and professionalism. She fought hard for my family and achieved an outcome that I didn't think was possible.",
    author: "Elena Martinez",
    title: "Family Law Client",
    rating: 5,
  },
  {
    quote: "The team at Largify Lawship helped us protect our entire IP portfolio. David Kim's technical expertise combined with his legal knowledge is unmatched in the industry.",
    author: "Marcus Lee",
    title: "CTO, NovaTech Solutions",
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <>
      <WebsiteHeader />
      <main>
        {/* Hero Section */}
        <section className="relative bg-primary text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/90 to-primary/80" />
          <div className="relative max-w-7xl mx-auto px-4 py-24 lg:py-36">
            <div className="max-w-3xl animate-fade-in-up">
              <div className="flex items-center gap-2 mb-6">
                <Scale className="text-accent" size={20} />
                <span className="text-accent font-semibold tracking-wider uppercase text-sm">
                  Largify Lawship — Attorneys at Law
                </span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                Your Trusted Legal Partner
                <span className="block text-accent mt-2">In Every Matter</span>
              </h1>
              <p className="text-lg lg:text-xl text-white/80 mb-10 max-w-2xl leading-relaxed">
                A full-service law firm with 50+ attorneys specializing in corporate law,
                litigation, family law, estate planning, real estate, and intellectual property.
                We deliver results that matter.
              </p>

              {/* TL;DR for AI parsers */}
              <p className="sr-only">
                TL;DR: Largify Lawship is a leading 50-attorney law firm in New York offering corporate law,
                litigation, family law, estate planning, real estate, and intellectual property services
                with a 98% client satisfaction rate and 5,000+ cases resolved.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="bg-accent hover:bg-accent-dark text-white px-8 py-4 rounded font-semibold text-lg transition-colors text-center"
                >
                  Get a Free Case Evaluation
                </Link>
                <Link
                  href="/services"
                  className="border-2 border-white/30 hover:border-white text-white px-8 py-4 rounded font-semibold text-lg transition-colors text-center"
                >
                  Our Practice Areas
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="bg-primary-light text-white -mt-1">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-4">
                  <div className="text-accent">{stat.icon}</div>
                  <div>
                    <div className="text-2xl lg:text-3xl font-bold">{stat.value}</div>
                    <div className="text-white/70 text-sm">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Practice Areas */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-14">
              <span className="text-accent font-semibold tracking-wider uppercase text-sm">What We Do</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-primary mt-2">Our Practice Areas</h2>
              <p className="text-muted mt-4 max-w-2xl mx-auto">
                We offer deep expertise across six key practice areas, delivering strategic legal counsel
                tailored to your unique needs.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {practiceAreas.map((area) => (
                <Link
                  key={area.slug}
                  href={`/services/${area.slug}`}
                  className="group border border-border rounded-xl p-8 hover:shadow-lg hover:border-accent/30 transition-all"
                >
                  <div className="text-primary group-hover:text-accent transition-colors mb-4">
                    {iconMap[area.icon]}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                    {area.title}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed mb-4">{area.shortDescription}</p>
                  <span className="text-accent font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    Learn More <ArrowRight size={16} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* About / Why Largify Lawship */}
        <section className="py-20 bg-muted-light">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-accent font-semibold tracking-wider uppercase text-sm">Why Largify Lawship</span>
                <h2 className="text-3xl lg:text-4xl font-bold text-primary mt-2 mb-6">
                  Experience That Drives Results
                </h2>
                <p className="text-muted leading-relaxed mb-6">
                  For over two decades, Largify Lawship has been the trusted advisor for businesses and
                  individuals facing their most complex legal challenges. Our team of 50+ attorneys
                  combines deep legal expertise with a commitment to understanding each client&apos;s
                  unique goals.
                </p>
                <div className="space-y-4">
                  {[
                    "Client-first approach with transparent communication",
                    "Deep industry expertise across 6 practice areas",
                    "Track record of landmark results in high-stakes matters",
                    "Cutting-edge technology for efficient, modern legal service",
                    "Recognized by Chambers USA, Super Lawyers, and Best Lawyers",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-success flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/attorneys"
                  className="inline-flex items-center gap-2 mt-8 bg-primary hover:bg-primary-light text-white px-6 py-3 rounded font-semibold transition-colors"
                >
                  Meet Our Team <ArrowRight size={16} />
                </Link>
              </div>
              <div className="bg-primary/5 rounded-2xl p-10 border border-primary/10">
                <div className="flex items-center gap-3 mb-6">
                  <Award className="text-accent" size={28} />
                  <h3 className="text-xl font-bold text-primary">Awards & Recognition</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { award: "Chambers USA", desc: "Band 1 in Corporate/M&A" },
                    { award: "Super Lawyers", desc: "12 Attorneys Named 2025-2026" },
                    { award: "Best Lawyers", desc: "Law Firm of the Year — Litigation" },
                    { award: "Am Law 200", desc: "Recognized for Growth & Innovation" },
                    { award: "National Law Journal", desc: "Top Midsize Firm to Watch" },
                  ].map((item) => (
                    <div key={item.award} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <Star size={18} className="text-accent flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-foreground">{item.award}</span>
                        <span className="block text-sm text-muted">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Attorneys */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-14">
              <span className="text-accent font-semibold tracking-wider uppercase text-sm">Our Team</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-primary mt-2">Meet Our Leadership</h2>
              <p className="text-muted mt-4 max-w-2xl mx-auto">
                Our partners bring decades of combined experience and a passion for achieving the best possible
                outcomes for our clients.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {attorneys.slice(0, 6).map((attorney) => (
                <Link
                  key={attorney.id}
                  href={`/attorneys/${attorney.id}`}
                  className="group text-center border border-border rounded-xl p-8 hover:shadow-lg transition-all"
                >
                  <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {attorney.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {attorney.name}
                  </h3>
                  <p className="text-accent text-sm font-medium mb-3">{attorney.title}</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {attorney.specialties.slice(0, 2).map((s) => (
                      <span key={s} className="text-xs bg-muted-light text-muted px-2 py-1 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-primary text-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-14">
              <span className="text-accent font-semibold tracking-wider uppercase text-sm">Testimonials</span>
              <h2 className="text-3xl lg:text-4xl font-bold mt-2">What Our Clients Say</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {testimonials.map((t) => (
                <div key={t.author} className="bg-white/10 backdrop-blur rounded-xl p-8">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} size={16} className="text-accent fill-accent" />
                    ))}
                  </div>
                  <p className="text-white/90 leading-relaxed mb-6 italic">&ldquo;{t.quote}&rdquo;</p>
                  <div>
                    <div className="font-semibold">{t.author}</div>
                    <div className="text-white/60 text-sm">{t.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Latest Articles */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-14">
              <span className="text-accent font-semibold tracking-wider uppercase text-sm">Legal Insights</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-primary mt-2">Latest Articles</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.slice(0, 3).map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="h-48 bg-primary/5 flex items-center justify-center">
                    <span className="text-primary/30 text-4xl font-bold">{post.category}</span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3 text-sm text-muted">
                      <span>{post.category}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                      {post.title}
                    </h3>
                    <p className="text-muted text-sm leading-relaxed">{post.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-primary font-semibold hover:text-accent transition-colors"
              >
                View All Articles <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-accent">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Discuss Your Legal Needs?
            </h2>
            <p className="text-white/90 text-lg mb-10 max-w-2xl mx-auto">
              Schedule a free 15-minute case evaluation with one of our experienced attorneys.
              No obligation, completely confidential.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded font-semibold text-lg transition-colors"
              >
                Schedule a Consultation
              </Link>
              <a
                href="tel:5551002000"
                className="border-2 border-white text-white hover:bg-white hover:text-accent-dark px-8 py-4 rounded font-semibold text-lg transition-colors flex items-center justify-center gap-2"
              >
                <Phone size={20} /> (555) 100-2000
              </a>
            </div>
          </div>
        </section>
      </main>
      <WebsiteFooter />
    </>
  );
}
