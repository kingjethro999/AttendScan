import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { 
  Clock, 
  BookOpen, 
  Calendar,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import { Card } from "@/components/ui/Card";

export default async function StudentHistoryPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  const attendance = await prisma.attendance.findMany({
    where: { studentId: userId },
    include: {
      course: {
        select: { name: true, code: true }
      }
    },
    orderBy: { timestamp: "desc" }
  });

  // Group by course
  const groupedByCourse = attendance.reduce((acc, record) => {
    const courseId = record.courseId;
    if (!acc[courseId]) {
      acc[courseId] = {
        name: record.course.name,
        code: record.course.code,
        records: []
      };
    }
    acc[courseId].records.push(record);
    return acc;
  }, {} as Record<string, { name: string; code: string; records: any[] }>);

  const courses = Object.values(groupedByCourse);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Attendance History</h1>
        <p className="text-muted-foreground">Review all your recorded attendance sessions.</p>
      </div>

      {courses.length > 0 ? (
        <div className="space-y-10">
          {courses.map((course) => (
            <section key={course.code} className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-xl text-primary">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{course.name}</h2>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{course.code}</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-secondary rounded-full text-secondary-foreground">
                  {course.records.length} sessions
                </span>
              </div>

              <div className="grid gap-3">
                {course.records.map((record) => (
                  <Card key={record.id} className="p-4 hover:border-primary/30 transition-colors group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-emerald-100 dark:bg-emerald-950/20 p-2 rounded-full text-emerald-600">
                          <CheckCircle2 size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-lg">
                            {format(new Date(record.timestamp), "EEEE, MMMM d, yyyy")}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock size={14} /> {format(new Date(record.timestamp), "HH:mm")}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                            <span className="flex items-center gap-1">
                              <Calendar size={14} /> {format(new Date(record.timestamp), "yyyy")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1" />
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 py-32 flex flex-col items-center justify-center text-center">
          <div className="bg-muted p-6 rounded-full mb-6">
            <Clock size={48} className="text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-bold">No records yet</h3>
          <p className="text-muted-foreground max-w-sm mt-2">
            Start by scanning a QR code in your next lecture to see your history here.
          </p>
          <a href="/student/scan" className="mt-8 inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
            Go to Scanner
          </a>
        </Card>
      )}
    </div>
  );
}
