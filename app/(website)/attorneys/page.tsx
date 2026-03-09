import Link from "next/link";
import { attorneys } from "@/lib/mock-data";

export default function AttorneysPage() {
  return (
    <main>
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <span className="text-accent font-semibold tracking-wider uppercase text-sm">Our Team</span>
          <h1 className="text-4xl lg:text-5xl font-bold mt-2 mb-4">Meet Our Attorneys</h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Our attorneys are recognized leaders who combine deep expertise with a commitment to
            exceptional client service. Get to know the people who will fight for you.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {attorneys.map((attorney) => (
              <Link
                key={attorney.id}
                href={`/attorneys/${attorney.id}`}
                className="group border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="h-56 bg-primary/5 flex items-center justify-center">
                  <div className="w-28 h-28 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary">
                      {attorney.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {attorney.name}
                  </h2>
                  <p className="text-accent font-medium text-sm mb-3">{attorney.title}</p>
                  <p className="text-muted text-sm leading-relaxed mb-4 line-clamp-3">
                    {attorney.bio}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {attorney.specialties.map((s) => (
                      <span key={s} className="text-xs bg-muted-light text-muted px-2 py-1 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
