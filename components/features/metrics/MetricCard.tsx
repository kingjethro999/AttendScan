import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  className?: string;
}

export function MetricCard({ label, value, icon: Icon, description, className }: MetricCardProps) {
  return (
    <Card className={cn("p-6 group hover:border-red-500/30 transition-all duration-300", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{label}</p>
          <p 
            className="text-3xl font-black tracking-tight mono-figure"
            style={{ color: 'var(--text-primary)' }}
          >
            {value}
          </p>
          {description && (
            <p className="text-xs text-[var(--text-secondary)]">{description}</p>
          )}
        </div>
        <div className="bg-red-500/10 p-3 rounded-2xl text-red-500 group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}