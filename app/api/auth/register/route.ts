import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth-utils";
import { logger } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password, role, studentId } = body;

    if (!firstName || !lastName || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (role === "STUDENT" && !studentId) {
      return NextResponse.json({ error: "Student ID is required for students" }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // Check if student ID already exists (for students)
    if (role === "STUDENT") {
      const existingStudent = await prisma.user.findUnique({
        where: { studentId },
      });
      if (existingStudent) {
        return NextResponse.json({ error: "Student ID already registered" }, { status: 409 });
      }
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
        studentId: role === "STUDENT" ? studentId : null,
      },
    });

    logger.info("User registered successfully", { email: user.email, role: user.role });

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
  } catch (error) {
    logger.error("Registration API error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
