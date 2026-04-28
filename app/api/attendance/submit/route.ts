import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    const role = (session?.user as any)?.role;

    if (!userId || role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Invalid QR code" }, { status: 400 });
    }

    // 1. Find the QR session
    const qrSession = await prisma.qRSession.findUnique({
      where: { token },
      include: {
        course: {
          select: { id: true, name: true, code: true }
        }
      }
    });

    if (!qrSession) {
      return NextResponse.json({ error: "QR code session not found" }, { status: 404 });
    }

    // 2. Validate expiry
    if (new Date() > qrSession.expiresAt) {
      return NextResponse.json({ error: "QR code has expired" }, { status: 410 });
    }

    // 3. Check if student already submitted for this session
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        studentId_sessionId: {
          studentId: userId,
          sessionId: qrSession.id
        }
      }
    });

    if (existingAttendance) {
      return NextResponse.json({ 
        success: true, 
        alreadyRecorded: true,
        courseName: qrSession.course.name,
        timestamp: existingAttendance.timestamp
      });
    }

    // 4. Create attendance record
    const attendance = await prisma.attendance.create({
      data: {
        studentId: userId,
        courseId: qrSession.course.id,
        sessionId: qrSession.id,
      },
    });

    logger.info("Attendance recorded", { 
      studentId: userId, 
      course: qrSession.course.name,
      sessionId: qrSession.id 
    });

    return NextResponse.json({
      success: true,
      courseName: qrSession.course.name,
      courseCode: qrSession.course.code,
      timestamp: attendance.timestamp,
    });

  } catch (error) {
    logger.error("POST attendance/submit API error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
