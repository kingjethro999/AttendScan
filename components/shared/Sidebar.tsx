"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  Clock, 
  QrCode, 
  LogOut,
  User as UserIcon,
  Settings,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

interface SidebarProps {
  role: "LECTURER" | "STUDENT";
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export function Sidebar({ role, user }: SidebarProps) {
  const pathname = usePathname();

  const lecturerItems: SidebarItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/lecturer/home" },
    { icon: BookOpen, label: "My Courses", href: "/lecturer/courses" },
    { icon: History, label: "History", href: "/lecturer/history" },
    { icon: Settings, label: "Settings", href: "/lecturer/settings" },
  ];

  const studentItems: SidebarItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/student/home" },
    { icon: QrCode, label: "Scan QR", href: "/student/scan" },
    { icon: History, label: "History", href: "/student/history" },
    { icon: Settings, label: "Settings", href: "/student/settings" },
  ];

  const items = role === "LECTURER" ? lecturerItems : studentItems;

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-[var(--surface-800)] border-r border-[var(--surface-600)] flex-col z-50">
      <div className="flex items-center gap-3 px-6 py-8">
        <h1 className="text-white text-lg font-black tracking-tighter">ATTENDSCAN</h1>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-thin">
        {items.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200",
                isActive 
                  ? "sidebar-item-active shadow-lg shadow-black/10" 
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-700)] hover:text-white"
              )}
            >
              <span className={isActive ? "text-[var(--red-500)]" : "text-[var(--text-muted)]"}>
                <link.icon size={20} />
              </span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--surface-600)]">
        <div className="mb-3 flex flex-col items-center justify-center py-3 px-3 rounded-xl border border-white/5 bg-black/20 text-center font-bold tracking-tight">
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1">{role === 'LECTURER' ? 'Lecturer' : 'Student'}</p>
          <span className="text-xs text-white">{user.firstName} {user.lastName}</span>
        </div>
        <button 
          onClick={() => signOut()} 
          className="flex items-center justify-center gap-2 w-full py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--color-danger)] transition-colors font-medium"
        >
          <LogOut size={16} /> Disconnect
        </button>
      </div>
    </aside>
  );
}