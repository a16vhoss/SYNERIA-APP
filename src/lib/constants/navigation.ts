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
  { label: "Panel", href: "/dashboard", icon: LayoutDashboard },
  { label: "Buscar Empleos", href: "/jobs", icon: Briefcase },
  { label: "Mis Aplicaciones", href: "/applications", icon: FileText },
  { label: "Red", href: "/network", icon: Users },
  { label: "Wallet", href: "/wallet", icon: Wallet },
  { label: "Mi Perfil", href: "/profile", icon: User },
  { label: "Mensajes", href: "/messages", icon: MessageSquare },
] as const;

export const EMPLOYER_NAV = [
  { label: "Dashboard", href: "/employer/dashboard", icon: LayoutDashboard },
  { label: "Mis Vacantes", href: "/employer/vacancies", icon: Briefcase },
  { label: "Candidatos", href: "/employer/candidates", icon: UserSearch },
  { label: "Contratos", href: "/employer/contracts", icon: FileSignature },
  { label: "Wallet", href: "/employer/wallet", icon: Wallet },
  {
    label: "Empresa Perfil",
    href: "/employer/company-profile",
    icon: Building2,
  },
  { label: "Mensajes", href: "/employer/messages", icon: MessageSquare },
] as const;

export const BOTTOM_NAV = [
  { label: "Configuracion", href: "#config", icon: Settings },
  { label: "Cerrar Sesion", href: "#logout", icon: LogOut },
] as const;
