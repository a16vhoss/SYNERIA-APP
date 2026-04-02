import {
  LayoutDashboard,
  Briefcase,
  FileText,
  User,
  Wallet,
  MessageSquare,
  Users,
  Building2,
  UserSearch,
  FileSignature,
  Settings,
  LogOut,
} from "lucide-react";

export const WORKER_NAV = [
  { label: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "searchJobs", href: "/jobs", icon: Briefcase },
  { label: "myApplications", href: "/applications", icon: FileText },
  { label: "network", href: "/network", icon: Users },
  { label: "wallet", href: "/wallet", icon: Wallet },
  { label: "myProfile", href: "/profile", icon: User },
  { label: "messages", href: "/messages", icon: MessageSquare },
] as const;

export const EMPLOYER_NAV = [
  { label: "dashboard", href: "/employer/dashboard", icon: LayoutDashboard },
  { label: "vacancies", href: "/employer/vacancies", icon: Briefcase },
  { label: "candidates", href: "/employer/candidates", icon: UserSearch },
  { label: "contracts", href: "/employer/contracts", icon: FileSignature },
  { label: "wallet", href: "/employer/wallet", icon: Wallet },
  {
    label: "company",
    href: "/employer/company-profile",
    icon: Building2,
  },
  { label: "messages", href: "/employer/messages", icon: MessageSquare },
] as const;

export const BOTTOM_NAV = [
  { label: "settings", href: "#config", icon: Settings },
  { label: "logout", href: "#logout", icon: LogOut },
] as const;
