"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { logger } from "@/lib/utils";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    logger.info("Attempting login", { email: formData.email });

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
        logger.error("Login failed", result.error);
      } else {
        toast.success("Welcome back!");
        router.refresh();
        router.push("/");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      logger.error("Login exception", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto bg-[var(--bg-card)] border border-[var(--border)] rounded-[24px] p-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-[var(--text-primary)]">Sign In</h2>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Enter your credentials to access your account</p>
        </div>
        <div className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
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
          <Button type="submit" className="w-full bg-red-500 hover:bg-red-600" isLoading={isLoading}>
            Sign In
          </Button>
        </div>
        <p className="text-sm text-center text-[var(--text-secondary)]">
          Don't have an account?{" "}
          <button type="button" className="text-red-500 font-semibold hover:underline" onClick={() => router.push("/register")}>
            Create one
          </button>
        </p>
      </div>
    </form>
  );
}