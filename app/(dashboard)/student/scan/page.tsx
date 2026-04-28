import { QRScanner } from "@/components/features/qr/QRScanner";
import { QrCode } from "lucide-react";

export default function StudentScanPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="bg-primary/10 p-3 rounded-2xl text-primary mb-2">
          <QrCode size={32} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">QR Scanner</h1>
        <p className="text-muted-foreground max-w-md">
          Position the QR code within the frame to mark your attendance automatically.
        </p>
      </div>

      <QRScanner />

      <div className="p-6 bg-secondary/30 rounded-3xl border border-border/50">
        <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Tips for scanning</h4>
        <ul className="space-y-3 text-sm">
          <li className="flex items-start gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px] font-bold">1</span>
            <span>Ensure you have a stable internet connection.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px] font-bold">2</span>
            <span>Avoid glare and ensure the code is well-lit.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px] font-bold">3</span>
            <span>Keep the phone steady until the success message appears.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
