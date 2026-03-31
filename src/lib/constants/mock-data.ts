import type { JobData } from "@/components/shared/job-card";

/* ------------------------------------------------------------------ */
/*  Mock Profile                                                       */
/* ------------------------------------------------------------------ */

export interface MockProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "worker" | "employer";
  city: string;
  country: string;
  avatarUrl?: string;
  profileCompletion: number; // 0-100
  desiredSectors: string[];
  desiredCountries: string[];
}

export const MOCK_PROFILE: MockProfile = {
  id: "usr_001",
  firstName: "Ana",
  lastName: "Socia",
  email: "ana.socia@email.com",
  role: "worker",
  city: "Bogota",
  country: "Peru",
  profileCompletion: 89,
  desiredSectors: ["Construccion", "Manufactura", "Electricidad"],
  desiredCountries: ["Chile", "Peru", "Colombia"],
};

/* ------------------------------------------------------------------ */
/*  Mock Jobs                                                          */
/* ------------------------------------------------------------------ */

export const MOCK_JOBS: JobData[] = [
  {
    id: "job_001",
    companyName: "Constructora Alpha S.A.",
    companyLetter: "C",
    companyGradient: "green",
    title: "Ayudante de Construccion General",
    location: "Santiago, Chile",
    salary: "$1,200/mes",
    tags: [
      { label: "Visa", variant: "visa" },
      { label: "Urgente", variant: "urgent" },
    ],
  },
  {
    id: "job_002",
    companyName: "Minera del Sur",
    companyLetter: "M",
    companyGradient: "orange",
    title: "Operador de Maquinaria Pesada",
    location: "Antofagasta, Chile",
    salary: "$4,000/mes",
    tags: [
      { label: "Alojamiento", variant: "housing" },
      { label: "Visa", variant: "visa" },
    ],
  },
  {
    id: "job_003",
    companyName: "Volta SA",
    companyLetter: "V",
    companyGradient: "purple",
    title: "Electricista Industrial",
    location: "Lima, Peru",
    salary: "$3,500/mes",
    tags: [{ label: "Visa", variant: "visa" }],
  },
  {
    id: "job_004",
    companyName: "AgroExport Ltda.",
    companyLetter: "A",
    companyGradient: "teal",
    title: "Supervisor de Produccion Agricola",
    location: "Medellin, Colombia",
    salary: "$2,800/mes",
    tags: [{ label: "Alojamiento", variant: "housing" }],
  },
  {
    id: "job_005",
    companyName: "PetroLatam",
    companyLetter: "P",
    companyGradient: "blue",
    title: "Soldador TIG/MIG Certificado",
    location: "Bogota, Colombia",
    salary: "$3,200/mes",
    tags: [
      { label: "Visa", variant: "visa" },
      { label: "Urgente", variant: "urgent" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Mock Stats                                                         */
/* ------------------------------------------------------------------ */

export interface MockStats {
  availableJobs: number;
  myApplications: number;
  notifications: number;
  profileCompletion: number;
}

export const MOCK_STATS: MockStats = {
  availableJobs: 48,
  myApplications: 5,
  notifications: 3,
  profileCompletion: 89,
};

/* ------------------------------------------------------------------ */
/*  Mock Notifications                                                 */
/* ------------------------------------------------------------------ */

export interface MockNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "application" | "interview" | "message" | "system";
}

export const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: "notif_001",
    title: "Aplicacion recibida",
    description:
      "Tu aplicacion a Constructora Alpha S.A. ha sido recibida exitosamente.",
    time: "Hace 2 horas",
    read: false,
    type: "application",
  },
  {
    id: "notif_002",
    title: "Entrevista programada",
    description:
      "Tienes una entrevista con Minera del Sur el 1 de abril a las 10:00 AM.",
    time: "Hace 5 horas",
    read: false,
    type: "interview",
  },
  {
    id: "notif_003",
    title: "Nuevo mensaje",
    description: "Volta SA te ha enviado un mensaje sobre tu aplicacion.",
    time: "Ayer",
    read: true,
    type: "message",
  },
];

/* ------------------------------------------------------------------ */
/*  Mock Applications                                                  */
/* ------------------------------------------------------------------ */

export interface MockApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  status: "pending" | "reviewing" | "interview" | "accepted" | "rejected";
  appliedAt: string;
}

export const MOCK_APPLICATIONS: MockApplication[] = [
  {
    id: "app_001",
    jobId: "job_001",
    jobTitle: "Ayudante de Construccion General",
    companyName: "Constructora Alpha S.A.",
    status: "reviewing",
    appliedAt: "2026-03-25",
  },
  {
    id: "app_002",
    jobId: "job_002",
    jobTitle: "Operador de Maquinaria Pesada",
    companyName: "Minera del Sur",
    status: "interview",
    appliedAt: "2026-03-22",
  },
  {
    id: "app_003",
    jobId: "job_003",
    jobTitle: "Electricista Industrial",
    companyName: "Volta SA",
    status: "pending",
    appliedAt: "2026-03-28",
  },
  {
    id: "app_004",
    jobId: "job_005",
    jobTitle: "Soldador TIG/MIG Certificado",
    companyName: "PetroLatam",
    status: "accepted",
    appliedAt: "2026-03-15",
  },
  {
    id: "app_005",
    jobId: "job_004",
    jobTitle: "Supervisor de Produccion Agricola",
    companyName: "AgroExport Ltda.",
    status: "rejected",
    appliedAt: "2026-03-10",
  },
];

/* ------------------------------------------------------------------ */
/*  Mock Interview (upcoming within 48h)                               */
/* ------------------------------------------------------------------ */

export interface MockInterview {
  id: string;
  companyName: string;
  jobTitle: string;
  date: string; // ISO
  time: string;
  type: "video" | "presencial" | "telefono";
}

export const MOCK_UPCOMING_INTERVIEW: MockInterview = {
  id: "int_001",
  companyName: "Minera del Sur",
  jobTitle: "Operador de Maquinaria Pesada",
  date: "2026-04-01",
  time: "10:00 AM",
  type: "video",
};

/* ------------------------------------------------------------------ */
/*  Employer Mock Data                                                 */
/* ------------------------------------------------------------------ */

export interface MockCompany {
  id: string;
  name: string;
  sector: string;
  logo_url: string | null;
  verified: boolean;
  country: string;
  city: string;
  description: string;
}

export interface MockVacancy {
  id: string;
  title: string;
  location: string;
  country: string;
  city: string;
  sector: string;
  contract_type: string;
  salary_min: number | null;
  salary_max: number | null;
  description: string;
  status: "active" | "paused" | "closed" | "draft";
  applications_count: number;
  published_at: string;
  company_id: string;
}

export interface MockCandidate {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  role_applied: string;
  vacancy_id: string;
  status: "pending" | "reviewing" | "interview" | "accepted" | "rejected";
  applied_at: string;
  rating: number;
}

export const MOCK_COMPANY: MockCompany = {
  id: "comp-001",
  name: "Tech Employer Test",
  sector: "Tecnologia",
  logo_url: null,
  verified: true,
  country: "ES",
  city: "Madrid",
  description:
    "Empresa lider en soluciones tecnologicas con presencia internacional.",
};

export const MOCK_VACANCIES: MockVacancy[] = [
  {
    id: "vac-001",
    title: "Asistente de Construcciones",
    location: "Zurich, Suiza",
    country: "CH",
    city: "Zurich",
    sector: "Construccion",
    contract_type: "full_time",
    salary_min: 3000,
    salary_max: 4500,
    description: "Buscamos asistente para proyectos de construccion en Zurich.",
    status: "active",
    applications_count: 4,
    published_at: "2026-03-28",
    company_id: "comp-001",
  },
  {
    id: "vac-002",
    title: "Operador de Maquinaria Pesada",
    location: "MUNICH, Alemania",
    country: "DE",
    city: "Munich",
    sector: "Construccion",
    contract_type: "full_time",
    salary_min: 3500,
    salary_max: 5000,
    description: "Operador de maquinaria pesada para obras civiles.",
    status: "active",
    applications_count: 6,
    published_at: "2026-03-25",
    company_id: "comp-001",
  },
  {
    id: "vac-003",
    title: "Electricista Industrial",
    location: "Paris, Francia",
    country: "FR",
    city: "Paris",
    sector: "Energia",
    contract_type: "full_time",
    salary_min: 2800,
    salary_max: 4200,
    description: "Electricista con experiencia en instalaciones industriales.",
    status: "paused",
    applications_count: 3,
    published_at: "2026-03-22",
    company_id: "comp-001",
  },
  {
    id: "vac-004",
    title: "Recepcionista de Hotel",
    location: "Barcelona, Espana",
    country: "ES",
    city: "Barcelona",
    sector: "Hoteleria y Turismo",
    contract_type: "full_time",
    salary_min: 1800,
    salary_max: 2400,
    description: "Recepcionista bilingue para hotel 5 estrellas en Barcelona.",
    status: "active",
    applications_count: 8,
    published_at: "2026-03-20",
    company_id: "comp-001",
  },
  {
    id: "vac-005",
    title: "Reportero Digital",
    location: "Stuttgart, Alemania",
    country: "DE",
    city: "Stuttgart",
    sector: "Tecnologia",
    contract_type: "contract",
    salary_min: 2500,
    salary_max: 3500,
    description: "Reportero para contenidos digitales en medios tecnologicos.",
    status: "active",
    applications_count: 4,
    published_at: "2026-03-18",
    company_id: "comp-001",
  },
  {
    id: "vac-006",
    title: "Tecnico en Automatizaciones",
    location: "Berlin, Alemania",
    country: "DE",
    city: "Berlin",
    sector: "Manufactura",
    contract_type: "full_time",
    salary_min: 3200,
    salary_max: 4800,
    description: "Tecnico especializado en automatizacion industrial.",
    status: "active",
    applications_count: 4,
    published_at: "2026-03-15",
    company_id: "comp-001",
  },
  {
    id: "vac-007",
    title: "Programador Fullstack Pasante",
    location: "Bergen, Noruega",
    country: "NO",
    city: "Bergen",
    sector: "Tecnologia",
    contract_type: "seasonal",
    salary_min: 2000,
    salary_max: 3000,
    description: "Pasantia en desarrollo fullstack con tecnologias modernas.",
    status: "active",
    applications_count: 5,
    published_at: "2026-03-12",
    company_id: "comp-001",
  },
  {
    id: "vac-008",
    title: "Gestor Certificado",
    location: "Estocolmo, Suecia",
    country: "SE",
    city: "Estocolmo",
    sector: "Comercio",
    contract_type: "full_time",
    salary_min: 2800,
    salary_max: 4000,
    description: "Gestor certificado para operaciones comerciales.",
    status: "active",
    applications_count: 3,
    published_at: "2026-03-10",
    company_id: "comp-001",
  },
];

export const MOCK_CANDIDATES: MockCandidate[] = [
  {
    id: "cand-001",
    name: "Carlos Martinez",
    email: "carlos@email.com",
    avatar_url: null,
    role_applied: "Asistente de Construcciones",
    vacancy_id: "vac-001",
    status: "interview",
    applied_at: "2026-03-29",
    rating: 4.2,
  },
  {
    id: "cand-002",
    name: "Maria Lopez",
    email: "maria@email.com",
    avatar_url: null,
    role_applied: "Recepcionista de Hotel",
    vacancy_id: "vac-004",
    status: "accepted",
    applied_at: "2026-03-21",
    rating: 4.8,
  },
  {
    id: "cand-003",
    name: "Juan Perez",
    email: "juan@email.com",
    avatar_url: null,
    role_applied: "Operador de Maquinaria Pesada",
    vacancy_id: "vac-002",
    status: "reviewing",
    applied_at: "2026-03-26",
    rating: 3.9,
  },
  {
    id: "cand-004",
    name: "Ana Garcia",
    email: "ana@email.com",
    avatar_url: null,
    role_applied: "Electricista Industrial",
    vacancy_id: "vac-003",
    status: "pending",
    applied_at: "2026-03-23",
    rating: 4.1,
  },
  {
    id: "cand-005",
    name: "Pedro Sanchez",
    email: "pedro@email.com",
    avatar_url: null,
    role_applied: "Tecnico en Automatizaciones",
    vacancy_id: "vac-006",
    status: "interview",
    applied_at: "2026-03-16",
    rating: 4.5,
  },
  {
    id: "cand-006",
    name: "Sofia Rodriguez",
    email: "sofia@email.com",
    avatar_url: null,
    role_applied: "Programador Fullstack Pasante",
    vacancy_id: "vac-007",
    status: "accepted",
    applied_at: "2026-03-13",
    rating: 4.7,
  },
  {
    id: "cand-007",
    name: "Luis Fernandez",
    email: "luis@email.com",
    avatar_url: null,
    role_applied: "Reportero Digital",
    vacancy_id: "vac-005",
    status: "reviewing",
    applied_at: "2026-03-19",
    rating: 3.8,
  },
  {
    id: "cand-008",
    name: "Elena Torres",
    email: "elena@email.com",
    avatar_url: null,
    role_applied: "Gestor Certificado",
    vacancy_id: "vac-008",
    status: "pending",
    applied_at: "2026-03-11",
    rating: 4.0,
  },
];

export function getMockEmployerStats() {
  return {
    activeVacancies: MOCK_VACANCIES.filter((v) => v.status === "active").length,
    totalCandidates: MOCK_CANDIDATES.length,
    inInterview: MOCK_CANDIDATES.filter((c) => c.status === "interview").length,
    accepted: MOCK_CANDIDATES.filter((c) => c.status === "accepted").length,
  };
}

/* ------------------------------------------------------------------ */
/*  Network – Connections                                              */
/* ------------------------------------------------------------------ */

export interface NetworkConnection {
  id: string;
  name: string;
  role: "worker" | "employer";
  company?: string;
  sector: string;
  country: string;
  city: string;
  avatarUrl?: string;
  avatarLetter: string;
  avatarGradient: "green" | "orange" | "purple" | "blue" | "red" | "teal";
  connectedSince: string;
  mutualConnections: number;
  skills: string[];
}

export const MOCK_CONNECTIONS: NetworkConnection[] = [
  {
    id: "conn_001",
    name: "Carlos Martinez",
    role: "worker",
    company: "Constructora Alpha S.A.",
    sector: "Construccion",
    country: "Chile",
    city: "Santiago",
    avatarLetter: "C",
    avatarGradient: "green",
    connectedSince: "2025-11-15",
    mutualConnections: 4,
    skills: ["Soldadura", "Plomeria", "Electricidad"],
  },
  {
    id: "conn_002",
    name: "Maria Lopez",
    role: "worker",
    sector: "Hoteleria y Turismo",
    country: "Peru",
    city: "Lima",
    avatarLetter: "M",
    avatarGradient: "purple",
    connectedSince: "2026-01-08",
    mutualConnections: 2,
    skills: ["Atencion al cliente", "Recepcion", "Idiomas"],
  },
  {
    id: "conn_003",
    name: "Constructora Alpha S.A.",
    role: "employer",
    sector: "Construccion",
    country: "Chile",
    city: "Santiago",
    avatarLetter: "C",
    avatarGradient: "green",
    connectedSince: "2025-12-01",
    mutualConnections: 6,
    skills: [],
  },
  {
    id: "conn_004",
    name: "Pedro Sanchez",
    role: "worker",
    company: "Minera del Sur",
    sector: "Mineria",
    country: "Colombia",
    city: "Bogota",
    avatarLetter: "P",
    avatarGradient: "orange",
    connectedSince: "2026-02-20",
    mutualConnections: 1,
    skills: ["Maquinaria Pesada", "Seguridad Industrial", "Logistica"],
  },
  {
    id: "conn_005",
    name: "Sofia Rodriguez",
    role: "worker",
    sector: "Tecnologia",
    country: "Peru",
    city: "Lima",
    avatarLetter: "S",
    avatarGradient: "blue",
    connectedSince: "2026-03-05",
    mutualConnections: 3,
    skills: ["Programacion", "Diseno UX", "Base de datos"],
  },
  {
    id: "conn_006",
    name: "Minera del Sur",
    role: "employer",
    sector: "Mineria",
    country: "Chile",
    city: "Antofagasta",
    avatarLetter: "M",
    avatarGradient: "orange",
    connectedSince: "2026-01-25",
    mutualConnections: 5,
    skills: [],
  },
  {
    id: "conn_007",
    name: "Elena Torres",
    role: "worker",
    company: "Volta SA",
    sector: "Energia",
    country: "Colombia",
    city: "Medellin",
    avatarLetter: "E",
    avatarGradient: "teal",
    connectedSince: "2026-03-12",
    mutualConnections: 2,
    skills: ["Electricidad Industrial", "Automatizacion", "PLC"],
  },
];

/* ------------------------------------------------------------------ */
/*  Network – Suggestions                                              */
/* ------------------------------------------------------------------ */

export interface NetworkSuggestion {
  id: string;
  name: string;
  country: string;
  city: string;
  avatarLetter: string;
  avatarGradient: "green" | "orange" | "purple" | "blue" | "red" | "teal";
  skills: string[];
  reason: "same_company" | "same_country" | "same_sector" | "mutual_connections";
  reasonDetail?: string;
  mutualConnections?: number;
}

export const MOCK_SUGGESTIONS: NetworkSuggestion[] = [
  {
    id: "sug_001",
    name: "Luis Fernandez",
    country: "Chile",
    city: "Valparaiso",
    avatarLetter: "L",
    avatarGradient: "red",
    skills: ["Construccion", "Concreto", "Carpinteria"],
    reason: "same_sector",
    reasonDetail: "Construccion",
  },
  {
    id: "sug_002",
    name: "Ana Garcia",
    country: "Peru",
    city: "Lima",
    avatarLetter: "A",
    avatarGradient: "purple",
    skills: ["Electricidad", "Mantenimiento", "Seguridad"],
    reason: "same_country",
  },
  {
    id: "sug_003",
    name: "Jorge Ramirez",
    country: "Colombia",
    city: "Bogota",
    avatarLetter: "J",
    avatarGradient: "blue",
    skills: ["Operador Grua", "Logistica", "Transporte"],
    reason: "mutual_connections",
    mutualConnections: 5,
  },
  {
    id: "sug_004",
    name: "Roberto Diaz",
    country: "Chile",
    city: "Santiago",
    avatarLetter: "R",
    avatarGradient: "green",
    skills: ["Soldadura TIG", "Metalurgia", "Control de Calidad"],
    reason: "same_company",
    reasonDetail: "Constructora Alpha S.A.",
  },
  {
    id: "sug_005",
    name: "Valentina Morales",
    country: "Peru",
    city: "Arequipa",
    avatarLetter: "V",
    avatarGradient: "teal",
    skills: ["Administracion", "Recursos Humanos", "Nomina"],
    reason: "same_country",
  },
  {
    id: "sug_006",
    name: "AgroExport Ltda.",
    country: "Colombia",
    city: "Medellin",
    avatarLetter: "A",
    avatarGradient: "teal",
    skills: [],
    reason: "mutual_connections",
    mutualConnections: 3,
  },
];

/* ------------------------------------------------------------------ */
/*  Network – Requests                                                 */
/* ------------------------------------------------------------------ */

export interface NetworkRequest {
  id: string;
  name: string;
  avatarLetter: string;
  avatarGradient: "green" | "orange" | "purple" | "blue" | "red" | "teal";
  message?: string;
  direction: "incoming" | "outgoing";
  sentAt: string;
}

export const MOCK_REQUESTS: NetworkRequest[] = [
  {
    id: "req_001",
    name: "Fernando Gutierrez",
    avatarLetter: "F",
    avatarGradient: "orange",
    message: "Hola, trabajo en el mismo sector y me gustaria conectar contigo.",
    direction: "incoming",
    sentAt: "2026-03-28",
  },
  {
    id: "req_002",
    name: "Camila Herrera",
    avatarLetter: "C",
    avatarGradient: "purple",
    message: "Vi tu perfil y creo que podemos colaborar en proyectos futuros.",
    direction: "incoming",
    sentAt: "2026-03-26",
  },
  {
    id: "req_003",
    name: "PetroLatam",
    avatarLetter: "P",
    avatarGradient: "blue",
    direction: "outgoing",
    sentAt: "2026-03-25",
  },
];

/* ------------------------------------------------------------------ */
/*  Network – Activity Feed                                            */
/* ------------------------------------------------------------------ */

export interface NetworkActivity {
  id: string;
  actorName: string;
  actorLetter: string;
  actorGradient: "green" | "orange" | "purple" | "blue" | "red" | "teal";
  type: "new_job" | "completed_contract" | "endorsement" | "new_connection";
  text: string;
  time: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export const MOCK_NETWORK_ACTIVITY: NetworkActivity[] = [
  {
    id: "act_001",
    actorName: "Constructora Alpha S.A.",
    actorLetter: "C",
    actorGradient: "green",
    type: "new_job",
    text: "publico una nueva vacante: Supervisor de Obra",
    time: "Hace 2 horas",
    ctaLabel: "Ver vacante",
    ctaHref: "/jobs",
  },
  {
    id: "act_002",
    actorName: "Carlos Martinez",
    actorLetter: "C",
    actorGradient: "green",
    type: "completed_contract",
    text: "completo un contrato con Minera del Sur",
    time: "Hace 5 horas",
  },
  {
    id: "act_003",
    actorName: "Sofia Rodriguez",
    actorLetter: "S",
    actorGradient: "blue",
    type: "endorsement",
    text: "recibio una recomendacion en Programacion",
    time: "Hace 1 dia",
  },
  {
    id: "act_004",
    actorName: "Pedro Sanchez",
    actorLetter: "P",
    actorGradient: "orange",
    type: "new_connection",
    text: "se conecto con Elena Torres",
    time: "Hace 2 dias",
  },
  {
    id: "act_005",
    actorName: "Minera del Sur",
    actorLetter: "M",
    actorGradient: "orange",
    type: "new_job",
    text: "publico una nueva vacante: Geologo de Campo",
    time: "Hace 3 dias",
    ctaLabel: "Ver vacante",
    ctaHref: "/jobs",
  },
];

/* ------------------------------------------------------------------ */
/*  Network – Endorsements                                             */
/* ------------------------------------------------------------------ */

export interface SkillEndorsement {
  skillName: string;
  count: number;
  endorsers: Array<{
    name: string;
    avatarLetter: string;
    avatarGradient: "green" | "orange" | "purple" | "blue" | "red" | "teal";
  }>;
}

export const MOCK_ENDORSEMENTS: SkillEndorsement[] = [
  {
    skillName: "Electricidad Industrial",
    count: 8,
    endorsers: [
      { name: "Carlos Martinez", avatarLetter: "C", avatarGradient: "green" },
      { name: "Pedro Sanchez", avatarLetter: "P", avatarGradient: "orange" },
      { name: "Elena Torres", avatarLetter: "E", avatarGradient: "teal" },
    ],
  },
  {
    skillName: "Soldadura TIG",
    count: 5,
    endorsers: [
      { name: "Maria Lopez", avatarLetter: "M", avatarGradient: "purple" },
      { name: "Sofia Rodriguez", avatarLetter: "S", avatarGradient: "blue" },
    ],
  },
  {
    skillName: "Seguridad Industrial",
    count: 4,
    endorsers: [
      { name: "Carlos Martinez", avatarLetter: "C", avatarGradient: "green" },
      { name: "Elena Torres", avatarLetter: "E", avatarGradient: "teal" },
    ],
  },
  {
    skillName: "Plomeria",
    count: 3,
    endorsers: [
      { name: "Pedro Sanchez", avatarLetter: "P", avatarGradient: "orange" },
    ],
  },
  {
    skillName: "Lectura de Planos",
    count: 2,
    endorsers: [
      { name: "Sofia Rodriguez", avatarLetter: "S", avatarGradient: "blue" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Reviews / Ratings                                                  */
/* ------------------------------------------------------------------ */

export type ReviewTag =
  | "Puntual"
  | "Profesional"
  | "Buen comunicador"
  | "Responsable"
  | "Eficiente"
  | "Amable"
  | "Organizado"
  | "Lider"
  | "Confiable"
  | "Buen ambiente";

export const ALL_REVIEW_TAGS: ReviewTag[] = [
  "Puntual",
  "Profesional",
  "Buen comunicador",
  "Responsable",
  "Eficiente",
  "Amable",
  "Organizado",
  "Lider",
  "Confiable",
  "Buen ambiente",
];

export interface MockReview {
  id: string;
  reviewerName: string;
  reviewerLetter: string;
  reviewerGradient: "green" | "orange" | "purple" | "blue" | "red" | "teal";
  rating: number;
  tags: ReviewTag[];
  comment: string;
  contractPosition: string;
  createdAt: string;
}

export const MOCK_REVIEWS: MockReview[] = [
  {
    id: "rev_001",
    reviewerName: "Constructora Alpha S.A.",
    reviewerLetter: "C",
    reviewerGradient: "green",
    rating: 5,
    tags: ["Puntual", "Profesional", "Responsable", "Eficiente"],
    comment:
      "Excelente trabajador. Siempre llego a tiempo y completo sus tareas con gran calidad. Lo recomiendo ampliamente para cualquier proyecto de construccion.",
    contractPosition: "Ayudante de Construccion General",
    createdAt: "2026-03-20",
  },
  {
    id: "rev_002",
    reviewerName: "Minera del Sur",
    reviewerLetter: "M",
    reviewerGradient: "orange",
    rating: 4,
    tags: ["Profesional", "Confiable", "Buen comunicador"],
    comment:
      "Muy buen desempeno durante el contrato. Buena comunicacion con el equipo y cumplio con los objetivos establecidos.",
    contractPosition: "Operador de Maquinaria Pesada",
    createdAt: "2026-03-15",
  },
  {
    id: "rev_003",
    reviewerName: "Carlos Martinez",
    reviewerLetter: "C",
    reviewerGradient: "green",
    rating: 5,
    tags: ["Amable", "Buen ambiente", "Organizado", "Lider"],
    comment:
      "Constructora Alpha es una empresa que se preocupa por sus trabajadores. El ambiente laboral es excelente y los proyectos son muy interesantes.",
    contractPosition: "Ayudante de Construccion General",
    createdAt: "2026-03-18",
  },
  {
    id: "rev_004",
    reviewerName: "Volta SA",
    reviewerLetter: "V",
    reviewerGradient: "purple",
    rating: 3,
    tags: ["Puntual", "Responsable"],
    comment:
      "Cumplio con el contrato de manera satisfactoria. Podria mejorar en la comunicacion con el equipo tecnico.",
    contractPosition: "Electricista Industrial",
    createdAt: "2026-02-28",
  },
  {
    id: "rev_005",
    reviewerName: "Pedro Sanchez",
    reviewerLetter: "P",
    reviewerGradient: "orange",
    rating: 4,
    tags: ["Profesional", "Eficiente", "Confiable"],
    comment:
      "Minera del Sur ofrece buenas condiciones de trabajo y cumple con lo pactado en el contrato. El alojamiento proporcionado fue adecuado.",
    contractPosition: "Operador de Maquinaria Pesada",
    createdAt: "2026-03-10",
  },
  {
    id: "rev_006",
    reviewerName: "Sofia Rodriguez",
    reviewerLetter: "S",
    reviewerGradient: "blue",
    rating: 5,
    tags: ["Buen comunicador", "Organizado", "Amable", "Lider", "Buen ambiente"],
    comment:
      "Increible experiencia trabajando aqui. El equipo es muy profesional y el liderazgo es inspirador. Sin duda volveria a trabajar con ellos.",
    contractPosition: "Programador Fullstack Pasante",
    createdAt: "2026-03-22",
  },
  {
    id: "rev_007",
    reviewerName: "AgroExport Ltda.",
    reviewerLetter: "A",
    reviewerGradient: "teal",
    rating: 4,
    tags: ["Puntual", "Responsable", "Eficiente"],
    comment:
      "Trabajador dedicado y comprometido. Manejo bien las responsabilidades asignadas durante toda la temporada.",
    contractPosition: "Supervisor de Produccion Agricola",
    createdAt: "2026-02-15",
  },
  {
    id: "rev_008",
    reviewerName: "Elena Torres",
    reviewerLetter: "E",
    reviewerGradient: "teal",
    rating: 2,
    tags: ["Puntual"],
    comment:
      "La experiencia no fue la mejor. Hubo varios retrasos en los pagos y la comunicacion con la empresa fue deficiente.",
    contractPosition: "Tecnico en Automatizaciones",
    createdAt: "2026-01-20",
  },
];

export interface PendingReview {
  id: string;
  contractId: string;
  contractPosition: string;
  counterpartyName: string;
  counterpartyLetter: string;
  counterpartyGradient: "green" | "orange" | "purple" | "blue" | "red" | "teal";
  completedAt: string;
}

export const MOCK_PENDING_REVIEWS: PendingReview[] = [
  {
    id: "prev_001",
    contractId: "contract_001",
    contractPosition: "Soldador TIG/MIG Certificado",
    counterpartyName: "PetroLatam",
    counterpartyLetter: "P",
    counterpartyGradient: "blue",
    completedAt: "2026-03-28",
  },
];
