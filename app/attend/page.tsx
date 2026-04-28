"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader2, QrCode, CheckCircle, XCircle } from "lucide-react";
import { logger } from "@/lib/utils";
import { toast } from "sonner";

function AttendContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [status_msg, setStatusMsg] = useState<{
    success: boolean;
    message: string;
    courseName?: string;
  } | null>(null);

  const token = searchParams.get("token");

  const handleAttend = async () => {
    if (!token || !session) return;
    
    setIsLoading(true);
    try {
      const response = await fetch("/api/attendance/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMsg({
          success: true,
          message: data.alreadyRecorded ? "Attendance already recorded" : "Attendance marked successfully!",
          courseName: data.courseName
        });
        toast.success("Success!");
      } else {
        setStatusMsg({
          success: false,
          message: data.error || "Failed to record attendance"
        });
        toast.error(data.error || "Error");
      }
    } catch (error) {
      logger.error("Attend page error", error);
      setStatusMsg({ success: false, message: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      const returnUrl = encodeURIComponent(`/attend?token=${token}`);
      router.push(`/login?callbackUrl=${returnUrl}`);
    }
  }, [status, token, router]);

  if (status === "loading" || (status === "authenticated" && !status_msg && !isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-900)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-red-500" />
          <p className="text-[var(--text-secondary)] font-medium">Preparing attendance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface-900)] p-4">
      <Card className="w-full max-w-md p-8 text-center bg-[var(--surface-800)] border border-[var(--surface-600)] rounded-[24px]">
        {!status_msg ? (
          <div className="space-y-6">
            <div className="bg-red-500/10 p-4 rounded-3xl w-fit mx-auto text-red-500">
              <QrCode size={48} />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Confirm Attendance</h1>
              <p className="text-[var(--text-secondary)]">
                You are about to mark your attendance for a lecture session.
              </p>
            </div>
            <Button 
              onClick={handleAttend} 
              className="w-full h-14 text-lg rounded-xl bg-red-500 hover:bg-red-600" 
              isLoading={isLoading}
            >
              Mark as Present
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className={`p-4 rounded-full w-fit mx-auto ${status_msg.success ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
              {status_msg.success ? <CheckCircle size={48} /> : <XCircle size={48} />}
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">{status_msg.success ? "Success!" : "Failed"}</h2>
              <p className={`text-lg font-medium ${status_msg.success ? "text-green-500" : "text-red-500"}`}>
                {status_msg.message}
              </p>
              {status_msg.courseName && (
                <p className="font-bold text-xl mt-2 text-[var(--text-primary)]">{status_msg.courseName}</p>
              )}
            </div>
            <Button asChild variant="outline" className="w-full rounded-xl">
              <a href="/student/home">Go to Dashboard</a>
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function AttendPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-900)]">
        <Loader2 className="h-10 w-10 animate-spin text-red-500" />
      </div>
    }>
      <AttendContent />
    </Suspense>
  );
}