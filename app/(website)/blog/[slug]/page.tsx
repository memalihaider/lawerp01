import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, User, Calendar } from "lucide-react";
import { blogPosts } from "@/lib/mock-data";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <main>
      <section className="bg-primary text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/blog" className="text-accent hover:text-accent-light text-sm mb-6 inline-flex items-center gap-1">
            <ArrowLeft size={14} /> Back to Blog
          </Link>
          <span className="block text-accent font-semibold text-sm mb-2">{post.category}</span>
          <h1 className="text-3xl lg:text-4xl font-bold mb-6">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-6 text-white/70 text-sm">
            <span className="flex items-center gap-2"><User size={16} /> {post.author}</span>
            <span className="flex items-center gap-2"><Calendar size={16} /> {post.date}</span>
            <span className="flex items-center gap-2"><Clock size={16} /> {post.readTime}</span>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-muted leading-relaxed mb-6">{post.excerpt}</p>

            <h2 className="text-2xl font-bold text-primary mt-10 mb-4">Key Takeaways</h2>
            <ul className="space-y-2 text-muted">
              <li>Understanding the fundamentals is critical for making informed decisions.</li>
              <li>Consulting with an experienced attorney early can save time and resources.</li>
              <li>Each situation is unique — there is no one-size-fits-all solution.</li>
              <li>Staying current with legal developments is essential for compliance.</li>
            </ul>

            <h2 className="text-2xl font-bold text-primary mt-10 mb-4">Detailed Analysis</h2>
            <p className="text-muted leading-relaxed mb-4">
              In today&apos;s rapidly evolving legal landscape, it&apos;s more important than ever
              to have a clear understanding of your rights and obligations. Whether you&apos;re a
              business owner, a parent, or an individual planning for the future, the decisions you
              make today will have a lasting impact.
            </p>
            <p className="text-muted leading-relaxed mb-4">
              Our team at Largify Lawship has extensive experience in {post.category.toLowerCase()} and
              has helped thousands of clients navigate complex legal challenges. We believe in
              empowering our clients with knowledge so they can make informed decisions with confidence.
            </p>
            <p className="text-muted leading-relaxed mb-4">
              This article provides a general overview and should not be considered legal advice.
              For guidance specific to your situation, we encourage you to schedule a consultation
              with one of our experienced attorneys.
            </p>

            <h2 className="text-2xl font-bold text-primary mt-10 mb-4">Next Steps</h2>
            <p className="text-muted leading-relaxed">
              If you have questions about the topics discussed in this article, don&apos;t hesitate
              to reach out. Our team is here to help you understand your options and develop a
              strategy that meets your needs.
            </p>
          </div>

          <div className="mt-12 p-8 bg-accent/10 rounded-xl border border-accent/20">
            <h3 className="text-xl font-bold text-primary mb-2">Need Legal Help?</h3>
            <p className="text-muted mb-4">
              Schedule a free consultation with one of our {post.category.toLowerCase()} attorneys.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded font-semibold transition-colors"
            >
              Get a Free Case Evaluation
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
