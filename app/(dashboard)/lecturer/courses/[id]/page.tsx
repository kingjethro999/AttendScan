"use client";

import { useState, useEffect, use } from "react";
import { useParams, useRouter } from "next/navigation";
import { AttendanceTable } from "@/components/features/courses/AttendanceTable";
import { QRGeneratorModal } from "@/components/features/qr/QRGeneratorModal";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { 
  ArrowLeft, 
  Download, 
  QrCode, 
  Loader2, 
  FileSpreadsheet,
  FileText,
  ChevronDown
} from "lucide-react";
import { logger } from "@/lib/utils";
import { toast } from "sonner";

interface Course {
  id: string;
  name: string;
  code: string;
  attendance: any[];
}

export default function SingleCoursePage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const fetchCourseDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/courses/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCourse(data);
      } else {
        toast.error("Failed to load course details");
        router.push("/lecturer/courses");
      }
    } catch (error) {
      logger.error("Fetch course details error", error);
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const handleExport = async (format: "csv" | "excel") => {
    if (!id) return;
    setIsExporting(true);
    try {
      window.location.href = `/api/export/${id}?format=${format}`;
      toast.success(`Exporting as ${format.toUpperCase()}...`);
    } catch (error) {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Loading session data...</p>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push("/lecturer/courses")}
          className="w-fit -ml-2 text-muted-foreground hover:text-primary"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to My Courses
        </Button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-extrabold tracking-tight">{course.name}</h1>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-bold border border-primary/20">
                {course.code}
              </span>
            </div>
            <p className="text-muted-foreground text-lg">Manage attendance and view student records.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative group">
              <Button variant="outline" className="rounded-xl group-hover:border-primary transition-colors">
                <Download size={18} className="mr-2" />
                Export
                <ChevronDown size={16} className="ml-2" />
              </Button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-card border rounded-xl shadow-xl p-2 hidden group-hover:block z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                <button 
                  onClick={() => handleExport("csv")}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors text-sm font-medium"
                >
                  <FileText size={16} /> Export as CSV
                </button>
                <button 
                  onClick={() => handleExport("excel")}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors text-sm font-medium"
                >
                  <FileSpreadsheet size={16} /> Export as Excel
                </button>
              </div>
            </div>
            <Button onClick={() => setShowQRModal(true)} className="rounded-xl px-6 bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/20">
              <QrCode size={18} className="mr-2" />
              Generate QR Code
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Attendance Records</h2>
          <span className="text-sm font-medium text-muted-foreground bg-secondary px-4 py-1.5 rounded-full">
            Total Records: {course.attendance.length}
          </span>
        </div>
        <AttendanceTable records={course.attendance} />
      </div>

      {showQRModal && (
        <QRGeneratorModal 
          courseId={course.id} 
          courseName={course.name} 
          onClose={() => {
            setShowQRModal(false);
            fetchCourseDetails(); // Refresh records after session
          }}
        />
      )}
    </div>
  );
}
