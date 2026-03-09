import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone, MapPin, ArrowRight, Award, BookOpen, Scale } from "lucide-react";
import { attorneys, blogPosts } from "@/lib/mock-data";

export function generateStaticParams() {
  return attorneys.map((a) => ({ id: a.id }));
}

export default async function AttorneyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const attorney = attorneys.find((a) => a.id === id);
  if (!attorney) notFound();

  const relatedPosts = blogPosts.filter((p) => p.author === attorney.name);

  return (
    <main>
      <section className="bg-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <Link href="/attorneys" className="text-accent hover:text-accent-light text-sm mb-6 inline-block">
            &larr; All Attorneys
          </Link>
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-4xl font-bold text-accent">
                {attorney.name.split(" ").map((n) => n[0]).join("")}
              </span>
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-1">{attorney.name}</h1>
              <p className="text-accent text-lg font-medium mb-4">{attorney.title}</p>
              <div className="flex flex-wrap gap-6 text-white/70 text-sm">
                <span className="flex items-center gap-2"><Mail size={16} /> {attorney.email}</span>
                <span className="flex items-center gap-2"><Phone size={16} /> {attorney.phone}</span>
                <span className="flex items-center gap-2"><MapPin size={16} /> New York, NY</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-primary mb-4">Biography</h2>
              <p className="text-muted leading-relaxed text-lg mb-10">{attorney.bio}</p>

              <h3 className="text-xl font-bold text-primary mb-4">Practice Areas</h3>
              <div className="flex flex-wrap gap-3 mb-10">
                {attorney.specialties.map((s) => (
                  <span key={s} className="bg-primary/5 text-primary px-4 py-2 rounded-lg font-medium">
                    {s}
                  </span>
                ))}
              </div>

              {relatedPosts.length > 0 && (
                <>
                  <h3 className="text-xl font-bold text-primary mb-4">Published Articles</h3>
                  <div className="space-y-4">
                    {relatedPosts.map((post) => (
                      <Link
                        key={post.slug}
                        href={`/blog/${post.slug}`}
                        className="flex items-start gap-3 p-4 border border-border rounded-lg hover:border-accent/30 transition-colors"
                      >
                        <BookOpen size={20} className="text-accent flex-shrink-0 mt-1" />
                        <div>
                          <div className="font-semibold text-foreground">{post.title}</div>
                          <div className="text-sm text-muted">{post.date} · {post.readTime}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="space-y-6">
              <div className="border border-border rounded-xl p-6">
                <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                  <Scale size={20} /> Bar Admissions
                </h3>
                <ul className="space-y-2 text-muted">
                  {attorney.barAdmissions.map((b) => (
                    <li key={b} className="flex items-center gap-2">
                      <ArrowRight size={14} className="text-accent" /> {b}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border border-border rounded-xl p-6">
                <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                  <BookOpen size={20} /> Education
                </h3>
                <ul className="space-y-2 text-muted">
                  {attorney.education.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>

              <div className="border border-border rounded-xl p-6">
                <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                  <Award size={20} /> Awards & Recognition
                </h3>
                <ul className="space-y-2 text-muted">
                  {attorney.awards.map((a) => (
                    <li key={a} className="flex items-center gap-2">
                      <Award size={14} className="text-accent flex-shrink-0" /> {a}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-accent rounded-xl p-6 text-white">
                <h3 className="font-bold text-lg mb-3">Contact {attorney.name.split(" ")[0]}</h3>
                <p className="text-white/80 text-sm mb-4">
                  Schedule a consultation to discuss your legal needs.
                </p>
                <Link
                  href="/contact"
                  className="block text-center bg-primary hover:bg-primary-dark px-6 py-3 rounded font-semibold transition-colors"
                >
                  Schedule Consultation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
