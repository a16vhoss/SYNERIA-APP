"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  WorkerDesktopSidebar,
  WorkerMobileSidebar,
} from "@/components/shared/worker-sidebar";
import { TopBar } from "@/components/shared/top-bar";
import { useProfile } from "@/hooks/useProfile";

const pageTransition = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
};

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { displayName, initials, roleLabel } = useProfile();

  return (
    <div className="min-h-screen bg-cream">
      {/* Sidebar */}
      <WorkerDesktopSidebar />

      {/* Main area offset by sidebar width */}
      <div className="md:pl-[260px]">
        {/* Top bar */}
        <TopBar
          mobileMenuTrigger={<WorkerMobileSidebar />}
          userName={displayName}
          userInitials={initials}
          userRole={roleLabel}
          unreadCount={0}
        />

        {/* Page content with animated transitions */}
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            {...pageTransition}
            className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
