export function fmtBRL(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format((cents ?? 0) / 100);
}

export function parseBRLToCents(input: string) {
  if (!input) return 0;
  // aceita "1.234,56" ou "1234.56" ou "1234,56"
  const normalized = input
    .replace(/\s+/g, "")
    .replace(/\./g, "")
    .replace(/,/g, ".");
  const num = Number(normalized);
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}
