"use client";

import Link from "next/link";
import { useCmsBlogPosts } from "@/lib/hooks";
import { blogPosts as mockPosts } from "@/lib/mock-data";

export default function BlogPage() {
  const { data: cmsPosts, loading } = useCmsBlogPosts();

  const blogPosts = cmsPosts.length > 0
    ? cmsPosts.map((p: any) => ({
        slug: p.slug || p.id,
        title: p.title,
        excerpt: p.excerpt || "",
        author: p.author || "Staff",
        date: p.createdAt?.toDate ? p.createdAt.toDate().toLocaleDateString() : "",
        category: p.category || "",
        readTime: p.readTime || "5 min read",
      }))
    : mockPosts;
  return (
    <main>
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <span className="text-accent font-semibold tracking-wider uppercase text-sm">Legal Insights</span>
          <h1 className="text-4xl lg:text-5xl font-bold mt-2 mb-4">Our Blog</h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Stay informed with the latest legal insights, industry analysis, and practical guides
            from our team of experts.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
          ) : blogPosts.length === 0 ? (
            <p className="text-center text-muted py-12">No blog posts yet.</p>
          ) : (
          <>
          {/* Featured Post */}
          <Link
            href={`/blog/${blogPosts[0].slug}`}
            className="group block border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all mb-12"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="h-64 lg:h-auto bg-primary/5 flex items-center justify-center">
                <span className="text-primary/20 text-5xl font-bold">{blogPosts[0].category}</span>
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <span className="text-accent font-semibold text-sm mb-2">Featured Article</span>
                <h2 className="text-2xl lg:text-3xl font-bold text-foreground group-hover:text-primary transition-colors mb-4">
                  {blogPosts[0].title}
                </h2>
                <p className="text-muted leading-relaxed mb-4">{blogPosts[0].excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-muted">
                  <span>{blogPosts[0].author}</span>
                  <span>•</span>
                  <span>{blogPosts[0].date}</span>
                  <span>•</span>
                  <span>{blogPosts[0].readTime}</span>
                </div>
              </div>
            </div>
          </Link>

          {/* All Posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="h-48 bg-primary/5 flex items-center justify-center">
                  <span className="text-primary/20 text-3xl font-bold">{post.category}</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded font-medium">
                      {post.category}
                    </span>
                    <span className="text-xs text-muted">{post.readTime}</span>
                  </div>
                  <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                    {post.title}
                  </h2>
                  <p className="text-muted text-sm leading-relaxed mb-4">{post.excerpt}</p>
                  <div className="text-sm text-muted">
                    By {post.author} · {post.date}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          </>
          )}
        </div>
      </section>
    </main>
  );
}
