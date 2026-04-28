import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/utils";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const userId = (session?.user as any)?.id;
    const role = (session?.user as any)?.role;

    if (!userId || role !== "LECTURER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const course = await prisma.course.findUnique({
      where: { id },
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
      return NextResponse.json({ error: "Course not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    logger.error("GET single course API error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
