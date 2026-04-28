import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { revalidatePath } from "next/cache";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;
  const role = (session.user as any).role as "LECTURER" | "STUDENT";

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true, email: true, studentId: true },
  });

  if (!user) redirect("/login");

  async function updateProfile(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user) return;

    const userId = (session.user as any).id;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;

    await prisma.user.update({
      where: { id: userId },
      data: { firstName, lastName, email },
    });

    revalidatePath("/student/settings");
    revalidatePath("/lecturer/settings");
  }

  async function changePassword(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user) return;

    const userId = (session.user as any).id;
    const newPassword = formData.get("newPassword") as string;

    if (newPassword && newPassword.length >= 6) {
      const { hashPassword } = await import("@/lib/auth-utils");
      const hashed = await hashPassword(newPassword);
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashed },
      });
    }
  }

  const isStudent = role === "STUDENT";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-black text-white mb-1 tracking-tight">Settings</h1>
        <p className="text-[var(--text-secondary)]">Manage your account details</p>
      </header>

      <div className="grid gap-6">
        {/* Profile Info */}
        <div className="bg-[var(--surface-800)] border border-[var(--surface-600)] rounded-[24px] p-6">
          <h2 className="text-lg font-bold text-white mb-4">Profile Information</h2>
          <form action={updateProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="firstName"
                defaultValue={user.firstName || ""}
                required
              />
              <Input
                label="Last Name"
                name="lastName"
                defaultValue={user.lastName || ""}
                required
              />
            </div>
            <Input
              label="Email Address"
              name="email"
              type="email"
              defaultValue={user.email || ""}
              required
            />
            {isStudent && (
              <Input
                label="Student ID"
                value={user.studentId || ""}
                disabled
                className="opacity-50"
              />
            )}
            <Button type="submit" className="bg-red-500 hover:bg-red-600">
              Save Changes
            </Button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-[var(--surface-800)] border border-[var(--surface-600)] rounded-[24px] p-6">
          <h2 className="text-lg font-bold text-white mb-4">Change Password</h2>
          <form action={changePassword} className="space-y-4">
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              placeholder="Minimum 6 characters"
              minLength={6}
            />
            <Button type="submit" className="bg-red-500 hover:bg-red-600">
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}