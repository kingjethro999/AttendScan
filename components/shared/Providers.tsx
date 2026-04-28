"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { useAppStore } from "@/store/use-app-store";

export function Providers({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen } = useAppStore();

  // Handle dark mode or other global settings here if needed
  
  return (
    <>
      <SessionProvider>
        {children}
      </SessionProvider>
      <Toaster 
        position="top-center" 
        richColors 
        closeButton
        toastOptions={{
          style: {
            borderRadius: '1rem',
            padding: '1rem',
          },
        }}
      />
    </>
  );
}
