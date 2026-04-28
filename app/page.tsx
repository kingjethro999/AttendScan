import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { QrCode, ShieldCheck, Zap, Users, Download, Clock } from "lucide-react";

export default async function LandingPage() {
  const session = await auth();
  
  // If logged in, redirect to appropriate dashboard
  if (session?.user) {
    const role = (session.user as any)?.role;
    if (role === "LECTURER") {
      redirect("/lecturer/home");
    } else {
      redirect("/student/home");
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--surface-900)]">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center glass sticky top-0 z-50 border-b border-[var(--surface-600)]">
        <Link className="flex items-center justify-center gap-3" href="/">
          <h1 className="text-xl font-black text-white tracking-tighter">ATTENDSCAN</h1>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium text-[var(--text-secondary)] hover:text-white transition-colors" href="/login">
            Sign In
          </Link>
          <Button asChild variant="primary" size="sm">
            <Link href="/register">Get Started</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-white">
                  Attendance management<br />
                  <span className="text-red-500">built for the classroom</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-[var(--text-secondary)] md:text-xl">
                  Lecturers generate a time-limited QR code. Students scan it on their phone. That's it.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild size="lg" className="rounded-xl px-10">
                  <Link href="/register">Get started free</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-xl px-10">
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-t border-[var(--surface-600)]">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-2">Features</p>
              <h2 className="text-3xl font-black text-white">Everything you need, nothing you don't</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-[var(--surface-800)] border border-[var(--surface-600)] rounded-[24px] p-6 card-lift">
                <div className="bg-red-500/10 p-3 rounded-2xl text-red-500 w-fit mb-4">
                  <Zap className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Instant QR codes</h3>
                <p className="text-[var(--text-secondary)]">
                  Generate a time-limited code in one click. Project it, students scan, done.
                </p>
              </div>
              <div className="bg-[var(--surface-800)] border border-[var(--surface-600)] rounded-[24px] p-6 card-lift">
                <div className="bg-red-500/10 p-3 rounded-2xl text-red-500 w-fit mb-4">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Tamper-proof tokens</h3>
                <p className="text-[var(--text-secondary)]">
                  Each token expires after your chosen window. No sharing, no proxies.
                </p>
              </div>
              <div className="bg-[var(--surface-800)] border border-[var(--surface-600)] rounded-[24px] p-6 card-lift">
                <div className="bg-red-500/10 p-3 rounded-2xl text-red-500 w-fit mb-4">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Works on any device</h3>
                <p className="text-[var(--text-secondary)]">
                  Installable PWA. No app store, no friction. Students open and scan in seconds.
                </p>
              </div>
              <div className="bg-[var(--surface-800)] border border-[var(--surface-600)] rounded-[24px] p-6 card-lift">
                <div className="bg-red-500/10 p-3 rounded-2xl text-red-500 w-fit mb-4">
                  <QrCode className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Course management</h3>
                <p className="text-[var(--text-secondary)]">
                  Create and organise all your courses in one place. Attendance grouped by date.
                </p>
              </div>
              <div className="bg-[var(--surface-800)] border border-[var(--surface-600)] rounded-[24px] p-6 card-lift">
                <div className="bg-red-500/10 p-3 rounded-2xl text-red-500 w-fit mb-4">
                  <Download className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Export to CSV & Excel</h3>
                <p className="text-[var(--text-secondary)]">
                  Download per-course attendance records in one click, ready for your registry.
                </p>
              </div>
              <div className="bg-[var(--surface-800)] border border-[var(--surface-600)] rounded-[24px] p-6 card-lift">
                <div className="bg-red-500/10 p-3 rounded-2xl text-red-500 w-fit mb-4">
                  <Clock className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Full history view</h3>
                <p className="text-[var(--text-secondary)]">
                  Browse attendance collapsed by date. Students see their own record at a glance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-t border-[var(--surface-600)]">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-white">How it works</h2>
              <p className="text-[var(--text-secondary)] mt-2">Three steps from login to marked attendance.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                  1
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Lecturer generates a code</h3>
                <p className="text-[var(--text-secondary)]">
                  Pick your course, set a time window, and click generate. The QR appears instantly on screen.
                </p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                  2
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Students scan on their phone</h3>
                <p className="text-[var(--text-secondary)]">
                  Open AttendScan, tap Scan, point at the projector. Attendance is submitted in under three seconds.
                </p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                  3
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Records are saved automatically</h3>
                <p className="text-[var(--text-secondary)]">
                  Every scan is timestamped and stored. Export or review anytime from your course dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-t border-[var(--surface-600)] text-center">
          <div className="container px-4 mx-auto">
            <h2 className="text-3xl font-black text-white mb-3">Ready to ditch the register?</h2>
            <p className="text-[var(--text-secondary)] mb-6">Set up your first course in under two minutes.</p>
            <Button asChild size="lg" className="rounded-xl">
              <Link href="/register">Create a free account</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-4 md:px-6 border-t border-[var(--surface-600)]">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[var(--text-muted)]">
            © 2025 AttendScan. All rights reserved.
          </p>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-xs text-[var(--text-muted)] hover:text-white transition-colors" href="#">
              Terms of Service
            </Link>
            <Link className="text-xs text-[var(--text-muted)] hover:text-white transition-colors" href="#">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}