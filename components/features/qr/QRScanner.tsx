"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { logger, cn } from "@/lib/utils";
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  QrCode
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface QRScannerProps {
  onSuccess?: (courseName: string, timestamp: Date) => void;
}

export function QRScanner({ onSuccess }: QRScannerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    courseName?: string;
    timestamp?: Date;
    message?: string;
  } | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const mountedRef = useRef(false);

  const startScanner = async () => {
    if (scannerRef.current || mountedRef.current) return;
    mountedRef.current = true;

    try {
      const scanner = new Html5Qrcode("qr-reader", {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });

      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // Try to extract token from URL
          try {
            const url = new URL(decodedText);
            const token = url.searchParams.get("token");

            if (token) {
              // Stop scanning briefly to submit
              await submitAttendance(token);
            } else {
              toast.error("Invalid QR code format");
            }
          } catch (e) {
            logger.error("Scan processing error", e);
          }
        },
        () => {
          // Silently handle scan failures
        }
      );

      setIsReady(true);
    } catch (error) {
      logger.error("Failed to start scanner", error);
      mountedRef.current = false;
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {
        logger.error("Scanner stop error", e);
      }
      scannerRef.current = null;
      mountedRef.current = false;
      setIsReady(false);
    }
  };

  useEffect(() => {
    startScanner();

    return () => {
      stopScanner();
    };
  }, []);

  const submitAttendance = async (token: string) => {
    setIsLoading(true);
    
    // Stop scanner while submitting
    await stopScanner();

    try {
      const response = await fetch("/api/attendance/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult({
          success: true,
          courseName: data.courseName,
          timestamp: new Date(data.timestamp),
          message: data.alreadyRecorded ? "Attendance already recorded" : "Attendance marked successfully"
        });
        if (onSuccess) onSuccess(data.courseName, new Date(data.timestamp));
        toast.success(data.alreadyRecorded ? "Duplicate scan recognized" : "Attendance recorded!");
      } else {
        setResult({
          success: false,
          message: data.error || "Failed to record attendance"
        });
        toast.error(data.error || "Submission failed");
      }
    } catch (error) {
      logger.error("Attendance submission error", error);
      setResult({ success: false, message: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    startScanner();
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {!isReady && !isLoading && !result && (
        <Card className="p-10 flex flex-col items-center text-center space-y-6 border-dashed border-2 bg-red-500/5">
          <div className="bg-red-500/20 p-6 rounded-full text-red-500">
            <QrCode size={48} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Initializing Camera...</h3>
            <p className="text-[var(--text-secondary)] text-sm">
              Please allow camera access to scan the attendance QR code.
            </p>
          </div>
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        </Card>
      )}

      <div className={cn("overflow-hidden rounded-3xl bg-black shadow-2xl relative", !isReady && "hidden")}>
        <div id="qr-reader" className="w-full" />
      </div>

      {isLoading && (
        <Card className="p-12 flex flex-col items-center justify-center space-y-4 bg-[var(--surface-800)] border border-[var(--surface-600)]">
          <Loader2 className="h-12 w-12 animate-spin text-red-500" />
          <p className="font-semibold text-lg text-[var(--text-primary)]">Validating Token...</p>
        </Card>
      )}

      {result && (
        <Card className={cn(
          "p-8 text-center animate-in zoom-in-95 duration-300 bg-[var(--surface-800)] border",
          result.success ? "border-green-500/20" : "border-red-500/20"
        )}>
          <div className="flex flex-col items-center space-y-6">
            <div className={cn(
              "p-4 rounded-full",
              result.success ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
            )}>
              {result.success ? <CheckCircle size={48} /> : <XCircle size={48} />}
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                {result.success ? "Success!" : "Scan Failed"}
              </h3>
              <p className={cn(
                "text-lg font-medium",
                result.success ? "text-green-500" : "text-red-500"
              )}>
                {result.message}
              </p>
            </div>

            {result.success && result.courseName && (
              <div className="w-full bg-[var(--surface-700)] p-4 rounded-2xl border border-[var(--surface-600)] space-y-1">
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold">Course</p>
                <p className="text-xl font-bold text-[var(--text-primary)]">{result.courseName}</p>
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  Recorded at {format(result.timestamp!, "HH:mm:ss, MMM d, yyyy")}
                </p>
              </div>
            )}

            <Button onClick={reset} variant="outline" className="w-full rounded-xl">
              <QrCode size={18} className="mr-2" />
              Scan Another
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}