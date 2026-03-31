"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileSignature,
  Wallet,
  UserCircle,
  Building2,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";

// ── Navigation config ──────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const principalItems: NavItem[] = [
  { label: "Dashboard", href: "/employer/dashboard", icon: LayoutDashboard },
  { label: "Mis Vacantes", href: "/employer/vacancies", icon: Briefcase, badge: 0 },
  { label: "Candidatos", href: "/employer/candidates", icon: Users, badge: 0 },
  { label: "Contratos", href: "/employer/contracts", icon: FileSignature },
  { label: "Wallet", href: "/employer/wallet", icon: Wallet },
  { label: "Mi Perfil", href: "/employer/profile", icon: UserCircle },
  { label: "Perfil Empresa", href: "/employer/company-profile", icon: Building2 },
  { label: "Mensajes", href: "/employer/messages", icon: MessageSquare, badge: 0 },
];

const supportItems: NavItem[] = [
  { label: "Configuracion", href: "/employer/profile?tab=configuracion", icon: Settings },
];

// ── Animations ─────────────────────────────────────────────────────

const sidebarVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// ── Single nav item ────────────────────────────────────────────────

function SidebarNavItem({
  item,
  isActive,
}: {
  item: NavItem;
  isActive: boolean;
}) {
  const Icon = item.icon;

  return (
    <motion.div variants={itemVariants} className="relative">
      <Link href={item.href} className="block">
        <motion.div
          whileHover={{ scale: 1.02, x: 2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            isActive
              ? "bg-brand-100/80 text-brand-700"
              : "text-muted-foreground hover:bg-brand-50/60 hover:text-foreground"
          )}
        >
          {/* Active indicator bar */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                layoutId="employer-active-indicator"
                className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-brand-600"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                exit={{ scaleY: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
              />
            )}
          </AnimatePresence>

          <Icon
            className={cn(
              "h-[18px] w-[18px] shrink-0 transition-colors",
              isActive ? "text-brand-600" : "text-muted-foreground group-hover:text-foreground"
            )}
          />
          <span className="truncate">{item.label}</span>

          {/* Notification badge */}
          {item.badge !== undefined && item.badge > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-semibold text-white"
            >
              {item.badge > 99 ? "99+" : item.badge}
            </motion.span>
          )}
        </motion.div>
      </Link>
    </motion.div>
  );
}

// ── Sidebar content (shared between desktop & mobile) ──────────────

function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();
  const { displayName, initials, roleLabel } = useProfile();

  const isActive = (href: string) => {
    const hrefPath = href.split("?")[0];
    if (hrefPath === "/employer/dashboard") return pathname === "/employer/dashboard";
    return pathname.startsWith(hrefPath);
  };

  return (
    <div className="flex h-full flex-col bg-cream">
      {/* Logo */}
      <div className="flex h-16 items-center px-5">
        <Logo size="md" />
      </div>

      {/* Navigation */}
      <motion.nav
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-4"
      >
        {/* PRINCIPAL section */}
        <motion.p
          variants={itemVariants}
          className="mb-1 mt-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60"
        >
          Principal
        </motion.p>
        {principalItems.map((item) => (
          <div key={item.href} onClick={onItemClick}>
            <SidebarNavItem item={item} isActive={isActive(item.href)} />
          </div>
        ))}

        {/* SOPORTE section */}
        <motion.p
          variants={itemVariants}
          className="mb-1 mt-6 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60"
        >
          Soporte
        </motion.p>
        {supportItems.map((item) => (
          <div key={item.href} onClick={onItemClick}>
            <SidebarNavItem item={item} isActive={isActive(item.href)} />
          </div>
        ))}

        {/* Cerrar Sesion */}
        <motion.div variants={itemVariants}>
          <button
            onClick={() => {
              window.location.href = "/login";
            }}
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            <span>Cerrar Sesion</span>
          </button>
        </motion.div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Premium badge */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          className="mx-1 mt-4 cursor-pointer rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50 to-cream p-3"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <Crown className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-brand-700">
                Syneria Premium
              </p>
              <p className="text-[10px] text-muted-foreground">
                Desbloquea todo
              </p>
            </div>
          </div>
        </motion.div>
      </motion.nav>

      {/* User section */}
      <div className="border-t border-brand-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar size="default">
            <AvatarImage src="" alt="Empresa" />
            <AvatarFallback className="bg-brand-100 text-brand-700 text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {displayName}
            </p>
            <p className="truncate text-xs text-muted-foreground">{roleLabel}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Desktop sidebar ────────────────────────────────────────────────

function DesktopSidebar() {
  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-y-0 left-0 z-30 hidden w-[260px] border-r border-brand-100/50 shadow-sidebar md:block"
      style={{ boxShadow: "var(--shadow-sidebar)" }}
    >
      <SidebarContent />
    </motion.aside>
  );
}

// ── Mobile sidebar (Sheet) ─────────────────────────────────────────

function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
          />
        }
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0" showCloseButton={false}>
        <SheetTitle className="sr-only">Menu de navegacion</SheetTitle>
        <SidebarContent onItemClick={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

// ── Exports ────────────────────────────────────────────────────────

export { DesktopSidebar as EmployerDesktopSidebar, MobileSidebar as EmployerMobileSidebar };
