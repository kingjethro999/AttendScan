import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/utils";

export async function GET() {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    const role = (session?.user as any)?.role;

    if (!userId || role !== "LECTURER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courses = await prisma.course.findMany({
      where: { lecturerId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { attendance: true },
        },
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    logger.error("GET courses API error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    const role = (session?.user as any)?.role;

    if (!userId || role !== "LECTURER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, code } = await req.json();

    if (!name || !code) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const course = await prisma.course.create({
      data: {
        name,
        code,
        lecturerId: userId,
      },
    });

    logger.info("Course created successfully", { courseId: course.id, name: course.name });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    logger.error("POST courses API error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
