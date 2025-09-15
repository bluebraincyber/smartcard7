export type MoneyCents = number; // sempre em centavos
export type EntryType = "IN" | "OUT";
export type PayMethod = "pix" | "dinheiro" | "debito" | "credito" | "transferencia" | "outro";

export type LedgerEntry = {
  id: string;
  storeId: string;
  type: EntryType; // IN/OUT
  title: string;
  amount: MoneyCents; // positivo em centavos
  category?: string;
  method?: PayMethod;
  date: string; // yyyy-mm-dd
  note?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  createdBy?: string;
};

export type LedgerSummary = {
  opening: MoneyCents;
  inflow: MoneyCents;
  outflow: MoneyCents;
  result: MoneyCents;
  closing: MoneyCents;
};
