import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, Gavel, Heart, Shield, Home, Lightbulb, ArrowRight, CheckCircle, Phone } from "lucide-react";
import { practiceAreas, attorneys } from "@/lib/mock-data";

const iconMap: Record<string, React.ReactNode> = {
  Building2: <Building2 size={40} />,
  Gavel: <Gavel size={40} />,
  Heart: <Heart size={40} />,
  Shield: <Shield size={40} />,
  Home: <Home size={40} />,
  Lightbulb: <Lightbulb size={40} />,
};

export function generateStaticParams() {
  return practiceAreas.map((area) => ({ slug: area.slug }));
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const area = practiceAreas.find((a) => a.slug === slug);
  if (!area) notFound();

  const relatedAttorneys = attorneys.filter((a) =>
    a.specialties.some((s) => area.title.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(area.title.split(" ")[0].toLowerCase()))
  );

  return (
    <main>
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <Link href="/services" className="text-accent hover:text-accent-light text-sm mb-4 inline-block">
            &larr; All Practice Areas
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-accent">{iconMap[area.icon]}</div>
            <h1 className="text-4xl lg:text-5xl font-bold">{area.title}</h1>
          </div>
          <p className="text-white/80 text-lg max-w-2xl">{area.shortDescription}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-primary mb-6">Overview</h2>
              <p className="text-muted leading-relaxed text-lg mb-8">{area.description}</p>

              <h3 className="text-xl font-bold text-primary mb-4">Our Services Include</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {area.features.map((f) => (
                  <div key={f} className="flex items-start gap-3 p-4 bg-muted-light rounded-lg">
                    <CheckCircle size={20} className="text-success flex-shrink-0 mt-0.5" />
                    <span className="font-medium">{f}</span>
                  </div>
                ))}
              </div>

              <h3 className="text-xl font-bold text-primary mb-4">Why Choose Largify Lawship for {area.title}</h3>
              <div className="space-y-4 text-muted leading-relaxed">
                <p>
                  Our {area.title.toLowerCase()} attorneys are recognized leaders in their field, with decades
                  of combined experience handling the most complex matters. We take a client-first approach,
                  ensuring you understand every step of the process and feel confident in the outcome.
                </p>
                <p>
                  We invest in cutting-edge legal technology and research tools to maximize efficiency,
                  reduce costs, and deliver superior results. Our team works collaboratively across practice
                  areas to provide holistic legal solutions.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              {/* CTA Card */}
              <div className="bg-primary text-white rounded-xl p-8">
                <h3 className="text-xl font-bold mb-4">Get Started Today</h3>
                <p className="text-white/80 text-sm mb-6">
                  Schedule a free 15-minute consultation with a {area.title.toLowerCase()} attorney.
                </p>
                <Link
                  href="/contact"
                  className="block text-center bg-accent hover:bg-accent-dark px-6 py-3 rounded font-semibold transition-colors mb-3"
                >
                  Free Consultation
                </Link>
                <a
                  href="tel:5551002000"
                  className="flex items-center justify-center gap-2 text-white/80 hover:text-white transition-colors"
                >
                  <Phone size={16} /> (555) 100-2000
                </a>
              </div>

              {/* Related Attorneys */}
              {relatedAttorneys.length > 0 && (
                <div className="border border-border rounded-xl p-6">
                  <h3 className="text-lg font-bold text-primary mb-4">Our {area.title} Team</h3>
                  <div className="space-y-4">
                    {relatedAttorneys.map((att) => (
                      <Link
                        key={att.id}
                        href={`/attorneys/${att.id}`}
                        className="flex items-center gap-3 hover:bg-muted-light p-2 rounded transition-colors"
                      >
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">
                            {att.name.split(" ").map((n) => n[0]).join("")}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{att.name}</div>
                          <div className="text-sm text-muted">{att.title}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
