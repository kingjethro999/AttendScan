"use client";

import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { 
  X, 
  Timer, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Loader2
} from "lucide-react";
import { logger, cn } from "@/lib/utils";
import { toast } from "sonner";
import { differenceInSeconds, format } from "date-fns";

interface QRGeneratorModalProps {
  courseId: string;
  courseName: string;
  onClose: () => void;
}

export function QRGeneratorModal({ courseId, courseName, onClose }: QRGeneratorModalProps) {
  const [duration, setDuration] = useState("6");
  const [session, setSession] = useState<{ token: string; expiresAt: Date } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateQR = async () => {
    setIsLoading(true);
    setIsExpired(false);
    try {
      const response = await fetch("/api/qr/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, durationMinutes: duration }),
      });

      if (response.ok) {
        const data = await response.json();
        const expiry = new Date(data.expiresAt);
        setSession({ token: data.token, expiresAt: expiry });
        
        const seconds = differenceInSeconds(expiry, new Date());
        setTimeLeft(seconds);
        toast.success("QR Code generated successfully");
      } else {
        toast.error("Failed to generate QR Code");
      }
    } catch (error) {
      logger.error("QR generation error", error);
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev !== null && prev <= 1) {
            clearInterval(timerRef.current!);
            setIsExpired(true);
            return 0;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const qrUrl = session ? `${window.location.origin}/attend?token=${session.token}` : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-2xl relative shadow-2xl border-primary/20 overflow-hidden">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-4 top-4 rounded-full" 
          onClick={() => {
            if (session && !isExpired) {
              if (confirm("Are you sure? Active students may not finish scanning.")) {
                onClose();
              }
            } else {
              onClose();
            }
          }}
        >
          <X size={20} />
        </Button>

        <CardContent className="p-8 md:p-12">
          {!session ? (
            <div className="space-y-6 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Generate QR Code</h2>
                <p className="text-muted-foreground">Select session duration for {courseName}</p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-3">
                {["2", "5", "6", "10", "15", "30"].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setDuration(mins)}
                    className={cn(
                      "px-6 py-3 rounded-xl border-2 font-semibold transition-all",
                      duration === mins 
                        ? "border-primary bg-primary/5 text-primary shadow-sm" 
                        : "border-border hover:border-primary/40 text-muted-foreground"
                    )}
                  >
                    {mins} min
                  </button>
                ))}
              </div>

              <Button onClick={generateQR} className="w-full h-14 text-lg rounded-2xl" isLoading={isLoading}>
                Generate Session QR
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-8 animate-in zoom-in-95 duration-300">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">{courseName}</h2>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Timer size={18} className={isExpired ? "text-destructive" : "text-primary"} />
                  <span className={cn(
                    "text-xl font-mono font-bold",
                    isExpired ? "text-destructive" : "text-foreground"
                  )}>
                    {isExpired ? "EXPIRED" : formatTime(timeLeft || 0)}
                  </span>
                </div>
              </div>

              <div className="relative group">
                <div className={cn(
                  "p-8 bg-white rounded-3xl shadow-inner border transition-opacity duration-500",
                  isExpired && "opacity-30 grayscale"
                )}>
                  <QRCodeSVG 
                    value={qrUrl} 
                    size={280} 
                    level="H"
                    includeMargin={false}
                    imageSettings={{
                      src: "/favicon.ico",
                      x: undefined,
                      y: undefined,
                      height: 40,
                      width: 40,
                      excavate: true,
                    }}
                  />
                </div>
                {isExpired && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-destructive text-white px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
                      <AlertTriangle size={18} />
                      Session Expired
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full space-y-4">
                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 rounded-2xl border border-amber-200 dark:border-amber-900/50">
                  <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                  <p className="text-sm font-medium">
                    Do not close this modal or refresh the page — students are scanning. 
                    Ask them to scan the code above.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setSession(null)}>
                    <RefreshCw size={18} className="mr-2" />
                    Reset
                  </Button>
                  <Button 
                    className="flex-1 h-12 rounded-xl" 
                    onClick={() => {
                      if (isExpired || confirm("Are you sure? Active students may not finish scanning.")) {
                        onClose();
                      }
                    }}
                  >
                    <CheckCircle size={18} className="mr-2" />
                    Done
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
