import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/utils";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { format as formatDate } from "date-fns";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const session = await auth();
    const userId = (session?.user as any)?.id;
    const role = (session?.user as any)?.role;

    if (!userId || role !== "LECTURER") {
      return new Response("Unauthorized", { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "csv";

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        attendance: {
          include: {
            student: {
              select: {
                firstName: true,
                lastName: true,
                studentId: true,
                email: true,
              },
            },
          },
          orderBy: { timestamp: "desc" },
        },
      },
    });

    if (!course || course.lecturerId !== userId) {
      return new Response("Course not found", { status: 404 });
    }

    interface AttendanceWithStudent {
      timestamp: Date;
      student: {
        firstName: string;
        lastName: string;
        studentId: string | null;
        email: string;
      };
    }

    // Flatten data for export
    const data = (course.attendance as unknown as AttendanceWithStudent[]).map((record) => ({
      Date: formatDate(new Date(record.timestamp), "yyyy-MM-dd"),
      "First Name": record.student.firstName,
      "Last Name": record.student.lastName,
      "Student ID": record.student.studentId,
      "Course Name": course.name,
      "Course Code": course.code,
      Timestamp: formatDate(new Date(record.timestamp), "HH:mm:ss"),
    }));

    const filename = `AttendScan_${course.code.replace(/\s+/g, "_")}_${formatDate(new Date(), "yyyy-MM-dd")}`;

    if (format === "csv") {
      const csv = Papa.unparse(data);
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}.csv"`,
        },
      });
    } else if (format === "excel") {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
      
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
      
      return new Response(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
        },
      });
    }

    return new Response("Invalid format", { status: 400 });
  } catch (error) {
    logger.error("Export API error", error);
    return new Response("Internal server error", { status: 500 });
  }
}
