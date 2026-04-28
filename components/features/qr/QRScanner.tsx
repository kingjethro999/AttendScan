"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { logger, cn } from "@/lib/utils";
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Camera, 
  RefreshCw,
  QrCode
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface QRScannerProps {
  onSuccess?: (courseName: string, timestamp: Date) => void;
}

export function QRScanner({ onSuccess }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    courseName?: string;
    timestamp?: Date;
    message?: string;
  } | null>(null);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isScanning && !scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
        },
        false
      );

      scanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => logger.error("Scanner clear error", e));
        scannerRef.current = null;
      }
    };
  }, [isScanning]);

  const onScanSuccess = async (decodedText: string) => {
    // Expected format: https://.../attend?token=UUID
    try {
      const url = new URL(decodedText);
      const token = url.searchParams.get("token");

      if (!token) {
        toast.error("Invalid QR code format");
        return;
      }

      // Stop scanning
      if (scannerRef.current) {
        await scannerRef.current.clear();
        scannerRef.current = null;
        setIsScanning(false);
      }

      submitAttendance(token);
    } catch (e) {
      logger.error("Scan processing error", e);
    }
  };

  const onScanFailure = (error: any) => {
    // Silently handle scan failures (common when no QR is in frame)
  };

  const submitAttendance = async (token: string) => {
    setIsLoading(true);
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
    setIsScanning(true);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {!isScanning && !isLoading && !result ? (
        <Card className="p-10 flex flex-col items-center text-center space-y-6 border-dashed border-2 bg-primary/5">
          <div className="bg-primary/20 p-6 rounded-full text-primary">
            <Camera size={48} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Start Scanning</h3>
            <p className="text-muted-foreground text-sm">
              Allow camera access to scan the attendance QR code.
            </p>
          </div>
          <Button onClick={() => setIsScanning(true)} className="w-full rounded-2xl h-14 text-lg">
            Activate Camera
          </Button>
        </Card>
      ) : null}

      <div className={cn("overflow-hidden rounded-3xl bg-black shadow-2xl relative", !isScanning && "hidden")}>
        <div id="qr-reader" className="w-full" />
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => setIsScanning(false)}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full opacity-70 hover:opacity-100"
        >
          Cancel
        </Button>
      </div>

      {isLoading && (
        <Card className="p-12 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="font-semibold text-lg">Validating Token...</p>
        </Card>
      )}

      {result && (
        <Card className={cn(
          "p-8 text-center animate-in zoom-in-95 duration-300",
          result.success ? "border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/10" : "border-destructive/20 bg-destructive/5"
        )}>
          <div className="flex flex-col items-center space-y-6">
            <div className={cn(
              "p-4 rounded-full",
              result.success ? "bg-emerald-100 text-emerald-600" : "bg-destructive/10 text-destructive"
            )}>
              {result.success ? <CheckCircle size={48} /> : <XCircle size={48} />}
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold">
                {result.success ? "Success!" : "Scan Failed"}
              </h3>
              <p className={cn(
                "text-lg font-medium",
                result.success ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"
              )}>
                {result.message}
              </p>
            </div>

            {result.success && (
              <div className="w-full bg-background p-4 rounded-2xl border border-border/50 space-y-1">
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Course</p>
                <p className="text-xl font-bold">{result.courseName}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Recorded at {format(result.timestamp!, "HH:mm:ss, MMM d, yyyy")}
                </p>
              </div>
            )}

            <Button onClick={reset} variant="outline" className="w-full rounded-xl">
              <RefreshCw size={18} className="mr-2" />
              Scan Another
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
