"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, Globe, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { RoleSwitchButton } from "@/components/shared/role-switch-button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

// ── Types ──────────────────────────────────────────────────────────

interface TopBarProps {
  /** Render slot for the mobile hamburger trigger (passed from layout) */
  mobileMenuTrigger?: React.ReactNode;
  /** Show the search bar */
  showSearch?: boolean;
  /** Number of unread notifications */
  unreadCount?: number;
  /** User display name */
  userName?: string;
  /** User initials for avatar fallback */
  userInitials?: string;
  /** User avatar image URL */
  userAvatarUrl?: string;
  /** User role label */
  userRole?: string;
  /** Active role for switch button */
  activeRole?: "worker" | "employer";
  /** Link for profile navigation */
  profileHref?: string;
  className?: string;
}

// ── Language options ───────────────────────────────────────────────

const languages = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "ar", label: "العربية" },
] as const;

// ── Component ──────────────────────────────────────────────────────

export function TopBar({
  mobileMenuTrigger,
  showSearch = true,
  unreadCount = 0,
  userName = "Usuario",
  userInitials = "U",
  userAvatarUrl,
  userRole = "Worker",
  activeRole = "worker",
  profileHref = "/profile",
  className,
}: TopBarProps) {
  const t = useTranslations("common");

  const [currentLang, setCurrentLang] = useState<string>(() => {
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/NEXT_LOCALE=(\w+)/);
      return match ? match[1] : "es";
    }
    return "es";
  });

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-brand-100/50 bg-cream/80 px-4 backdrop-blur-md md:px-6",
        className
      )}
    >
      {/* Mobile menu trigger */}
      {mobileMenuTrigger && (
        <div className="md:hidden">{mobileMenuTrigger}</div>
      )}

      {/* Search */}
      {showSearch && (
        <div className="hidden flex-1 md:block md:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={`${t("actions.search")}...`}
              className="h-9 rounded-lg border-brand-100 bg-white pl-9 text-sm placeholder:text-muted-foreground/50 focus-visible:ring-brand-200"
            />
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1 md:flex-none" />

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="relative" />
            }
          >
            <motion.div
              animate={
                unreadCount > 0
                  ? {
                      rotate: [0, -8, 8, -6, 6, 0],
                    }
                  : {}
              }
              transition={{
                duration: 0.6,
                repeat: unreadCount > 0 ? Infinity : 0,
                repeatDelay: 4,
              }}
            >
              <Bell className="h-[18px] w-[18px] text-muted-foreground" />
            </motion.div>
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className="w-72">
            <DropdownMenuGroup>
              <DropdownMenuLabel>{t("nav.notifications")}</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              {t("empty.noNotifications")}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Language switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" />
            }
          >
            <Globe className="h-4 w-4" />
            <span className="hidden text-xs font-medium uppercase sm:inline">
              {currentLang}
            </span>
            <ChevronDown className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className="w-40">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => {
                  setCurrentLang(lang.code);
                  document.cookie = `NEXT_LOCALE=${lang.code};path=/;max-age=${60 * 60 * 24 * 365}`;
                  window.location.reload();
                }}
                className={cn(
                  lang.code === currentLang && "bg-brand-50 text-brand-700"
                )}
              >
                {lang.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Separator */}
        <div className="mx-1 hidden h-6 w-px bg-brand-100 sm:block" />

        {/* User avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-brand-50/60" />
            }
          >
            <Avatar size="sm">
              {userAvatarUrl && <AvatarImage src={userAvatarUrl} alt={userName} />}
              <AvatarFallback className="bg-brand-100 text-brand-700 text-[10px] font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-medium text-foreground">{userName}</p>
              <p className="text-[10px] text-muted-foreground">{userRole}</p>
            </div>
            <ChevronDown className="hidden h-3 w-3 text-muted-foreground sm:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">{userRole}</p>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <div className="px-1 py-1">
              <RoleSwitchButton activeRole={activeRole} />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                window.location.href = profileHref;
              }}
            >
              <User className="mr-2 h-4 w-4" />
              {t("nav.myProfile")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                window.location.href = profileHref;
              }}
            >
              <Settings className="mr-2 h-4 w-4" />
              {t("nav.settings")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={async () => {
                await fetch("/api/auth/signout", { method: "POST" });
                window.location.href = "/login";
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t("nav.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}
