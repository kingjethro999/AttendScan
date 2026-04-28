"use client";

import { useState, useEffect } from "react";
import { AttendanceTable } from "@/components/features/courses/AttendanceTable";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { 
  History, 
  BookOpen, 
  ChevronDown, 
  Download, 
  FileSpreadsheet, 
  FileText,
  Loader2
} from "lucide-react";
import { logger } from "@/lib/utils";
import { toast } from "sonner";

interface Course {
  id: string;
  name: string;
  code: string;
}

export default function LecturerHistoryPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [attendance, setAttendance] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/courses");
        if (response.ok) {
          const data = await response.json();
          setCourses(data);
          if (data.length > 0) {
            setSelectedCourseId(data[0].id);
          }
        }
      } catch (error) {
        logger.error("Failed to fetch courses", error);
      } finally {
        setIsLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      const fetchAttendance = async () => {
        setIsLoadingAttendance(true);
        try {
          const response = await fetch(`/api/courses/${selectedCourseId}`);
          if (response.ok) {
            const data = await response.json();
            setAttendance(data.attendance);
          }
        } catch (error) {
          logger.error("Failed to fetch attendance", error);
        } finally {
          setIsLoadingAttendance(false);
        }
      };
      fetchAttendance();
    }
  }, [selectedCourseId]);

  const handleExport = async (format: "csv" | "excel") => {
    if (!selectedCourseId) return;
    setIsExporting(true);
    window.location.href = `/api/export/${selectedCourseId}?format=${format}`;
    toast.success(`Exporting as ${format.toUpperCase()}...`);
    setTimeout(() => setIsExporting(false), 2000);
  };

  if (isLoadingCourses) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Loading history...</p>
      </div>
    );
  }

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl text-primary">
              <History size={24} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Attendance History</h1>
          </div>
          <p className="text-muted-foreground">Browse and export historical attendance records by course.</p>
        </div>

        {selectedCourseId && (
          <div className="flex flex-wrap gap-3">
            <div className="relative group">
              <Button variant="outline" className="rounded-xl group-hover:border-primary transition-colors">
                <Download size={18} className="mr-2" />
                Export Data
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
          </div>
        )}
      </div>

      <Card className="p-1 border-primary/10 bg-primary/5">
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground uppercase tracking-widest shrink-0">
            <BookOpen size={16} /> Select Course
          </div>
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => setSelectedCourseId(course.id)}
                className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
                  selectedCourseId === course.id
                    ? "bg-primary text-[var(--text-primary)] shadow-md shadow-primary/20"
                    : "bg-card hover:bg-secondary border border-border/50 text-muted-foreground"
                }`}
              >
                <span className="block truncate">{course.name}</span>
                <span className={`text-[10px] uppercase block ${selectedCourseId === course.id ? "text-primary-foreground/70" : "text-muted-foreground/60"}`}>
                  {course.code}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {selectedCourseId ? (
          <>
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-bold">
                Records for <span className="text-primary">{selectedCourse?.name}</span>
              </h2>
              {isLoadingAttendance && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
            </div>
            
            {isLoadingAttendance ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Fetching records...</p>
              </div>
            ) : (
              <AttendanceTable records={attendance} />
            )}
          </>
        ) : (
          <Card className="border-dashed border-2 py-32 flex flex-col items-center justify-center text-center">
            <div className="bg-muted p-6 rounded-full mb-6">
              <BookOpen size={48} className="text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold">No course selected</h3>
            <p className="text-muted-foreground max-w-sm mt-2">
              Select a course from the list above to view its historical attendance records.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
