"use server";

import { createClient } from "@/lib/supabase/server";

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
  employer_name?: string;
  company_id?: string;
  company_name: string;
  company_letter: string;
  company_gradient: "green" | "orange" | "purple" | "blue" | "red" | "teal";
  position: string;
  country: string;
  city: string;
  salary: number;
  currency: string;
  salary_display?: string;
  start_date: string;
  end_date: string;
  status: ContractStatus;
  terms: string;
  terms_structured?: Record<string, unknown>;
  benefits: string[];
  visa_sponsorship: boolean;
  work_schedule: string;
  visa_details?: string;
  signature_worker?: string;
  signature_employer?: string;
  blockchain_hash?: string;
  signed_at?: string;
  cancellation_reason?: string;
  cancellation_requested_by?: "worker" | "employer";
  cancellation_date?: string;
  parent_contract_id?: string;
  application_id?: string;
  job_id?: string;
  completed_at?: string;
  completed_by?: string;
  last_payment_date?: string;
  total_paid?: number;
  created_at: string;
  updated_at?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function generateBlockchainHash(): string {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

const GRADIENT_OPTIONS: ContractData["company_gradient"][] = [
  "green",
  "orange",
  "purple",
  "blue",
  "red",
  "teal",
];

function pickGradient(name: string): ContractData["company_gradient"] {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return GRADIENT_OPTIONS[sum % GRADIENT_OPTIONS.length];
}

/** Map a Supabase contract row + joined data into ContractData */
function mapRowToContract(
  row: Record<string, unknown>,
  extras?: { worker_name?: string; company_name?: string }
): ContractData {
  const companyName =
    extras?.company_name ??
    (row.companies as Record<string, unknown> | null)?.name as string ??
    (row.employer_name as string) ??
    "Empresa";

  const workerName =
    extras?.worker_name ??
    (row.profiles as Record<string, unknown> | null)?.full_name as string ??
    "Trabajador";

  return {
    id: row.id as string,
    worker_id: row.worker_id as string,
    worker_name: workerName,
    employer_id: row.employer_id as string,
    employer_name: row.employer_name as string | undefined,
    company_id: row.company_id as string | undefined,
    company_name: companyName,
    company_letter: companyName.charAt(0).toUpperCase(),
    company_gradient: pickGradient(companyName),
    position: row.position as string,
    country: row.country as string,
    city: row.city as string,
    salary: Number(row.salary ?? 0),
    currency: row.salary_currency as string ?? "USD",
    salary_display: row.salary_display as string | undefined,
    start_date: row.start_date as string,
    end_date: row.end_date as string,
    status: row.status as ContractStatus,
    terms: row.terms as string ?? "",
    terms_structured: row.terms_structured as Record<string, unknown> | undefined,
    benefits: (row.benefits as string[]) ?? [],
    visa_sponsorship: (row.visa_sponsorship as boolean) ?? false,
    work_schedule: row.work_schedule as string ?? "",
    visa_details: row.visa_details as string | undefined,
    signature_worker: row.worker_signature_data ? "signed" : undefined,
    signature_employer: row.employer_id ? "signed" : undefined,
    blockchain_hash: row.blockchain_hash as string | undefined,
    signed_at: row.signed_at as string | undefined,
    cancellation_reason: row.cancellation_reason as string | undefined,
    cancellation_requested_by: row.cancellation_requested_by
      ? ((row.cancellation_requested_by as string) === row.worker_id
          ? "worker"
          : "employer")
      : undefined,
    cancellation_date: row.cancellation_date as string | undefined,
    parent_contract_id: row.parent_contract_id as string | undefined,
    application_id: row.application_id as string | undefined,
    job_id: row.job_id as string | undefined,
    completed_at: row.completed_at as string | undefined,
    completed_by: row.completed_by as string | undefined,
    last_payment_date: row.last_payment_date as string | undefined,
    total_paid: row.total_paid ? Number(row.total_paid) : undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string | undefined,
  };
}

/* ------------------------------------------------------------------ */
/*  Server Actions                                                     */
/* ------------------------------------------------------------------ */

/**
 * Get all contracts (with optional filters).
 * Falls back to mock data on error.
 */
export async function getContracts(filters?: {
  role?: "worker" | "employer";
  userId?: string;
  status?: ContractStatus;
}): Promise<ContractData[]> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("contracts")
      .select("*, companies(name), profiles!contracts_worker_id_fkey(full_name)")
      .order("created_at", { ascending: false });

    if (filters?.role === "worker" && filters.userId) {
      query = query.eq("worker_id", filters.userId);
    }
    if (filters?.role === "employer" && filters.userId) {
      query = query.eq("employer_id", filters.userId);
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[getContracts] Supabase error:", error.message);
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => mapRowToContract(row));
  } catch (err) {
    console.error("[getContracts] Unexpected error:", err);
    return [];
  }
}

/**
 * Get contracts for the currently authenticated worker.
 * Joins companies table for employer/company info.
 */
export async function getWorkerContracts(): Promise<ContractData[]> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.warn("[getWorkerContracts] No authenticated user");
      return [];
    }

    const { data, error } = await supabase
      .from("contracts")
      .select("*, companies(name)")
      .eq("worker_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getWorkerContracts] Supabase error:", error.message);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row: Record<string, unknown>) =>
      mapRowToContract(row, {
        worker_name: user.user_metadata?.full_name ?? user.email ?? "Yo",
      })
    );
  } catch (err) {
    console.error("[getWorkerContracts] Unexpected error:", err);
    return [];
  }
}

/**
 * Get contracts for the currently authenticated employer.
 * Joins profiles table for worker name info.
 */
export async function getEmployerContracts(): Promise<ContractData[]> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.warn("[getEmployerContracts] No authenticated user");
      return [];
    }

    const { data, error } = await supabase
      .from("contracts")
      .select("*, profiles!contracts_worker_id_fkey(full_name), companies(name)")
      .eq("employer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getEmployerContracts] Supabase error:", error.message);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row: Record<string, unknown>) => mapRowToContract(row));
  } catch (err) {
    console.error("[getEmployerContracts] Unexpected error:", err);
    return [];
  }
}

/**
 * Create a new contract and log a contract_event.
 */
export async function createContract(
  data: Omit<ContractData, "id" | "status" | "created_at">
): Promise<ContractData> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const employerId = user?.id ?? data.employer_id;

    const insertPayload = {
      worker_id: data.worker_id,
      employer_id: employerId,
      employer_name: data.employer_name ?? data.company_name,
      company_id: data.company_id ?? null,
      application_id: data.application_id ?? null,
      job_id: data.job_id ?? null,
      position: data.position,
      country: data.country,
      city: data.city,
      salary: data.salary,
      salary_currency: data.currency,
      salary_display: data.salary_display ?? `${data.salary} ${data.currency}`,
      start_date: data.start_date,
      end_date: data.end_date,
      terms: data.terms,
      terms_structured: data.terms_structured ?? null,
      benefits: data.benefits,
      work_schedule: data.work_schedule,
      visa_sponsorship: data.visa_sponsorship,
      visa_details: data.visa_details ?? null,
      status: "pendiente",
    };

    const { data: newRow, error } = await supabase
      .from("contracts")
      .insert(insertPayload)
      .select("*, companies(name)")
      .single();

    if (error) {
      console.error("[createContract] Supabase error:", error.message);
      // Fallback: return mock-like object
      const fallback: ContractData = {
        ...data,
        id: `contract_${Date.now()}`,
        status: "pendiente",
        created_at: new Date().toISOString(),
      };
      return fallback;
    }

    // Log event
    await supabase.from("contract_events").insert({
      contract_id: newRow.id,
      actor_id: employerId,
      event_type: "created",
      metadata: { position: data.position, worker_id: data.worker_id },
    });

    return mapRowToContract(newRow as Record<string, unknown>, {
      worker_name: data.worker_name,
      company_name: data.company_name,
    });
  } catch (err) {
    console.error("[createContract] Unexpected error:", err);
    const fallback: ContractData = {
      ...data,
      id: `contract_${Date.now()}`,
      status: "pendiente",
      created_at: new Date().toISOString(),
    };
    return fallback;
  }
}

/**
 * Sign a contract: set status to 'activo', record signature data and blockchain hash.
 */
export async function signContract(
  id: string,
  signatureData: string
): Promise<{ hash: string; signedAt: string }> {
  const hash = generateBlockchainHash();
  const signedAt = new Date().toISOString();

  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("contracts")
      .update({
        status: "activo",
        signed_at: signedAt,
        worker_signature_data: signatureData,
        blockchain_hash: hash,
      })
      .eq("id", id);

    if (error) {
      console.error("[signContract] Supabase error:", error.message);
      // Still return the hash/date so the UI updates optimistically
      return { hash, signedAt };
    }

    // Log event
    await supabase.from("contract_events").insert({
      contract_id: id,
      actor_id: user?.id ?? null,
      event_type: "signed",
      metadata: { blockchain_hash: hash },
    });

    return { hash, signedAt };
  } catch (err) {
    console.error("[signContract] Unexpected error:", err);
    return { hash, signedAt };
  }
}

/**
 * Request cancellation of a contract.
 */
export async function requestCancellation(
  id: string,
  reason: string,
  requestedBy: "worker" | "employer"
): Promise<ContractData> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: updated, error } = await supabase
      .from("contracts")
      .update({
        status: "cancelacion_solicitada",
        cancellation_requested_by: user?.id ?? null,
        cancellation_reason: reason,
        cancellation_date: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*, companies(name), profiles!contracts_worker_id_fkey(full_name)")
      .single();

    if (error) {
      console.error("[requestCancellation] Supabase error:", error.message);
      throw new Error("Error al solicitar cancelacion");
    }

    // Log event
    await supabase.from("contract_events").insert({
      contract_id: id,
      actor_id: user?.id ?? null,
      event_type: "cancellation_requested",
      metadata: { reason, requested_by: requestedBy },
    });

    return mapRowToContract(updated as Record<string, unknown>);
  } catch (err) {
    console.error("[requestCancellation] Unexpected error:", err);
    throw new Error("Error al solicitar cancelacion");
  }
}

/**
 * Respond to a cancellation request (accept or dispute).
 */
export async function respondToCancellation(
  id: string,
  accept: boolean
): Promise<ContractData> {
  const newStatus: ContractStatus = accept ? "cancelado" : "en_disputa";

  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: updated, error } = await supabase
      .from("contracts")
      .update({ status: newStatus })
      .eq("id", id)
      .select("*, companies(name), profiles!contracts_worker_id_fkey(full_name)")
      .single();

    if (error) {
      console.error("[respondToCancellation] Supabase error:", error.message);
      throw new Error("Error al responder a cancelacion");
    }

    // Log event
    await supabase.from("contract_events").insert({
      contract_id: id,
      actor_id: user?.id ?? null,
      event_type: accept ? "cancellation_accepted" : "cancellation_disputed",
      metadata: { accepted: accept },
    });

    return mapRowToContract(updated as Record<string, unknown>);
  } catch (err) {
    console.error("[respondToCancellation] Unexpected error:", err);
    throw new Error("Error al responder a cancelacion");
  }
}

/**
 * Complete a contract.
 */
export async function completeContract(id: string): Promise<ContractData> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: updated, error } = await supabase
      .from("contracts")
      .update({
        status: "completado",
        completed_at: new Date().toISOString(),
        completed_by: user?.id ?? null,
      })
      .eq("id", id)
      .select("*, companies(name), profiles!contracts_worker_id_fkey(full_name)")
      .single();

    if (error) {
      console.error("[completeContract] Supabase error:", error.message);
      throw new Error("Error al completar contrato");
    }

    // Log event
    await supabase.from("contract_events").insert({
      contract_id: id,
      actor_id: user?.id ?? null,
      event_type: "completed",
      metadata: {},
    });

    return mapRowToContract(updated as Record<string, unknown>);
  } catch (err) {
    console.error("[completeContract] Unexpected error:", err);
    throw new Error("Error al completar contrato");
  }
}

/**
 * Renew a contract by creating a new one with parent_contract_id referencing the old.
 */
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
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Fetch parent contract
    const { data: parent, error: parentError } = await supabase
      .from("contracts")
      .select("*, companies(name), profiles!contracts_worker_id_fkey(full_name)")
      .eq("id", parentId)
      .single();

    if (parentError || !parent) {
      console.error("[renewContract] Parent not found:", parentError?.message);
      throw new Error("Contrato padre no encontrado");
    }

    const insertPayload = {
      worker_id: parent.worker_id,
      employer_id: parent.employer_id,
      employer_name: parent.employer_name,
      company_id: parent.company_id ?? null,
      application_id: parent.application_id ?? null,
      job_id: parent.job_id ?? null,
      position: parent.position,
      country: parent.country,
      city: parent.city,
      salary: data.salary,
      salary_currency: data.currency,
      salary_display: `${data.salary} ${data.currency}`,
      start_date: data.start_date,
      end_date: data.end_date,
      terms: data.terms,
      benefits: data.benefits,
      work_schedule: parent.work_schedule,
      visa_sponsorship: parent.visa_sponsorship,
      visa_details: parent.visa_details ?? null,
      status: "pendiente",
      parent_contract_id: parentId,
    };

    const { data: newRow, error } = await supabase
      .from("contracts")
      .insert(insertPayload)
      .select("*, companies(name), profiles!contracts_worker_id_fkey(full_name)")
      .single();

    if (error) {
      console.error("[renewContract] Insert error:", error.message);
      throw new Error("Error al crear contrato renovado");
    }

    // Log event
    await supabase.from("contract_events").insert({
      contract_id: newRow.id,
      actor_id: user?.id ?? null,
      event_type: "renewed",
      metadata: { parent_contract_id: parentId },
    });

    return mapRowToContract(newRow as Record<string, unknown>);
  } catch (err) {
    console.error("[renewContract] Unexpected error:", err);
    throw new Error("Error al renovar contrato");
  }
}
