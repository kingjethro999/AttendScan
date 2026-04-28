import { LoginForm } from "@/components/features/auth/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] p-4">
      <div className="flex flex-col items-center space-y-4 text-center mb-8">
        <div className="bg-red-500/10 p-4 rounded-3xl border border-[var(--border)]">
          <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter">ATTENDSCAN</h1>
        </div>
        <p className="text-[var(--text-secondary)]">Sign in to continue</p>
      </div>
      <LoginForm />
    </div>
  );
}