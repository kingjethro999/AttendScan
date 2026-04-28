"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader2, QrCode, CheckCircle, XCircle } from "lucide-react";
import { logger } from "@/lib/utils";
import { toast } from "sonner";

export default function AttendPage() {
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
      // Redirect to login but keep the token so we can return here
      const returnUrl = encodeURIComponent(`/attend?token=${token}`);
      router.push(`/login?callbackUrl=${returnUrl}`);
    }
  }, [status, token, router]);

  if (status === "loading" || (status === "authenticated" && !status_msg && !isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Preparing attendance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-brand-50/50 to-background dark:from-brand-950/20 p-4">
      <Card className="w-full max-w-md p-8 text-center animate-in zoom-in-95 duration-300">
        {!status_msg ? (
          <div className="space-y-6">
            <div className="bg-primary/10 p-4 rounded-3xl w-fit mx-auto text-primary">
              <QrCode size={48} />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Confirm Attendance</h1>
              <p className="text-muted-foreground">
                You are about to mark your attendance for a lecture session.
              </p>
            </div>
            <Button 
              onClick={handleAttend} 
              className="w-full h-14 text-lg rounded-2xl" 
              isLoading={isLoading}
            >
              Mark as Present
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className={`p-4 rounded-full w-fit mx-auto ${status_msg.success ? "bg-emerald-100 text-emerald-600" : "bg-destructive/10 text-destructive"}`}>
              {status_msg.success ? <CheckCircle size={48} /> : <XCircle size={48} />}
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{status_msg.success ? "Success!" : "Failed"}</h2>
              <p className={`text-lg font-medium ${status_msg.success ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"}`}>
                {status_msg.message}
              </p>
              {status_msg.courseName && (
                <p className="font-bold text-xl mt-2">{status_msg.courseName}</p>
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
