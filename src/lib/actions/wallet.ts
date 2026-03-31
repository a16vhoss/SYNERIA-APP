"use server";

import { createClient } from "@/lib/supabase/server";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface WalletData {
  balance: number;
  currency: string;
  cardLastFour: string;
  cardExpiry: string;
}

export interface TransactionData {
  id: string;
  type: "income" | "remittance" | "swap" | "bonus" | "withdrawal" | "deposit" | "payment_sent" | "payment_received";
  amount: number;
  currency: string;
  description: string;
  recipientName?: string;
  recipientCountry?: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  Get Wallet                                                         */
/* ------------------------------------------------------------------ */

export async function getWallet(): Promise<WalletData> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { balance: 0, currency: "USD", cardLastFour: "0000", cardExpiry: "00/00" };

    const { data: wallet } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!wallet) {
      // Create wallet if it doesn't exist
      const { data: newWallet } = await supabase
        .from("wallets")
        .insert({ user_id: user.id, balance: 0, currency: "USD" })
        .select()
        .single();

      return {
        balance: newWallet?.balance ?? 0,
        currency: newWallet?.currency ?? "USD",
        cardLastFour: newWallet?.card_last_four ?? "0000",
        cardExpiry: newWallet?.card_expiry ?? "00/00",
      };
    }

    return {
      balance: wallet.balance ?? 0,
      currency: wallet.currency ?? "USD",
      cardLastFour: wallet.card_last_four ?? "4829",
      cardExpiry: wallet.card_expiry ?? "12/28",
    };
  } catch {
    return { balance: 0, currency: "USD", cardLastFour: "0000", cardExpiry: "00/00" };
  }
}

/* ------------------------------------------------------------------ */
/*  Get Transactions                                                   */
/* ------------------------------------------------------------------ */

export async function getTransactions(): Promise<TransactionData[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: transactions } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!transactions?.length) return [];

    return transactions.map((t) => ({
      id: t.id,
      type: t.type as TransactionData["type"],
      amount: t.amount,
      currency: t.currency ?? "USD",
      description: t.description ?? "",
      recipientName: t.recipient_name ?? undefined,
      recipientCountry: t.recipient_country ?? undefined,
      status: t.status as TransactionData["status"],
      createdAt: t.created_at,
    }));
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/*  Send Remittance                                                    */
/* ------------------------------------------------------------------ */

export async function sendRemittance(input: {
  recipientName: string;
  recipientCountry: string;
  amount: number;
  currency: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "No autenticado" };

    // Check balance
    const { data: wallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (!wallet || wallet.balance < input.amount) {
      return { success: false, error: "Saldo insuficiente" };
    }

    // Deduct from wallet
    const { error: walletError } = await supabase
      .from("wallets")
      .update({ balance: wallet.balance - input.amount })
      .eq("user_id", user.id);

    if (walletError) throw walletError;

    // Create transaction
    const { error: txError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        type: "remittance",
        amount: input.amount,
        currency: input.currency,
        description: `Remesa a ${input.recipientName} (${input.recipientCountry})`,
        recipient_name: input.recipientName,
        recipient_country: input.recipientCountry,
        status: "completed",
      });

    if (txError) throw txError;

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Error al enviar" };
  }
}

/* ------------------------------------------------------------------ */
/*  Deposit Funds (Employer)                                           */
/* ------------------------------------------------------------------ */

export async function depositFunds(amount: number): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "No autenticado" };

    const { data: wallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (!wallet) {
      await supabase.from("wallets").insert({ user_id: user.id, balance: amount });
    } else {
      await supabase
        .from("wallets")
        .update({ balance: wallet.balance + amount })
        .eq("user_id", user.id);
    }

    await supabase.from("transactions").insert({
      user_id: user.id,
      type: "deposit",
      amount,
      description: "Deposito de fondos",
      status: "completed",
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

/* ------------------------------------------------------------------ */
/*  Send Payment (Employer → Worker)                                   */
/* ------------------------------------------------------------------ */

export async function sendPayment(input: {
  workerId: string;
  amount: number;
  contractId?: string;
  description: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "No autenticado" };

    // Check employer balance
    const { data: employerWallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (!employerWallet || employerWallet.balance < input.amount) {
      return { success: false, error: "Saldo insuficiente" };
    }

    // Deduct from employer
    await supabase
      .from("wallets")
      .update({ balance: employerWallet.balance - input.amount })
      .eq("user_id", user.id);

    // Add to worker wallet
    const { data: workerWallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", input.workerId)
      .single();

    if (workerWallet) {
      await supabase
        .from("wallets")
        .update({ balance: workerWallet.balance + input.amount })
        .eq("user_id", input.workerId);
    } else {
      await supabase
        .from("wallets")
        .insert({ user_id: input.workerId, balance: input.amount });
    }

    // Create transaction for employer (sent)
    await supabase.from("transactions").insert({
      user_id: user.id,
      type: "payment_sent",
      amount: input.amount,
      description: input.description,
      counterparty_id: input.workerId,
      contract_id: input.contractId ?? null,
      status: "completed",
    });

    // Create transaction for worker (received)
    await supabase.from("transactions").insert({
      user_id: input.workerId,
      type: "payment_received",
      amount: input.amount,
      description: input.description,
      counterparty_id: user.id,
      contract_id: input.contractId ?? null,
      status: "completed",
    });

    // Update contract total_paid if applicable
    if (input.contractId) {
      const { data: contract } = await supabase
        .from("contracts")
        .select("total_paid")
        .eq("id", input.contractId)
        .single();

      if (contract) {
        await supabase
          .from("contracts")
          .update({
            total_paid: (contract.total_paid ?? 0) + input.amount,
            last_payment_date: new Date().toISOString(),
          })
          .eq("id", input.contractId);
      }
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Error al enviar pago" };
  }
}
