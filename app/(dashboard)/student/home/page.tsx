import { auth } from "@/lib/auth";
import { MetricCard } from "@/components/features/metrics/MetricCard";
import prisma from "@/lib/prisma";
import { CheckCircle, BookOpen, Calendar, Clock, QrCode, Activity } from "lucide-react";
import { startOfMonth, format } from "date-fns";

export default async function StudentHomePage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  const userName = (session?.user as any)?.firstName;

  const [totalAttended, coursesAttended, thisMonthAttended, lastScan] = await Promise.all([
    prisma.attendance.count({
      where: { studentId: userId },
    }),
    prisma.attendance.groupBy({
      by: ["courseId"],
      where: { studentId: userId },
    }).then((res: any[]) => res.length),
    prisma.attendance.count({
      where: {
        studentId: userId,
        timestamp: { gte: startOfMonth(new Date()) },
      },
    }),
    prisma.attendance.findFirst({
      where: { studentId: userId },
      orderBy: { timestamp: "desc" },
      select: { timestamp: true },
    }),
  ]);

  const lastScanFormatted = lastScan 
    ? format(new Date(lastScan.timestamp), "MMM d, HH:mm")
    : "No scans yet";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] mb-1 tracking-tight">Welcome back, {userName}</h1>
          <p className="text-[var(--text-secondary)] font-medium">Ready for your next lecture?</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
           <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
           <span className="text-xs font-black text-red-500 uppercase tracking-widest">Scanner Ready</span>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard
          label="Sessions Attended"
          value={totalAttended}
          icon={CheckCircle}
          description="Total records"
        />
        <MetricCard
          label="Courses Attended"
          value={coursesAttended}
          icon={BookOpen}
          description="Unique subjects"
        />
        <MetricCard
          label="This Month"
          value={thisMonthAttended}
          icon={Calendar}
          description="Attendance in current month"
        />
        <MetricCard
          label="Last Scan"
          value={lastScanFormatted}
          icon={Clock}
          description="Your most recent activity"
        />
      </div>

      <div className="bg-[var(--surface-800)] border border-[var(--surface-600)] rounded-[32px] p-8 md:p-10 relative overflow-hidden balance-card card-lift shadow-2xl">
        <div className="relative z-10 flex flex-col h-full justify-between items-center text-center py-8">
          <div className="bg-red-500/10 p-6 rounded-2xl border border-red-500/20 mb-6">
            <QrCode size={56} className="text-red-500" />
          </div>
          <div className="space-y-3 mb-8">
            <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Ready to Scan?</h2>
            <p className="text-[var(--text-secondary)] max-w-md mx-auto">
              Point your camera at the QR code displayed by your lecturer to record your attendance instantly.
            </p>
          </div>
          <a href="/student/scan" className="inline-flex items-center justify-center px-10 py-4 text-base font-bold bg-red-500 hover:bg-red-600 text-[var(--text-primary)] rounded-xl transition-all hover:scale-105 shadow-lg shadow-red-500/20">
            Open QR Scanner
          </a>
        </div>
        
        <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.03] pointer-events-none rotate-12">
          <Activity size={320} />
        </div>
      </div>
    </div>
  );
}