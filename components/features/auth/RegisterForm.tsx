"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { logger } from "@/lib/utils";
import { toast } from "sonner";
import { User, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<"LECTURER" | "STUDENT">("STUDENT");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    studentId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    logger.info("Attempting registration", { email: formData.email, role });

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Registration failed");
        logger.error("Registration failed", data);
      } else {
        toast.success("Account created! Please sign in.");
        router.push("/login");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      logger.error("Registration exception", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto bg-[var(--bg-card)] border border-[var(--border)] rounded-[24px] p-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-[var(--text-primary)]">Create Account</h2>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Join AttendScan to manage attendance</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setRole("STUDENT")}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2",
              role === "STUDENT" 
                ? "border-red-500 bg-red-500/10 text-red-500 shadow-sm" 
                : "border-[var(--border)] hover:border-red-500/50 text-[var(--text-secondary)]"
            )}
          >
            <GraduationCap size={24} />
            <span className="text-sm font-semibold">Student</span>
          </button>
          <button
            type="button"
            onClick={() => setRole("LECTURER")}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2",
              role === "LECTURER" 
                ? "border-red-500 bg-red-500/10 text-red-500 shadow-sm" 
                : "border-[var(--border)] hover:border-red-500/50 text-[var(--text-secondary)]"
            )}
          >
            <User size={24} />
            <span className="text-sm font-semibold">Lecturer</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            placeholder="John"
            required
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
          <Input
            label="Last Name"
            placeholder="Doe"
            required
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          placeholder="john.doe@university.edu"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />

        {role === "STUDENT" && (
          <Input
            label="Student ID"
            placeholder="LUC-NGA-002-ADM-1001015"
            required
            value={formData.studentId}
            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
          />
        )}

        <Button type="submit" className="w-full bg-red-500 hover:bg-red-600" isLoading={isLoading}>
          Create Account
        </Button>

        <p className="text-sm text-center text-[var(--text-secondary)]">
          Already have an account?{" "}
          <button type="button" className="text-red-500 font-semibold hover:underline" onClick={() => router.push("/login")}>
            Sign In
          </button>
        </p>
      </div>
    </form>
  );
}