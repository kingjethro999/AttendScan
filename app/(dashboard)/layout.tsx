import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/shared/Sidebar";
import MobileNav from "@/components/shared/MobileNav";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  const user = {
    firstName: (session.user as any).firstName,
    lastName: (session.user as any).lastName,
    email: session.user.email!,
    role: (session.user as any).role as "LECTURER" | "STUDENT",
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Sidebar role={user.role} user={user} />
      <MobileNav role={user.role} user={user} />
      <main className="lg:pl-64 min-h-screen relative pb-24 lg:pb-0">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
          {children}
        </div>
        <div className="bg-grid absolute inset-0 pointer-events-none" />
      </main>
    </div>
  );
}