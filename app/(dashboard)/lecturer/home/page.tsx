import { auth } from "@/lib/auth";
import { MetricCard } from "@/components/features/metrics/MetricCard";
import prisma from "@/lib/prisma";
import { QrCode, Users, BookOpen, TrendingUp, Activity } from "lucide-react";
import { startOfDay } from "date-fns";

export default async function LecturerHomePage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  const userName = (session?.user as any)?.firstName;

  const [qrSessionsCount, totalScansCount, coursesCount, todaysScansCount] = await Promise.all([
    prisma.qRSession.count({
      where: { course: { lecturerId: userId } },
    }),
    prisma.attendance.count({
      where: { course: { lecturerId: userId } },
    }),
    prisma.course.count({
      where: { lecturerId: userId },
    }),
    prisma.attendance.count({
      where: {
        course: { lecturerId: userId },
        timestamp: { gte: startOfDay(new Date()) },
      },
    }),
  ]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] mb-1 tracking-tight">Welcome back, {userName}</h1>
          <p className="text-[var(--text-secondary)] font-medium">Here's an overview of your activity.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
           <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
           <span className="text-xs font-black text-red-500 uppercase tracking-widest">System Active</span>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard
          label="QR Codes Generated"
          value={qrSessionsCount}
          icon={QrCode}
          description="Total sessions created"
        />
        <MetricCard
          label="Total Scans"
          value={totalScansCount}
          icon={Users}
          description="Attendance records across all courses"
        />
        <MetricCard
          label="Total Courses"
          value={coursesCount}
          icon={BookOpen}
          description="Courses managed by you"
        />
        <MetricCard
          label="Today's Scans"
          value={todaysScansCount}
          icon={TrendingUp}
          description="Records collected today"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--surface-800)] border border-[var(--surface-600)] rounded-[24px] p-8 relative overflow-hidden balance-card card-lift">
          <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Manage Courses</h2>
              <p className="text-[var(--text-secondary)]">Review attendance and generate new QR codes for your sessions.</p>
            </div>
            <a href="/lecturer/courses" className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold bg-red-500 hover:bg-red-600 text-[var(--text-primary)] rounded-xl transition-all hover:scale-105 shadow-lg shadow-red-500/20">
               View My Courses
            </a>
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.03] pointer-events-none rotate-12">
            <Activity size={160} />
          </div>
        </div>
        
        <div className="bg-[var(--surface-800)] border border-[var(--surface-600)] rounded-[24px] p-8 relative overflow-hidden card-lift">
          <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Attendance History</h2>
              <p className="text-[var(--text-primary)]">Access detailed logs and export attendance reports.</p>
            </div>
            <a href="/lecturer/history" className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold bg-[var(--surface-700)] hover:bg-[var(--surface-600)] text-[var(--text-primary)] rounded-xl transition-all border border-white/5">
               Check History
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}