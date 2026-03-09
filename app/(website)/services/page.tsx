"use client";

import Link from "next/link";
import { Building2, Gavel, Heart, Shield, Home, Lightbulb, ArrowRight } from "lucide-react";
import { useCmsServices } from "@/lib/hooks";
import { practiceAreas as mockAreas } from "@/lib/mock-data";

const iconMap: Record<string, React.ReactNode> = {
  Building2: <Building2 size={40} />,
  Gavel: <Gavel size={40} />,
  Heart: <Heart size={40} />,
  Shield: <Shield size={40} />,
  Home: <Home size={40} />,
  Lightbulb: <Lightbulb size={40} />,
};

export default function ServicesPage() {
  const { data: cmsServices, loading } = useCmsServices();

  const practiceAreas = cmsServices.length > 0
    ? cmsServices.map((s: any) => ({ slug: s.slug || s.id, title: s.title, description: s.description, shortDescription: s.description?.slice(0, 100), icon: s.icon || "Gavel", features: s.features || [] }))
    : mockAreas;
  return (
    <main>
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <span className="text-accent font-semibold tracking-wider uppercase text-sm">What We Do</span>
          <h1 className="text-4xl lg:text-5xl font-bold mt-2 mb-4">Our Practice Areas</h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Largify Lawship offers comprehensive legal services across six key practice areas.
            Whatever your legal challenge, our experienced attorneys are ready to help.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 space-y-12">
          {practiceAreas.map((area, i) => (
            <div
              key={area.slug}
              className={`flex flex-col lg:flex-row gap-10 items-center ${
                i % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              <div className="flex-1">
                <div className="text-primary mb-4">{iconMap[area.icon]}</div>
                <h2 className="text-2xl lg:text-3xl font-bold text-primary mb-4">{area.title}</h2>
                <p className="text-muted leading-relaxed mb-6">{area.description}</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {area.features.map((f: string) => (
                    <div key={f} className="flex items-center gap-2 text-sm">
                      <ArrowRight size={14} className="text-accent flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href={`/services/${area.slug}`}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-6 py-3 rounded font-semibold transition-colors"
                >
                  Learn More <ArrowRight size={16} />
                </Link>
              </div>
              <div className="flex-1 w-full">
                <div className="bg-primary/5 rounded-xl h-64 lg:h-80 flex items-center justify-center border border-primary/10">
                  <div className="text-primary/20">{iconMap[area.icon]}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-accent text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Not Sure Which Practice Area You Need?</h2>
          <p className="text-white/90 text-lg mb-8">
            Our intake team will help connect you with the right attorney. Contact us for a free 15-minute consultation.
          </p>
          <Link
            href="/contact"
            className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded font-semibold text-lg transition-colors"
          >
            Get a Free Case Evaluation
          </Link>
        </div>
      </section>
    </main>
  );
}
