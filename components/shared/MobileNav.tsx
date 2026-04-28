"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, QrCode, History, MoreHorizontal, X, LogOut, Settings, Calendar, BookOpen, Scan } from "lucide-react";
import { signOut } from "next-auth/react";

interface MobileNavProps {
  role?: "LECTURER" | "STUDENT";
  user?: {
    firstName: string;
    lastName: string;
  };
}

const studentPinnedItems = [
  { href: "/student/home", label: "Home", icon: Network },
  { href: "/student/scan", label: "Scan", icon: Scan },
  { href: "/student/history", label: "History", icon: History },
];

const lecturerPinnedItems = [
  { href: "/lecturer/home", label: "Home", icon: Network },
  { href: "/lecturer/courses", label: "Courses", icon: BookOpen },
  { href: "/lecturer/history", label: "History", icon: History },
];

export default function MobileNav({ role, user }: MobileNavProps) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  const isStudent = role === "STUDENT";
  const pinnedItems = isStudent ? studentPinnedItems : lecturerPinnedItems;

  const moreItems = [
    { href: `/${role?.toLowerCase()}/settings`, label: "Settings", icon: Settings },
  ];

  useEffect(() => {
    if (pathname !== prevPathname) {
      setPrevPathname(pathname);
      if (moreOpen) setMoreOpen(false);
    }
  }, [pathname, prevPathname, moreOpen]);

  const isMoreActive = moreItems.some((i) => pathname === i.href);

  return (
    <>
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMoreOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {moreOpen && (
          <motion.div
            key="drawer"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-16 left-0 right-0 z-50 bg-[var(--surface-800)] rounded-t-2xl shadow-2xl border-t border-[var(--surface-600)] px-4 pb-6 lg:hidden"
          >
            <div className="w-10 h-1 bg-[var(--surface-600)] rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-white">More</p>
              <button
                onClick={() => setMoreOpen(false)}
                aria-label="Close menu"
                className="w-7 h-7 flex items-center justify-center rounded-full bg-[var(--surface-700)]"
              >
                <X size={16} className="text-[var(--text-muted)]" />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              {moreItems.map(({ label, href, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link key={href} href={href}>
                    <div
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors cursor-pointer ${
                        isActive
                          ? "bg-red-500 text-white"
                          : "text-[var(--text-secondary)] hover:bg-[var(--surface-700)]"
                      }`}
                    >
                      <Icon size={20} className={isActive ? "text-white" : "text-[var(--text-muted)]"} />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                  </Link>
                );
              })}

              <div className="border-t border-[var(--surface-600)] mt-2 pt-2">
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <LogOut size={20} />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--surface-800)] border-t border-[var(--surface-600)] px-2"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-stretch justify-around py-1.5">
          {pinnedItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href);
            return (
              <Link key={href} href={href} className="flex-1">
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  transition={{ duration: 0.1 }}
                  className="flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl relative min-w-0"
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobileActive"
                      className="absolute inset-x-1 inset-y-0 bg-red-500/10 rounded-xl"
                      transition={{
                        type: "spring",
                        bounce: 0.25,
                        duration: 0.4,
                      }}
                    />
                  )}
                  <div className="relative z-10">
                    <Icon
                      size={22}
                      className={
                        isActive
                          ? "text-red-500"
                          : "text-[var(--text-muted)]"
                      }
                    />
                  </div>
                  <span
                    className={`relative z-10 text-[10px] font-semibold leading-none tracking-wide ${
                      isActive
                        ? "text-red-500"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    {label}
                  </span>
                </motion.div>
              </Link>
            );
          })}

          <motion.button
            whileTap={{ scale: 0.85 }}
            transition={{ duration: 0.1 }}
            onClick={() => setMoreOpen((v) => !v)}
            aria-label="More options"
            className="flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl relative min-w-0 cursor-pointer"
          >
            {(moreOpen || isMoreActive) && (
              <motion.div
                className="absolute inset-x-1 inset-y-0 bg-red-500/10 rounded-xl"
                transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
              />
            )}
            <div className="relative z-10">
              <MoreHorizontal
                size={22}
                className={
                  moreOpen || isMoreActive
                    ? "text-red-500"
                    : "text-[var(--text-muted)]"
                }
              />
            </div>
            <span
              className={`relative z-10 text-[10px] font-semibold leading-none tracking-wide ${
                moreOpen || isMoreActive
                  ? "text-red-500"
                  : "text-[var(--text-muted)]"
              }`}
            >
              More
            </span>
          </motion.button>
        </div>
      </nav>
    </>
  );
}