import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateQRToken } from "@/lib/qr-token";
import { logger } from "@/lib/utils";
import { addMinutes } from "date-fns";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    const role = (session?.user as any)?.role;

    if (!userId || role !== "LECTURER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, durationMinutes } = await req.json();

    if (!courseId || !durationMinutes) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { lecturerId: true, name: true },
    });

    if (!course || course.lecturerId !== userId) {
      return NextResponse.json({ error: "Course not found or unauthorized" }, { status: 404 });
    }

    const token = generateQRToken();
    const expiresAt = addMinutes(new Date(), parseInt(durationMinutes));

    const qrSession = await prisma.qRSession.create({
      data: {
        courseId,
        token,
        expiresAt,
      },
    });

    logger.info("QR Session created", { 
      sessionId: qrSession.id, 
      course: course.name, 
      expiresAt 
    });

    return NextResponse.json({
      token,
      expiresAt,
      id: qrSession.id,
    });
  } catch (error) {
    logger.error("POST qr/generate API error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
