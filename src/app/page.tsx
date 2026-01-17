import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  Calendar,
  Bell,
  MessageSquare,
  Shield,
  Phone,
  Mail,
  MapPin,
  ArrowRight
} from "lucide-react";
import { getPublicNotices } from "@/lib/actions/notice";
import { getUpcomingEvents } from "@/lib/actions/event";
import { NoticesSection } from "@/components/public/notices-section";
import { EventsSection } from "@/components/public/events-section";

export const metadata: Metadata = {
  title: "Runwal Seagull Society | Smart Living for Modern Communities",
  description: "Welcome to Runwal Seagull Society Portal - Your comprehensive platform for society management, events, notices, and community engagement. Experience seamless living with our smart society management system.",
  keywords: "Runwal Seagull, Society Management, Community Portal, Mumbai Society, Residential Society",
};

export default async function Home() {
  // Fetch public data
  const noticesResult = await getPublicNotices(6);
  const eventsResult = await getUpcomingEvents(6);

  const notices = noticesResult.success ? noticesResult.data : [];
  const events = eventsResult.success ? eventsResult.data : [];

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center bg-slate-900/50 backdrop-blur-md border-b border-white/10 fixed w-full z-50">
        <Link className="flex items-center justify-center gap-2" href="#">
          <Building2 className="h-6 w-6 text-sky-400" />
          <span className="font-bold text-xl text-white">Runwal Seagull</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-sky-400 transition-colors text-slate-300" href="#notices">
            Notices
          </Link>
          <Link className="text-sm font-medium hover:text-sky-400 transition-colors text-slate-300" href="#events">
            Events
          </Link>
          <Link className="text-sm font-medium hover:text-sky-400 transition-colors text-slate-300" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-sky-400 transition-colors text-slate-300" href="#about">
            About
          </Link>
          <Link className="text-sm font-medium hover:text-sky-400 transition-colors text-slate-300" href="#contact">
            Contact
          </Link>
          <Link href="/login">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-sky-500 hover:bg-sky-600 text-white">
              Register
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 lg:py-40 px-4 md:px-6 overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
              <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
              <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
            </div>
          </div>

          <div className="relative z-10 container mx-auto text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400 animate-gradient" style={{ backgroundSize: "200% 200%" }}>
                Smart Living for
              </span>
              <br />
              <span className="text-white">Modern Communities</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-slate-300 text-lg md:text-xl mb-10 leading-relaxed">
              Experience seamless society management with Runwal Seagull Portal.
              Connect with neighbors, stay updated with notices, participate in events, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-sky-500/50 transition-all hover:shadow-xl hover:scale-105">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-full backdrop-blur transition-all hover:scale-105">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-12 px-4 md:px-6 bg-slate-900/50 border-y border-white/10">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <p className="text-4xl md:text-5xl font-bold text-sky-400">1000+</p>
                <p className="text-slate-400">Residents</p>
              </div>
              <div className="space-y-2">
                <p className="text-4xl md:text-5xl font-bold text-purple-400">50+</p>
                <p className="text-slate-400">Events/Year</p>
              </div>
              <div className="space-y-2">
                <p className="text-4xl md:text-5xl font-bold text-pink-400">24/7</p>
                <p className="text-slate-400">Support</p>
              </div>
              <div className="space-y-2">
                <p className="text-4xl md:text-5xl font-bold text-indigo-400">100%</p>
                <p className="text-slate-400">Digital</p>
              </div>
            </div>
          </div>
        </section>

        {/* Public Notices Section */}
        <section id="notices" className="w-full py-20 md:py-32 px-4 md:px-6 bg-gradient-to-br from-slate-900 to-indigo-900/20">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Latest Notices
              </h2>
              <p className="text-slate-400 text-lg max-w-[600px] mx-auto">
                Stay updated with important announcements and society news
              </p>
            </div>

            <NoticesSection notices={notices} />
          </div>
        </section>

        {/* Upcoming Events Section */}
        <section id="events" className="w-full py-20 md:py-32 px-4 md:px-6 bg-slate-950">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Upcoming Events
              </h2>
              <p className="text-slate-400 text-lg max-w-[600px] mx-auto">
                Join our vibrant community activities and celebrations
              </p>
            </div>

            <EventsSection events={events} />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 md:py-32 px-4 md:px-6 bg-slate-950">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Everything You Need
              </h2>
              <p className="text-slate-400 text-lg max-w-[600px] mx-auto">
                Comprehensive features designed to make society living effortless and enjoyable
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature Card 1 */}
              <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur transition-all hover:bg-white/10 hover:border-white/20 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="mb-4 inline-flex rounded-lg bg-sky-500/10 p-3">
                    <Bell className="h-6 w-6 text-sky-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Instant Notices</h3>
                  <p className="text-slate-400">
                    Stay informed with real-time society notices and important announcements
                  </p>
                </div>
              </div>

              {/* Feature Card 2 */}
              <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur transition-all hover:bg-white/10 hover:border-white/20 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="mb-4 inline-flex rounded-lg bg-purple-500/10 p-3">
                    <Calendar className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Events & Activities</h3>
                  <p className="text-slate-400">
                    Discover and register for community events, festivals, and activities
                  </p>
                </div>
              </div>

              {/* Feature Card 3 */}
              <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur transition-all hover:bg-white/10 hover:border-white/20 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="mb-4 inline-flex rounded-lg bg-pink-500/10 p-3">
                    <Users className="h-6 w-6 text-pink-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Neighbor Directory</h3>
                  <p className="text-slate-400">
                    Connect with neighbors and build a stronger community network
                  </p>
                </div>
              </div>

              {/* Feature Card 4 */}
              <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur transition-all hover:bg-white/10 hover:border-white/20 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="mb-4 inline-flex rounded-lg bg-indigo-500/10 p-3">
                    <MessageSquare className="h-6 w-6 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Complaint Management</h3>
                  <p className="text-slate-400">
                    Quick and efficient resolution of maintenance and service issues
                  </p>
                </div>
              </div>

              {/* Feature Card 5 */}
              <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur transition-all hover:bg-white/10 hover:border-white/20 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="mb-4 inline-flex rounded-lg bg-sky-500/10 p-3">
                    <Building2 className="h-6 w-6 text-sky-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Marketplace</h3>
                  <p className="text-slate-400">
                    Buy, sell, and rent within your community with ease and trust
                  </p>
                </div>
              </div>

              {/* Feature Card 6 */}
              <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur transition-all hover:bg-white/10 hover:border-white/20 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="mb-4 inline-flex rounded-lg bg-purple-500/10 p-3">
                    <Shield className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Secure & Private</h3>
                  <p className="text-slate-400">
                    Your data is protected with enterprise-grade security measures
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="w-full py-20 md:py-32 px-4 md:px-6 bg-gradient-to-br from-slate-900 to-indigo-900/30">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                  About Runwal Seagull
                </h2>
                <div className="space-y-4 text-slate-300 text-lg leading-relaxed">
                  <p>
                    <strong className="text-white">Runwal Seagull Society</strong> is a premier residential community
                    offering modern amenities and a vibrant lifestyle. Our society management portal
                    brings convenience and transparency to every resident.
                  </p>
                  <p>
                    With state-of-the-art facilities, dedicated management, and a thriving community,
                    Runwal Seagull provides the perfect environment for families to grow and prosper.
                  </p>
                  <p>
                    Our digital platform ensures seamless communication, efficient service delivery,
                    and enhanced community engagement. From notices to events, from complaints to
                    neighbor connections - everything is just a click away.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-sky-500/20 to-purple-500/20 backdrop-blur border border-white/10 p-8">
                  <div className="h-full w-full flex items-center justify-center">
                    <Building2 className="h-48 w-48 text-sky-400/50" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="w-full py-20 md:py-32 px-4 md:px-6 bg-slate-950">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Get in Touch
              </h2>
              <p className="text-slate-400 text-lg">
                Have questions? We're here to help
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
                <div className="inline-flex rounded-lg bg-sky-500/10 p-3 mb-4">
                  <Phone className="h-6 w-6 text-sky-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Phone</h3>
                <p className="text-slate-400">+91 22 1234 5678</p>
                <p className="text-slate-400 text-sm">Mon-Sat, 9AM-6PM</p>
              </div>

              <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
                <div className="inline-flex rounded-lg bg-purple-500/10 p-3 mb-4">
                  <Mail className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Email</h3>
                <p className="text-slate-400">info@runwalseagull.com</p>
                <p className="text-slate-400 text-sm">24/7 Support</p>
              </div>

              <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
                <div className="inline-flex rounded-lg bg-pink-500/10 p-3 mb-4">
                  <MapPin className="h-6 w-6 text-pink-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Address</h3>
                <p className="text-slate-400">Runwal Seagull Society</p>
                <p className="text-slate-400 text-sm">Mumbai, Maharashtra</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 px-4 md:px-6 bg-gradient-to-r from-sky-500/10 via-purple-500/10 to-pink-500/10 border-y border-white/10">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Join Our Community?
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-[600px] mx-auto">
              Register now to access all features and become part of the Runwal Seagull family
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white px-10 py-6 text-lg rounded-full shadow-lg shadow-sky-500/50">
                Register Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 px-4 md:px-6 bg-slate-900 border-t border-white/10">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-6 w-6 text-sky-400" />
                <span className="font-bold text-white">Runwal Seagull</span>
              </div>
              <p className="text-slate-400 text-sm">
                Smart living for modern communities. Your gateway to seamless society management.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="text-slate-400 hover:text-sky-400 transition-colors">Features</Link></li>
                <li><Link href="#about" className="text-slate-400 hover:text-sky-400 transition-colors">About Us</Link></li>
                <li><Link href="#contact" className="text-slate-400 hover:text-sky-400 transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Services</h3>
              <ul className="space-y-2 text-sm">
                <li><span className="text-slate-400">Notice Board</span></li>
                <li><span className="text-slate-400">Event Management</span></li>
                <li><span className="text-slate-400">Complaint System</span></li>
                <li><span className="text-slate-400">Marketplace</span></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-slate-400 hover:text-sky-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="text-slate-400 hover:text-sky-400 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              © 2026 Runwal Seagull Society. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link href="/login" className="text-sm text-slate-400 hover:text-sky-400 transition-colors">
                Login
              </Link>
              <Link href="/register" className="text-sm text-slate-400 hover:text-sky-400 transition-colors">
                Register
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
