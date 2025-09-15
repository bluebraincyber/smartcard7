// src/lib/analytics/stats.ts

export function mean(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function std(nums: number[]): number {
  if (nums.length < 2) return 0;
  const m = mean(nums);
  const variance = nums.reduce((a, b) => a + Math.pow(b - m, 2), 0) / (nums.length - 1);
  return Math.sqrt(variance);
}

export function calculateDelta(current: number, previous: number): number {
  if (previous === 0) return 0;
  return parseFloat((((current - previous) / previous) * 100).toFixed(1));
}

export function detectAnomalies(
  values: number[],
  baseline: number[],
  threshold: number = 2
): boolean[] {
  return values.map((value, i) => {
    const base = baseline[i] || 0;
    const stdDev = std([...baseline]);
    return Math.abs(value - base) > threshold * stdDev;
  });
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatPercentage(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
}
