import Link from "next/link";
import { FileText, Video, HelpCircle, Download, BookOpen, ArrowRight } from "lucide-react";

const resources = [
  {
    title: "Estate Planning Checklist",
    description: "A comprehensive checklist of documents and strategies every family should consider for their estate plan.",
    category: "Guide",
    icon: <FileText size={24} />,
    type: "PDF Download",
  },
  {
    title: "Business Formation Guide",
    description: "Understanding the differences between LLCs, S-Corps, and C-Corps to choose the right structure for your business.",
    category: "Guide",
    icon: <FileText size={24} />,
    type: "PDF Download",
  },
  {
    title: "What to Expect in a Divorce",
    description: "A step-by-step overview of the divorce process, from filing to finalization, with tips for protecting your interests.",
    category: "Article",
    icon: <BookOpen size={24} />,
    type: "Article",
  },
  {
    title: "Understanding Commercial Leases",
    description: "Key terms and negotiation points every tenant should know before signing a commercial lease agreement.",
    category: "Video",
    icon: <Video size={24} />,
    type: "Video (25 min)",
  },
  {
    title: "IP Protection for Startups",
    description: "Essential steps for protecting your startup's intellectual property from day one.",
    category: "Guide",
    icon: <FileText size={24} />,
    type: "PDF Download",
  },
  {
    title: "Litigation FAQ",
    description: "Answers to the most common questions clients have about the litigation process and what to expect.",
    category: "FAQ",
    icon: <HelpCircle size={24} />,
    type: "FAQ",
  },
];

const faqs = [
  {
    question: "How much does a consultation cost?",
    answer: "We offer a free initial 15-minute phone consultation to discuss your legal matter and determine how we can help. Following this, we'll provide transparent pricing information based on your specific needs.",
  },
  {
    question: "What areas of law do you practice?",
    answer: "We practice in six main areas: Corporate Law, Litigation, Family Law, Estate Planning, Real Estate, and Intellectual Property. Within each area, we handle a wide range of related matters.",
  },
  {
    question: "How quickly can I expect a response?",
    answer: "We respond to all inquiries within 24 hours during business days. For urgent matters, we recommend calling our office directly at (555) 100-2000.",
  },
  {
    question: "Do you offer payment plans?",
    answer: "Yes, we understand that legal services can be a significant investment. We offer flexible payment arrangements and will discuss options during your initial consultation.",
  },
  {
    question: "Can I access my case information online?",
    answer: "Yes! Our secure Client Portal gives you 24/7 access to your case documents, messages with your legal team, and billing information. You'll receive login credentials when you become a client.",
  },
];

export default function ResourcesPage() {
  return (
    <main>
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <span className="text-accent font-semibold tracking-wider uppercase text-sm">Resources</span>
          <h1 className="text-4xl lg:text-5xl font-bold mt-2 mb-4">Legal Resources</h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Educational materials to help you understand your legal situation. Download guides,
            watch videos, and find answers to common questions.
          </p>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-primary mb-8">Guides & Materials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((resource) => (
              <div
                key={resource.title}
                className="border border-border rounded-xl p-6 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-primary p-3 bg-primary/5 rounded-lg">{resource.icon}</div>
                  <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded font-medium mt-1">
                    {resource.type}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                  {resource.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed mb-4">{resource.description}</p>
                <button className="flex items-center gap-2 text-accent font-semibold text-sm hover:gap-3 transition-all">
                  <Download size={16} /> Download Resource
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted-light">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-accent font-semibold tracking-wider uppercase text-sm">FAQ</span>
            <h2 className="text-3xl font-bold text-primary mt-2">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="bg-white border border-border rounded-xl p-6">
                <h3 className="text-lg font-bold text-foreground mb-2">{faq.question}</h3>
                <p className="text-muted leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-accent text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-white/90 text-lg mb-8">
            Our team is here to help. Contact us for a free consultation.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded font-semibold text-lg transition-colors"
          >
            Contact Us <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}
