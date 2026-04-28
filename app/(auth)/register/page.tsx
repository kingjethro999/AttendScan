import { RegisterForm } from "@/components/features/auth/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--surface-900)] p-4 py-12">
      <div className="flex flex-col items-center space-y-4 text-center mb-8">
        <div className="bg-red-500/10 p-4 rounded-3xl border border-red-500/20">
          <h1 className="text-3xl font-black text-white tracking-tighter">ATTENDSCAN</h1>
        </div>
        <p className="text-[var(--text-secondary)]">Create an account</p>
      </div>
      <RegisterForm />
    </div>
  );
}