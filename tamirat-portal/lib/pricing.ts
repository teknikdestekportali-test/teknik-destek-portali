const HOURLY_RATE = Number(process.env.HOURLY_RATE ?? 250);
const HANDLING_FEE = Number(process.env.HANDLING_FEE ?? 500);
const AOG_MULTIPLIER = 1.5;

export function calculatePrice(manHours: number, isAOG: boolean): number {
  const multiplier = isAOG ? AOG_MULTIPLIER : 1.0;
  return Math.round(((manHours * HOURLY_RATE) + HANDLING_FEE) * multiplier);
}

export function priceBreakdown(manHours: number, isAOG: boolean) {
  const base = manHours * HOURLY_RATE;
  const withFee = base + HANDLING_FEE;
  const multiplier = isAOG ? AOG_MULTIPLIER : 1.0;
  const total = Math.round(withFee * multiplier);
  return { base, handling: HANDLING_FEE, subtotal: withFee, multiplier, total, hourlyRate: HOURLY_RATE };
}
