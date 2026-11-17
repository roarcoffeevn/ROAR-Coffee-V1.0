export interface VolumePriceTier {
  minKg: number;
  maxKg: number | null;
  labelVi: string;
  labelEn: string;
  priceVnd: number;
  priceUsd: number;
}

export const ROASTED_BEAN_TIER_DEFINITIONS: Array<{
  minKg: number;
  maxKg: number | null;
  labelVi: string;
  labelEn: string;
}> = [
  { minKg: 1, maxKg: 4, labelVi: '1 kg', labelEn: '1 kg' },
  { minKg: 5, maxKg: 19, labelVi: '5–19 kg', labelEn: '5–19 kg' },
  { minKg: 20, maxKg: 49, labelVi: '20–49 kg', labelEn: '20–49 kg' },
  { minKg: 50, maxKg: 99, labelVi: '50–99 kg', labelEn: '50–99 kg' },
  { minKg: 100, maxKg: null, labelVi: 'Sỉ: ≥100 kg', labelEn: 'Wholesale: ≥100 kg' },
];

export function convertVndToUsdRounded(vnd: number, exchangeRate = 25930): number {
  const safeRate = exchangeRate > 0 ? exchangeRate : 25930;
  return Number((Math.max(0, Number(vnd || 0)) / safeRate).toFixed(2));
}

export function buildFiveTierPrices(
  pricesVnd: [number, number, number, number, number],
  exchangeRate = 25930
): VolumePriceTier[] {
  return ROASTED_BEAN_TIER_DEFINITIONS.map((def, idx) => {
    const vnd = Math.max(0, Math.round(Number(pricesVnd[idx] || 0)));
    return {
      minKg: def.minKg,
      maxKg: def.maxKg,
      labelVi: def.labelVi,
      labelEn: def.labelEn,
      priceVnd: vnd,
      priceUsd: convertVndToUsdRounded(vnd, exchangeRate),
    };
  });
}

export function normalizeVolumeTiers(raw: unknown, exchangeRate = 25930): VolumePriceTier[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item: any, idx) => {
      const def = ROASTED_BEAN_TIER_DEFINITIONS[idx];
      const minKg = Math.max(1, Number(item?.minKg ?? def?.minKg ?? 1));
      const maxKgRaw = item?.maxKg === null || item?.maxKg === '' || item?.maxKg === undefined ? null : Number(item.maxKg);
      const maxKg = maxKgRaw !== null && Number.isFinite(maxKgRaw) && maxKgRaw >= minKg ? maxKgRaw : null;
      const priceVnd = Math.max(0, Math.round(Number(item?.priceVnd || 0)));
      const priceUsd =
        Number(item?.priceUsd) > 0
          ? Number(Number(item.priceUsd).toFixed(2))
          : convertVndToUsdRounded(priceVnd, exchangeRate);
      return {
        minKg,
        maxKg,
        labelVi: String(item?.labelVi || def?.labelVi || (maxKg ? `${minKg}–${maxKg} kg` : `Sỉ: ≥${minKg} kg`)),
        labelEn: String(item?.labelEn || def?.labelEn || (maxKg ? `${minKg}–${maxKg} kg` : `Wholesale: ≥${minKg} kg`)),
        priceVnd,
        priceUsd,
      };
    })
    .filter((t) => t.priceVnd > 0)
    .sort((a, b) => a.minKg - b.minKg);
}

export function resolveVolumeTier(tiers: VolumePriceTier[] | undefined | null, kgQty: number): VolumePriceTier | null {
  if (!Array.isArray(tiers) || tiers.length === 0) return null;
  const qty = Math.max(1, Number(kgQty || 1));
  const sorted = [...tiers].sort((a, b) => a.minKg - b.minKg);

  // Exact range match
  const exact = sorted.find((t) => qty >= t.minKg && (t.maxKg === null || qty <= t.maxKg));
  if (exact) return exact;

  // Fallback: highest tier whose minKg <= qty (prevents gap between customized boundaries like maxKg=1 and next minKg=5)
  let best = sorted[0];
  for (const tier of sorted) {
    if (qty >= tier.minKg) {
      best = tier;
    }
  }
  return best;
}

export function getTierPriceRange(tiers: VolumePriceTier[] | undefined | null): {
  minVnd: number;
  maxVnd: number;
  minUsd: number;
  maxUsd: number;
} | null {
  if (!Array.isArray(tiers) || tiers.length === 0) return null;
  const vnds = tiers.map((t) => Number(t.priceVnd || 0)).filter((v) => v > 0);
  const usds = tiers.map((t) => Number(t.priceUsd || 0)).filter((u) => u > 0);
  if (vnds.length === 0) return null;
  return {
    minVnd: Math.min(...vnds),
    maxVnd: Math.max(...vnds),
    minUsd: usds.length ? Math.min(...usds) : 0,
    maxUsd: usds.length ? Math.max(...usds) : 0,
  };
}

export function computeEan13CheckDigit(twelveDigits: string): string {
  const digits = twelveDigits.replace(/\D/g, '').padStart(12, '0').slice(0, 12);
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const n = Number(digits[i]);
    sum += i % 2 === 0 ? n : n * 3;
  }
  const mod = sum % 10;
  return String(mod === 0 ? 0 : 10 - mod);
}

/**
 * Generates a valid GS1 Vietnam (893 prefix) 13-digit EAN-13 barcode deterministically from a numeric seed or product key.
 */
export function generateEan13Barcode(seed: string | number): string {
  let numHash = 0;
  if (typeof seed === 'number' && Number.isFinite(seed)) {
    numHash = Math.abs(Math.floor(seed));
  } else {
    const str = String(seed || '1');
    for (let i = 0; i < str.length; i++) {
      numHash = (numHash * 31 + str.charCodeAt(i)) % 1000000;
    }
  }
  const itemPart = String(100000 + (numHash % 899999)).padStart(6, '0');
  const twelve = `893855${itemPart}`;
  return `${twelve}${computeEan13CheckDigit(twelve)}`;
}

export function isValidEan13(code: string): boolean {
  const clean = String(code || '').trim();
  if (!/^\d{13}$/.test(clean)) return false;
  return computeEan13CheckDigit(clean.slice(0, 12)) === clean[12];
}
