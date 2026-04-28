import { QRScanner } from "@/components/features/qr/QRScanner";
import { QrCode } from "lucide-react";

export default function StudentScanPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="bg-red-500/10 p-3 rounded-2xl text-red-500 mb-2">
          <QrCode size={32} />
        </div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">QR Scanner</h1>
        <p className="text-[var(--text-secondary)] max-w-md">
          Position the QR code within the frame to mark your attendance automatically.
        </p>
      </div>

      <QRScanner />

      <div className="p-6 bg-[var(--surface-800)] rounded-3xl border border-[var(--surface-600)]">
        <h4 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">Tips for scanning</h4>
        <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
          <li className="flex items-start gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold">1</span>
            <span>Ensure you have a stable internet connection.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold">2</span>
            <span>Avoid glare and ensure the code is well-lit.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold">3</span>
            <span>Keep the phone steady until the success message appears.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}