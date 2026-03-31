"use server";

/* ------------------------------------------------------------------ */
/*  Contract Types                                                     */
/* ------------------------------------------------------------------ */

export type ContractStatus =
  | "pendiente"
  | "activo"
  | "completado"
  | "expirado"
  | "cancelado"
  | "cancelacion_solicitada"
  | "en_disputa";

export interface ContractData {
  id: string;
  worker_id: string;
  worker_name: string;
  employer_id: string;
  company_name: string;
  company_letter: string;
  company_gradient: "green" | "orange" | "purple" | "blue" | "red" | "teal";
  position: string;
  country: string;
  city: string;
  salary: number;
  currency: string;
  start_date: string;
  end_date: string;
  status: ContractStatus;
  terms: string;
  benefits: string[];
  visa_sponsorship: boolean;
  work_schedule: string;
  signature_worker?: string;
  signature_employer?: string;
  blockchain_hash?: string;
  signed_at?: string;
  cancellation_reason?: string;
  cancellation_requested_by?: "worker" | "employer";
  parent_contract_id?: string;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/*  Mock Contract Data                                                 */
/* ------------------------------------------------------------------ */

const MOCK_CONTRACTS: ContractData[] = [
  {
    id: "contract_001",
    worker_id: "usr_001",
    worker_name: "Ana Socia",
    employer_id: "comp-001",
    company_name: "Constructora Alpha S.A.",
    company_letter: "C",
    company_gradient: "green",
    position: "Ayudante de Construccion General",
    country: "Chile",
    city: "Santiago",
    salary: 1200,
    currency: "USD",
    start_date: "2026-01-15",
    end_date: "2026-07-15",
    status: "activo",
    terms:
      "El trabajador se compromete a cumplir con las normas de seguridad establecidas. Jornada laboral de 45 horas semanales. Se proporcionara equipo de proteccion personal. El contrato incluye periodo de prueba de 30 dias. Vacaciones segun legislacion vigente del pais de destino.",
    benefits: ["Alojamiento", "Seguro Medico", "Transporte"],
    visa_sponsorship: true,
    work_schedule: "Lunes a Viernes, 8:00 - 17:00",
    signature_worker: "signed",
    signature_employer: "signed",
    blockchain_hash: "0x7a3f...b2c1e8d4",
    signed_at: "2026-01-10",
    created_at: "2026-01-05",
  },
  {
    id: "contract_002",
    worker_id: "usr_001",
    worker_name: "Ana Socia",
    employer_id: "comp-002",
    company_name: "Hotel Mediterraneo",
    company_letter: "H",
    company_gradient: "blue",
    position: "Recepcionista de Hotel",
    country: "Espana",
    city: "Barcelona",
    salary: 1800,
    currency: "EUR",
    start_date: "2025-06-01",
    end_date: "2025-12-31",
    status: "completado",
    terms:
      "Contrato temporal de 6 meses. Horario rotativo. Se requiere nivel B2 de espanol. Incluye formacion inicial de 2 semanas. Evaluacion de desempeno trimestral.",
    benefits: ["Seguro Medico", "Comida"],
    visa_sponsorship: true,
    work_schedule: "Turnos rotativos",
    signature_worker: "signed",
    signature_employer: "signed",
    blockchain_hash: "0x4e2a...f9d3c7a1",
    signed_at: "2025-05-25",
    created_at: "2025-05-20",
  },
  {
    id: "contract_003",
    worker_id: "usr_001",
    worker_name: "Ana Socia",
    employer_id: "comp-003",
    company_name: "Finca Stuttgart",
    company_letter: "F",
    company_gradient: "orange",
    position: "Asistente Agricola",
    country: "Alemania",
    city: "Stuttgart",
    salary: 2200,
    currency: "EUR",
    start_date: "2026-04-01",
    end_date: "2026-10-01",
    status: "pendiente",
    terms:
      "Trabajo agricola de temporada. Alojamiento proporcionado en la finca. Seguro medico incluido. Transporte desde la ciudad mas cercana. Herramientas y equipo proporcionado por el empleador.",
    benefits: ["Alojamiento", "Seguro Medico", "Herramientas", "Transporte"],
    visa_sponsorship: true,
    work_schedule: "Lunes a Sabado, 7:00 - 15:00",
    created_at: "2026-03-20",
  },
  {
    id: "contract_004",
    worker_id: "usr_002",
    worker_name: "Carlos Martinez",
    employer_id: "comp-001",
    company_name: "Constructora Alpha S.A.",
    company_letter: "C",
    company_gradient: "green",
    position: "Asistente de Construcciones",
    country: "Suiza",
    city: "Zurich",
    salary: 3500,
    currency: "CHF",
    start_date: "2026-04-15",
    end_date: "2026-10-15",
    status: "pendiente",
    terms:
      "Contrato de 6 meses renovable. Alojamiento incluido. Seguro medico obligatorio suizo (LAMal) cubierto por el empleador. Formacion en normativas suizas de construccion.",
    benefits: ["Alojamiento", "Seguro Medico", "Formacion"],
    visa_sponsorship: true,
    work_schedule: "Lunes a Viernes, 7:30 - 16:30",
    created_at: "2026-03-28",
  },
  {
    id: "contract_005",
    worker_id: "usr_003",
    worker_name: "Maria Lopez",
    employer_id: "comp-001",
    company_name: "Constructora Alpha S.A.",
    company_letter: "C",
    company_gradient: "green",
    position: "Recepcionista de Hotel",
    country: "Espana",
    city: "Barcelona",
    salary: 2000,
    currency: "EUR",
    start_date: "2026-02-01",
    end_date: "2026-08-01",
    status: "activo",
    terms:
      "Contrato temporal de 6 meses. Jornada completa. Periodo de prueba de 1 mes.",
    benefits: ["Seguro Medico", "Comida"],
    visa_sponsorship: false,
    work_schedule: "Lunes a Viernes, 9:00 - 18:00",
    signature_worker: "signed",
    signature_employer: "signed",
    blockchain_hash: "0x1b9c...e4f7a2d3",
    signed_at: "2026-01-28",
    created_at: "2026-01-20",
  },
  {
    id: "contract_006",
    worker_id: "usr_004",
    worker_name: "Sofia Rodriguez",
    employer_id: "comp-001",
    company_name: "Constructora Alpha S.A.",
    company_letter: "C",
    company_gradient: "green",
    position: "Programador Fullstack Pasante",
    country: "Noruega",
    city: "Bergen",
    salary: 2500,
    currency: "NOK",
    start_date: "2026-03-01",
    end_date: "2026-09-01",
    status: "cancelacion_solicitada",
    terms: "Pasantia de 6 meses con posibilidad de extension.",
    benefits: ["Formacion", "Laptop"],
    visa_sponsorship: true,
    work_schedule: "Lunes a Viernes, 9:00 - 17:00",
    signature_worker: "signed",
    signature_employer: "signed",
    blockchain_hash: "0x5d3e...c1a8f6b2",
    signed_at: "2026-02-25",
    cancellation_reason: "Motivos personales - necesito regresar a mi pais",
    cancellation_requested_by: "worker",
    created_at: "2026-02-20",
  },
];

/* ------------------------------------------------------------------ */
/*  Helper: generate SHA-256-like hash (mock)                          */
/* ------------------------------------------------------------------ */

function generateMockHash(): string {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

/* ------------------------------------------------------------------ */
/*  Server Actions                                                     */
/* ------------------------------------------------------------------ */

export async function getContracts(filters?: {
  role?: "worker" | "employer";
  userId?: string;
  status?: ContractStatus;
}): Promise<ContractData[]> {
  // Simulate delay
  await new Promise((r) => setTimeout(r, 100));

  let results = [...MOCK_CONTRACTS];

  if (filters?.role === "worker" && filters.userId) {
    results = results.filter((c) => c.worker_id === filters.userId);
  }

  if (filters?.role === "employer" && filters.userId) {
    results = results.filter((c) => c.employer_id === filters.userId);
  }

  if (filters?.status) {
    results = results.filter((c) => c.status === filters.status);
  }

  return results;
}

export async function getWorkerContracts(): Promise<ContractData[]> {
  await new Promise((r) => setTimeout(r, 100));
  return MOCK_CONTRACTS.filter((c) => c.worker_id === "usr_001");
}

export async function getEmployerContracts(): Promise<ContractData[]> {
  await new Promise((r) => setTimeout(r, 100));
  return MOCK_CONTRACTS.filter((c) => c.employer_id === "comp-001");
}

export async function createContract(
  data: Omit<ContractData, "id" | "status" | "created_at">
): Promise<ContractData> {
  await new Promise((r) => setTimeout(r, 300));

  const newContract: ContractData = {
    ...data,
    id: `contract_${Date.now()}`,
    status: "pendiente",
    created_at: new Date().toISOString(),
  };

  MOCK_CONTRACTS.push(newContract);
  return newContract;
}

export async function signContract(
  id: string,
  _signatureData: string
): Promise<{ hash: string; signedAt: string }> {
  await new Promise((r) => setTimeout(r, 500));

  const contract = MOCK_CONTRACTS.find((c) => c.id === id);
  if (!contract) throw new Error("Contrato no encontrado");

  const hash = generateMockHash();
  const signedAt = new Date().toISOString();

  contract.signature_worker = "signed";
  contract.blockchain_hash = hash;
  contract.signed_at = signedAt;
  contract.status = "activo";

  return { hash, signedAt };
}

export async function requestCancellation(
  id: string,
  reason: string,
  requestedBy: "worker" | "employer"
): Promise<ContractData> {
  await new Promise((r) => setTimeout(r, 300));

  const contract = MOCK_CONTRACTS.find((c) => c.id === id);
  if (!contract) throw new Error("Contrato no encontrado");

  contract.status = "cancelacion_solicitada";
  contract.cancellation_reason = reason;
  contract.cancellation_requested_by = requestedBy;

  return { ...contract };
}

export async function respondToCancellation(
  id: string,
  accept: boolean
): Promise<ContractData> {
  await new Promise((r) => setTimeout(r, 300));

  const contract = MOCK_CONTRACTS.find((c) => c.id === id);
  if (!contract) throw new Error("Contrato no encontrado");

  if (accept) {
    contract.status = "cancelado";
  } else {
    contract.status = "en_disputa";
  }

  return { ...contract };
}

export async function completeContract(id: string): Promise<ContractData> {
  await new Promise((r) => setTimeout(r, 200));

  const contract = MOCK_CONTRACTS.find((c) => c.id === id);
  if (!contract) throw new Error("Contrato no encontrado");

  contract.status = "completado";
  return { ...contract };
}

export async function renewContract(
  parentId: string,
  data: {
    salary: number;
    currency: string;
    start_date: string;
    end_date: string;
    terms: string;
    benefits: string[];
  }
): Promise<ContractData> {
  await new Promise((r) => setTimeout(r, 300));

  const parent = MOCK_CONTRACTS.find((c) => c.id === parentId);
  if (!parent) throw new Error("Contrato padre no encontrado");

  const renewed: ContractData = {
    ...parent,
    id: `contract_${Date.now()}`,
    salary: data.salary,
    currency: data.currency,
    start_date: data.start_date,
    end_date: data.end_date,
    terms: data.terms,
    benefits: data.benefits,
    status: "pendiente",
    signature_worker: undefined,
    signature_employer: "signed",
    blockchain_hash: undefined,
    signed_at: undefined,
    cancellation_reason: undefined,
    cancellation_requested_by: undefined,
    parent_contract_id: parentId,
    created_at: new Date().toISOString(),
  };

  MOCK_CONTRACTS.push(renewed);
  return renewed;
}
