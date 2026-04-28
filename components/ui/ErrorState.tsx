import * as React from "react";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import { Button } from "./Button";
import { Card } from "./Card";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
  showHome?: boolean;
}

export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred while processing your request.",
  onRetry,
  className,
  showHome = true,
}: ErrorStateProps) {
  return (
    <div className={cn("flex min-h-[400px] w-full items-center justify-center p-4", className)}>
      <Card className="max-w-md w-full text-center p-8 border-destructive/20 bg-destructive/5">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive animate-pulse-slow">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <Button variant="primary" onClick={onRetry} className="w-full sm:w-auto">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
          {showHome && (
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Link>
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
