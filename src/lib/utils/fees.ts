export const PAYMENT_FEE_RATE = 0.015;
export const REMITTANCE_FEE_RATE = 0.025;
export const SWAP_FEE_RATE = 0.01;

export function calculateFee(
  amount: number,
  type: "payment" | "remittance" | "swap"
): number {
  const rates = {
    payment: PAYMENT_FEE_RATE,
    remittance: REMITTANCE_FEE_RATE,
    swap: SWAP_FEE_RATE,
  };
  return Math.round(amount * rates[type] * 100) / 100;
}

export const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  USD: {
    EUR: 0.92,
    GBP: 0.79,
    MXN: 17.15,
    COP: 4150,
    BRL: 4.97,
    PEN: 3.72,
  },
  EUR: {
    USD: 1.09,
    GBP: 0.86,
    MXN: 18.65,
    COP: 4510,
    BRL: 5.41,
    PEN: 4.05,
  },
};

export function convertCurrency(
  amount: number,
  from: string,
  to: string
): number {
  if (from === to) return amount;
  const rate = EXCHANGE_RATES[from]?.[to] ?? 1;
  return Math.round(amount * rate * 100) / 100;
}
