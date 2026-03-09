"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from "lucide-react";
import { practiceAreas } from "@/lib/mock-data";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main>
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <span className="text-accent font-semibold tracking-wider uppercase text-sm">Get in Touch</span>
          <h1 className="text-4xl lg:text-5xl font-bold mt-2 mb-4">Contact Us</h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Ready to discuss your legal needs? Reach out to us for a free 15-minute case evaluation.
            We respond to all inquiries within 24 hours.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-primary mb-6">Send Us a Message</h2>

              {submitted ? (
                <div className="text-center py-16 border border-border rounded-xl">
                  <CheckCircle size={48} className="text-success mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-primary mb-2">Thank You!</h3>
                  <p className="text-muted max-w-md mx-auto">
                    We&apos;ve received your message and will respond within 24 hours.
                    For urgent matters, please call us directly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-primary"
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-primary"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-primary"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Type of Legal Matter</label>
                      <select
                        value={form.service}
                        onChange={(e) => setForm({ ...form, service: e.target.value })}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-primary bg-white"
                      >
                        <option value="">Select a practice area</option>
                        {practiceAreas.map((area) => (
                          <option key={area.slug} value={area.title}>{area.title}</option>
                        ))}
                        <option value="Other">Other / Not Sure</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">How Can We Help? *</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-primary resize-none"
                      placeholder="Please briefly describe your legal matter..."
                    />
                  </div>

                  <p className="text-xs text-muted">
                    By submitting this form, you agree to our Privacy Policy. Submitting this form does not
                    create an attorney-client relationship.
                  </p>

                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white px-8 py-3 rounded font-semibold transition-colors"
                  >
                    <Send size={18} /> Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-primary text-white rounded-xl p-8">
                <h3 className="text-xl font-bold mb-6">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone size={20} className="text-accent flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-medium">Phone</div>
                      <a href="tel:5551002000" className="text-white/80 hover:text-white text-sm">(555) 100-2000</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail size={20} className="text-accent flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-medium">Email</div>
                      <span className="text-white/80 text-sm">info@largifylawship.com</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={20} className="text-accent flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-medium">Office</div>
                      <span className="text-white/80 text-sm">200 Park Avenue, Suite 3000<br />New York, NY 10166</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock size={20} className="text-accent flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-medium">Hours</div>
                      <span className="text-white/80 text-sm">Mon-Fri: 8:00 AM - 6:00 PM<br />Sat: By Appointment</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-xl p-6 bg-accent/5">
                <h3 className="text-lg font-bold text-primary mb-3">Free Case Evaluation</h3>
                <p className="text-muted text-sm mb-4">
                  Not sure if you have a case? Schedule a free 15-minute phone consultation
                  with one of our attorneys. No strings attached.
                </p>
                <a
                  href="tel:5551002000"
                  className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded font-semibold transition-colors"
                >
                  <Phone size={18} /> Call Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
