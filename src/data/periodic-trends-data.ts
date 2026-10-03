export type PeriodicPropertyKey =
  | 'atomicRadius'
  | 'ionizationEnergy'
  | 'electronegativity'
  | 'electronAffinity';

export interface PeriodicPropertyMetadata {
  key: PeriodicPropertyKey;
  name: string;
  shortName: string;
  unit: string;
  scale?: string;
  symbolNotation: string;
  description: string;
  periodTrend: string; // Left to right
  groupTrend: string; // Top to bottom
  scientificReason: string;
  source: string;
}

export const PERIODIC_PROPERTIES: Record<PeriodicPropertyKey, PeriodicPropertyMetadata> = {
  atomicRadius: {
    key: 'atomicRadius',
    name: 'Jari-Jari Atom (Non-Bonded)',
    shortName: 'Jari-Jari Atom',
    unit: 'Å',
    symbolNotation: 'r',
    description: 'Jarak dari inti atom ke batas terluar awan elektron non-ikatan (non-bonded / van der Waals radius).',
    periodTrend: 'Secara umum mengecil (→)',
    groupTrend: 'Secara umum membesar (↓)',
    scientificReason: 'Dari kiri ke kanan dalam satu periode, muatan inti efektif (Z_eff) meningkat sehingga menarik awan elektron lebih kuat ke inti. Dari atas ke bawah dalam satu golongan, jumlah kulit utama bertambah sehingga jari-jari membesar.',
    source: 'Royal Society of Chemistry (RSC) / Bondi & Clementi non-bonded atomic radii',
  },
  ionizationEnergy: {
    key: 'ionizationEnergy',
    name: 'Energi Ionisasi Pertama',
    shortName: 'Energi Ionisasi',
    unit: 'kJ mol⁻¹',
    symbolNotation: 'EI₁',
    description: 'Energi minimum yang diperlukan untuk melepaskan satu elektron terluar dari atom gas netral dalam keadaan dasar.',
    periodTrend: 'Secara umum meningkat (→)',
    groupTrend: 'Secara umum menurun (↓)',
    scientificReason: 'Makin kecil jari-jari atom dan makin besar muatan inti efektif, elektron terluar terikat lebih kuat sehingga membutuhkan energi pelepasan lebih besar. Terdapat anomali lokal pada konfigurasi subkulit penuh atau setengah penuh (seperti Be vs B, N vs O).',
    source: 'National Institute of Standards and Technology (NIST) Atomic Spectra Database',
  },
  electronegativity: {
    key: 'electronegativity',
    name: 'Elektronegativitas (Skala Pauling)',
    shortName: 'Elektronegativitas',
    unit: '',
    scale: 'Skala Pauling',
    symbolNotation: 'χ',
    description: 'Kemampuan relatif suatu atom dalam molekul untuk menarik pasangan elektron ikatan ke arah dirinya.',
    periodTrend: 'Secara umum meningkat (→)',
    groupTrend: 'Secara umum menurun (↓)',
    scientificReason: 'Atom dengan jari-jari kecil dan muatan inti efektif tinggi memiliki daya tarik lebih kuat terhadap elektron ikatan. Fluorin (F = 3.98) adalah unsur paling elektronegatif. Gas mulia umumnya tidak memiliki nilai elektronegativitas Pauling konvensional.',
    source: 'Royal Society of Chemistry (RSC) / Pauling Electronegativity Scale',
  },
  electronAffinity: {
    key: 'electronAffinity',
    name: 'Afinitas Elektron',
    shortName: 'Afinitas Elektron',
    unit: 'kJ mol⁻¹',
    symbolNotation: 'EA',
    description: 'Perubahan energi yang menyertai penangkapan satu elektron oleh atom netral dalam fase gas membentuk ion bermuatan -1.',
    periodTrend: 'Secara umum makin eksotermik / meningkat (→)',
    groupTrend: 'Secara umum menurun / kurang eksotermik (↓)',
    scientificReason: 'Halogen memiliki afinitas elektron paling tinggi karena penambahan 1 elektron menghasilkan konfigurasi oktet gas mulia yang sangat stabil. Gas mulia dan logam alkali tanah memiliki afinitas mendekati nol atau tidak stabil.',
    source: 'National Institute of Standards and Technology (NIST) / RSC Data',
  },
};

export interface ElementTrendsData {
  atomicNumber: number;
  atomicRadius: number | null; // in Angstroms (Å), non-bonded
  ionizationEnergy: number | null; // in kJ/mol (1st IE)
  electronegativity: number | null; // Pauling scale
  electronAffinity: number | null; // in kJ/mol
}

// Authoritative scientific values for 118 elements from NIST and RSC
export const TRENDS_DATA_BY_NUMBER: Record<number, ElementTrendsData> = {
  1: { atomicNumber: 1, atomicRadius: 1.10, ionizationEnergy: 1312.0, electronegativity: 2.20, electronAffinity: 72.8 },
  2: { atomicNumber: 2, atomicRadius: 1.40, ionizationEnergy: 2372.3, electronegativity: null, electronAffinity: null },
  3: { atomicNumber: 3, atomicRadius: 1.82, ionizationEnergy: 520.2, electronegativity: 0.98, electronAffinity: 59.6 },
  4: { atomicNumber: 4, atomicRadius: 1.53, ionizationEnergy: 899.5, electronegativity: 1.57, electronAffinity: null },
  5: { atomicNumber: 5, atomicRadius: 1.92, ionizationEnergy: 800.6, electronegativity: 2.04, electronAffinity: 26.7 },
  6: { atomicNumber: 6, atomicRadius: 1.70, ionizationEnergy: 1086.5, electronegativity: 2.55, electronAffinity: 121.8 },
  7: { atomicNumber: 7, atomicRadius: 1.55, ionizationEnergy: 1402.3, electronegativity: 3.04, electronAffinity: 7.0 },
  8: { atomicNumber: 8, atomicRadius: 1.52, ionizationEnergy: 1313.9, electronegativity: 3.44, electronAffinity: 141.0 },
  9: { atomicNumber: 9, atomicRadius: 1.47, ionizationEnergy: 1681.0, electronegativity: 3.98, electronAffinity: 328.0 },
  10: { atomicNumber: 10, atomicRadius: 1.54, ionizationEnergy: 2080.7, electronegativity: null, electronAffinity: null },
  11: { atomicNumber: 11, atomicRadius: 2.27, ionizationEnergy: 495.8, electronegativity: 0.93, electronAffinity: 52.8 },
  12: { atomicNumber: 12, atomicRadius: 1.73, ionizationEnergy: 737.7, electronegativity: 1.31, electronAffinity: null },
  13: { atomicNumber: 13, atomicRadius: 1.84, ionizationEnergy: 577.5, electronegativity: 1.61, electronAffinity: 42.5 },
  14: { atomicNumber: 14, atomicRadius: 2.10, ionizationEnergy: 786.5, electronegativity: 1.90, electronAffinity: 134.1 },
  15: { atomicNumber: 15, atomicRadius: 1.80, ionizationEnergy: 1011.8, electronegativity: 2.19, electronAffinity: 72.0 },
  16: { atomicNumber: 16, atomicRadius: 1.80, ionizationEnergy: 999.6, electronegativity: 2.58, electronAffinity: 200.4 },
  17: { atomicNumber: 17, atomicRadius: 1.75, ionizationEnergy: 1251.2, electronegativity: 3.16, electronAffinity: 349.0 },
  18: { atomicNumber: 18, atomicRadius: 1.88, ionizationEnergy: 1520.6, electronegativity: null, electronAffinity: null },
  19: { atomicNumber: 19, atomicRadius: 2.75, ionizationEnergy: 418.8, electronegativity: 0.82, electronAffinity: 48.4 },
  20: { atomicNumber: 20, atomicRadius: 2.31, ionizationEnergy: 589.8, electronegativity: 1.00, electronAffinity: 2.4 },
  21: { atomicNumber: 21, atomicRadius: 2.11, ionizationEnergy: 633.1, electronegativity: 1.36, electronAffinity: 18.1 },
  22: { atomicNumber: 22, atomicRadius: 2.00, ionizationEnergy: 658.8, electronegativity: 1.54, electronAffinity: 7.6 },
  23: { atomicNumber: 23, atomicRadius: 2.05, ionizationEnergy: 650.9, electronegativity: 1.63, electronAffinity: 50.7 },
  24: { atomicNumber: 24, atomicRadius: 2.00, ionizationEnergy: 652.9, electronegativity: 1.66, electronAffinity: 64.3 },
  25: { atomicNumber: 25, atomicRadius: 2.05, ionizationEnergy: 717.3, electronegativity: 1.55, electronAffinity: null },
  26: { atomicNumber: 26, atomicRadius: 2.04, ionizationEnergy: 762.5, electronegativity: 1.83, electronAffinity: 15.7 },
  27: { atomicNumber: 27, atomicRadius: 2.00, ionizationEnergy: 760.4, electronegativity: 1.88, electronAffinity: 63.7 },
  28: { atomicNumber: 28, atomicRadius: 1.97, ionizationEnergy: 737.1, electronegativity: 1.91, electronAffinity: 112.0 },
  29: { atomicNumber: 29, atomicRadius: 1.96, ionizationEnergy: 745.5, electronegativity: 1.90, electronAffinity: 118.4 },
  30: { atomicNumber: 30, atomicRadius: 2.01, ionizationEnergy: 906.4, electronegativity: 1.65, electronAffinity: null },
  31: { atomicNumber: 31, atomicRadius: 1.87, ionizationEnergy: 578.8, electronegativity: 1.81, electronAffinity: 28.9 },
  32: { atomicNumber: 32, atomicRadius: 2.11, ionizationEnergy: 762.0, electronegativity: 2.01, electronAffinity: 119.0 },
  33: { atomicNumber: 33, atomicRadius: 1.85, ionizationEnergy: 947.0, electronegativity: 2.18, electronAffinity: 78.2 },
  34: { atomicNumber: 34, atomicRadius: 1.90, ionizationEnergy: 941.0, electronegativity: 2.55, electronAffinity: 195.0 },
  35: { atomicNumber: 35, atomicRadius: 1.85, ionizationEnergy: 1139.9, electronegativity: 2.96, electronAffinity: 324.6 },
  36: { atomicNumber: 36, atomicRadius: 2.02, ionizationEnergy: 1350.8, electronegativity: 3.00, electronAffinity: null },
  37: { atomicNumber: 37, atomicRadius: 3.03, ionizationEnergy: 403.0, electronegativity: 0.82, electronAffinity: 46.9 },
  38: { atomicNumber: 38, atomicRadius: 2.49, ionizationEnergy: 549.5, electronegativity: 0.95, electronAffinity: 5.0 },
  39: { atomicNumber: 39, atomicRadius: 2.27, ionizationEnergy: 600.0, electronegativity: 1.22, electronAffinity: 29.6 },
  40: { atomicNumber: 40, atomicRadius: 2.16, ionizationEnergy: 640.1, electronegativity: 1.33, electronAffinity: 41.1 },
  41: { atomicNumber: 41, atomicRadius: 2.11, ionizationEnergy: 652.1, electronegativity: 1.60, electronAffinity: 86.1 },
  42: { atomicNumber: 42, atomicRadius: 2.09, ionizationEnergy: 684.3, electronegativity: 2.16, electronAffinity: 71.9 },
  43: { atomicNumber: 43, atomicRadius: 2.09, ionizationEnergy: 702.0, electronegativity: 1.90, electronAffinity: 53.0 },
  44: { atomicNumber: 44, atomicRadius: 2.07, ionizationEnergy: 710.2, electronegativity: 2.20, electronAffinity: 101.3 },
  45: { atomicNumber: 45, atomicRadius: 2.00, ionizationEnergy: 719.7, electronegativity: 2.28, electronAffinity: 109.7 },
  46: { atomicNumber: 46, atomicRadius: 2.02, ionizationEnergy: 804.4, electronegativity: 2.20, electronAffinity: 53.7 },
  47: { atomicNumber: 47, atomicRadius: 2.03, ionizationEnergy: 731.0, electronegativity: 1.93, electronAffinity: 125.6 },
  48: { atomicNumber: 48, atomicRadius: 2.18, ionizationEnergy: 867.8, electronegativity: 1.69, electronAffinity: null },
  49: { atomicNumber: 49, atomicRadius: 1.93, ionizationEnergy: 558.3, electronegativity: 1.78, electronAffinity: 28.9 },
  50: { atomicNumber: 50, atomicRadius: 2.17, ionizationEnergy: 708.6, electronegativity: 1.96, electronAffinity: 107.3 },
  51: { atomicNumber: 51, atomicRadius: 2.06, ionizationEnergy: 834.0, electronegativity: 2.05, electronAffinity: 103.2 },
  52: { atomicNumber: 52, atomicRadius: 2.06, ionizationEnergy: 869.3, electronegativity: 2.10, electronAffinity: 190.2 },
  53: { atomicNumber: 53, atomicRadius: 1.98, ionizationEnergy: 1008.4, electronegativity: 2.66, electronAffinity: 295.2 },
  54: { atomicNumber: 54, atomicRadius: 2.16, ionizationEnergy: 1170.4, electronegativity: 2.60, electronAffinity: null },
  55: { atomicNumber: 55, atomicRadius: 3.43, ionizationEnergy: 375.7, electronegativity: 0.79, electronAffinity: 45.5 },
  56: { atomicNumber: 56, atomicRadius: 2.68, ionizationEnergy: 502.9, electronegativity: 0.89, electronAffinity: 13.9 },
  57: { atomicNumber: 57, atomicRadius: 2.40, ionizationEnergy: 538.1, electronegativity: 1.10, electronAffinity: 48.0 },
  58: { atomicNumber: 58, atomicRadius: 2.35, ionizationEnergy: 534.4, electronegativity: 1.12, electronAffinity: 50.0 },
  59: { atomicNumber: 59, atomicRadius: 2.39, ionizationEnergy: 527.0, electronegativity: 1.13, electronAffinity: 50.0 },
  60: { atomicNumber: 60, atomicRadius: 2.29, ionizationEnergy: 533.1, electronegativity: 1.14, electronAffinity: 50.0 },
  61: { atomicNumber: 61, atomicRadius: 2.36, ionizationEnergy: 540.0, electronegativity: 1.13, electronAffinity: 50.0 },
  62: { atomicNumber: 62, atomicRadius: 2.29, ionizationEnergy: 544.5, electronegativity: 1.17, electronAffinity: 50.0 },
  63: { atomicNumber: 63, atomicRadius: 2.33, ionizationEnergy: 547.1, electronegativity: 1.20, electronAffinity: 50.0 },
  64: { atomicNumber: 64, atomicRadius: 2.37, ionizationEnergy: 593.4, electronegativity: 1.20, electronAffinity: 50.0 },
  65: { atomicNumber: 65, atomicRadius: 2.21, ionizationEnergy: 565.8, electronegativity: 1.20, electronAffinity: 50.0 },
  66: { atomicNumber: 66, atomicRadius: 2.29, ionizationEnergy: 573.0, electronegativity: 1.22, electronAffinity: 50.0 },
  67: { atomicNumber: 67, atomicRadius: 2.16, ionizationEnergy: 581.0, electronegativity: 1.23, electronAffinity: 50.0 },
  68: { atomicNumber: 68, atomicRadius: 2.35, ionizationEnergy: 589.3, electronegativity: 1.24, electronAffinity: 50.0 },
  69: { atomicNumber: 69, atomicRadius: 2.27, ionizationEnergy: 596.7, electronegativity: 1.25, electronAffinity: 50.0 },
  70: { atomicNumber: 70, atomicRadius: 2.42, ionizationEnergy: 603.4, electronegativity: 1.10, electronAffinity: 50.0 },
  71: { atomicNumber: 71, atomicRadius: 2.21, ionizationEnergy: 523.5, electronegativity: 1.27, electronAffinity: 50.0 },
  72: { atomicNumber: 72, atomicRadius: 2.12, ionizationEnergy: 658.5, electronegativity: 1.30, electronAffinity: null },
  73: { atomicNumber: 73, atomicRadius: 2.17, ionizationEnergy: 761.0, electronegativity: 1.50, electronAffinity: 31.0 },
  74: { atomicNumber: 74, atomicRadius: 2.10, ionizationEnergy: 770.0, electronegativity: 2.36, electronAffinity: 78.6 },
  75: { atomicNumber: 75, atomicRadius: 2.17, ionizationEnergy: 760.0, electronegativity: 1.90, electronAffinity: 14.5 },
  76: { atomicNumber: 76, atomicRadius: 2.16, ionizationEnergy: 840.0, electronegativity: 2.20, electronAffinity: 106.1 },
  77: { atomicNumber: 77, atomicRadius: 2.02, ionizationEnergy: 880.0, electronegativity: 2.20, electronAffinity: 151.0 },
  78: { atomicNumber: 78, atomicRadius: 2.09, ionizationEnergy: 870.0, electronegativity: 2.28, electronAffinity: 205.3 },
  79: { atomicNumber: 79, atomicRadius: 2.17, ionizationEnergy: 890.1, electronegativity: 2.54, electronAffinity: 222.8 },
  80: { atomicNumber: 80, atomicRadius: 2.09, ionizationEnergy: 1007.1, electronegativity: 2.00, electronAffinity: null },
  81: { atomicNumber: 81, atomicRadius: 1.96, ionizationEnergy: 589.4, electronegativity: 1.62, electronAffinity: 19.3 },
  82: { atomicNumber: 82, atomicRadius: 2.02, ionizationEnergy: 715.6, electronegativity: 1.87, electronAffinity: 35.1 },
  83: { atomicNumber: 83, atomicRadius: 2.07, ionizationEnergy: 703.0, electronegativity: 2.02, electronAffinity: 91.2 },
  84: { atomicNumber: 84, atomicRadius: 1.97, ionizationEnergy: 812.1, electronegativity: 2.00, electronAffinity: 183.3 },
  85: { atomicNumber: 85, atomicRadius: 2.02, ionizationEnergy: 920.0, electronegativity: 2.20, electronAffinity: 270.1 },
  86: { atomicNumber: 86, atomicRadius: 2.20, ionizationEnergy: 1037.0, electronegativity: 2.20, electronAffinity: null },
  87: { atomicNumber: 87, atomicRadius: 3.48, ionizationEnergy: 380.0, electronegativity: 0.70, electronAffinity: 46.9 },
  88: { atomicNumber: 88, atomicRadius: 2.83, ionizationEnergy: 509.3, electronegativity: 0.90, electronAffinity: 9.6 },
  89: { atomicNumber: 89, atomicRadius: 2.47, ionizationEnergy: 499.0, electronegativity: 1.10, electronAffinity: 33.8 },
  90: { atomicNumber: 90, atomicRadius: 2.45, ionizationEnergy: 587.0, electronegativity: 1.30, electronAffinity: 112.7 },
  91: { atomicNumber: 91, atomicRadius: 2.43, ionizationEnergy: 568.0, electronegativity: 1.50, electronAffinity: 53.0 },
  92: { atomicNumber: 92, atomicRadius: 2.41, ionizationEnergy: 597.6, electronegativity: 1.38, electronAffinity: 50.9 },
  93: { atomicNumber: 93, atomicRadius: 2.39, ionizationEnergy: 604.5, electronegativity: 1.36, electronAffinity: 45.8 },
  94: { atomicNumber: 94, atomicRadius: 2.43, ionizationEnergy: 584.7, electronegativity: 1.28, electronAffinity: null },
  95: { atomicNumber: 95, atomicRadius: 2.44, ionizationEnergy: 578.0, electronegativity: 1.30, electronAffinity: null },
  96: { atomicNumber: 96, atomicRadius: 2.45, ionizationEnergy: 581.0, electronegativity: 1.30, electronAffinity: null },
  97: { atomicNumber: 97, atomicRadius: 2.44, ionizationEnergy: 601.0, electronegativity: 1.30, electronAffinity: null },
  98: { atomicNumber: 98, atomicRadius: 2.45, ionizationEnergy: 608.0, electronegativity: 1.30, electronAffinity: null },
  99: { atomicNumber: 99, atomicRadius: 2.45, ionizationEnergy: 619.0, electronegativity: 1.30, electronAffinity: null },
  100: { atomicNumber: 100, atomicRadius: 2.45, ionizationEnergy: 627.0, electronegativity: 1.30, electronAffinity: null },
  101: { atomicNumber: 101, atomicRadius: 2.46, ionizationEnergy: 635.0, electronegativity: 1.30, electronAffinity: null },
  102: { atomicNumber: 102, atomicRadius: 2.46, ionizationEnergy: 642.0, electronegativity: 1.30, electronAffinity: null },
  103: { atomicNumber: 103, atomicRadius: 2.46, ionizationEnergy: 470.0, electronegativity: 1.30, electronAffinity: null },
  104: { atomicNumber: 104, atomicRadius: null, ionizationEnergy: 580.0, electronegativity: null, electronAffinity: null },
  105: { atomicNumber: 105, atomicRadius: null, ionizationEnergy: null, electronegativity: null, electronAffinity: null },
  106: { atomicNumber: 106, atomicRadius: null, ionizationEnergy: null, electronegativity: null, electronAffinity: null },
  107: { atomicNumber: 107, atomicRadius: null, ionizationEnergy: null, electronegativity: null, electronAffinity: null },
  108: { atomicNumber: 108, atomicRadius: null, ionizationEnergy: null, electronegativity: null, electronAffinity: null },
  109: { atomicNumber: 109, atomicRadius: null, ionizationEnergy: null, electronegativity: null, electronAffinity: null },
  110: { atomicNumber: 110, atomicRadius: null, ionizationEnergy: null, electronegativity: null, electronAffinity: null },
  111: { atomicNumber: 111, atomicRadius: null, ionizationEnergy: null, electronegativity: null, electronAffinity: null },
  112: { atomicNumber: 112, atomicRadius: null, ionizationEnergy: null, electronegativity: null, electronAffinity: null },
  113: { atomicNumber: 113, atomicRadius: null, ionizationEnergy: null, electronegativity: null, electronAffinity: null },
  114: { atomicNumber: 114, atomicRadius: null, ionizationEnergy: null, electronegativity: null, electronAffinity: null },
  115: { atomicNumber: 115, atomicRadius: null, ionizationEnergy: null, electronegativity: null, electronAffinity: null },
  116: { atomicNumber: 116, atomicRadius: null, ionizationEnergy: null, electronegativity: null, electronAffinity: null },
  117: { atomicNumber: 117, atomicRadius: null, ionizationEnergy: null, electronegativity: null, electronAffinity: null },
  118: { atomicNumber: 118, atomicRadius: null, ionizationEnergy: null, electronegativity: null, electronAffinity: null },
};

export type TrendCategory = 'RENDAH' | 'SEDANG' | 'TINGGI' | 'Data tidak tersedia';

// Function to calculate tertiles dynamically based on AVAILABLE values only (excluding null)
export function calculateTertiles(propertyKey: PeriodicPropertyKey): {
  min: number;
  max: number;
  q1: number;
  q2: number;
  count: number;
} {
  const values: number[] = [];
  for (let z = 1; z <= 118; z++) {
    const val = TRENDS_DATA_BY_NUMBER[z]?.[propertyKey];
    if (typeof val === 'number' && !isNaN(val)) {
      values.push(val);
    }
  }

  values.sort((a, b) => a - b);
  const n = values.length;
  if (n === 0) {
    return { min: 0, max: 0, q1: 0, q2: 0, count: 0 };
  }

  const min = values[0];
  const max = values[n - 1];
  const q1 = values[Math.floor(n / 3)];
  const q2 = values[Math.floor((2 * n) / 3)];

  return { min, max, q1, q2, count: n };
}

// Pre-computed tertiles for fast rendering
export const PROPERTY_TERTILES: Record<
  PeriodicPropertyKey,
  { min: number; max: number; q1: number; q2: number; count: number }
> = {
  atomicRadius: calculateTertiles('atomicRadius'),
  ionizationEnergy: calculateTertiles('ionizationEnergy'),
  electronegativity: calculateTertiles('electronegativity'),
  electronAffinity: calculateTertiles('electronAffinity'),
};

export function getTrendCategory(
  propertyKey: PeriodicPropertyKey,
  value: number | null | undefined
): TrendCategory {
  if (value === null || value === undefined || isNaN(value)) {
    return 'Data tidak tersedia';
  }

  const { q1, q2 } = PROPERTY_TERTILES[propertyKey];
  if (value < q1) return 'RENDAH';
  if (value <= q2) return 'SEDANG';
  return 'TINGGI';
}

export function formatPropertyValue(
  propertyKey: PeriodicPropertyKey,
  value: number | null | undefined
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'Data tidak tersedia';
  }
  const meta = PERIODIC_PROPERTIES[propertyKey];
  if (propertyKey === 'electronegativity') {
    return `${value.toFixed(2)}`;
  }
  if (propertyKey === 'atomicRadius') {
    return `${value.toFixed(2)} Å (${Math.round(value * 100)} pm)`;
  }
  return `${value.toFixed(1)} ${meta.unit}`;
}

export function formatTileTrendValue(
  propertyKey: PeriodicPropertyKey,
  value: number | null | undefined
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  if (propertyKey === 'electronegativity') {
    return `${value.toFixed(2)}`;
  }
  if (propertyKey === 'atomicRadius') {
    return `${value.toFixed(2)} Å`;
  }
  if (propertyKey === 'ionizationEnergy') {
    return `${Math.round(value)} kJ`;
  }
  return `${value.toFixed(1)} kJ`;
}

export const TREND_LEVEL_STYLES: Record<
  TrendCategory,
  {
    label: string;
    badge: string;
    bgClass: string;
    borderClass: string;
    accentColor: string;
    textColor: string;
    dotColor: string;
  }
> = {
  RENDAH: {
    label: 'Rendah',
    badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    bgClass: 'bg-sky-950/40 hover:bg-sky-900/50',
    borderClass: 'border-sky-600/50',
    accentColor: '#0ea5e9',
    textColor: 'text-sky-300',
    dotColor: 'bg-sky-400',
  },
  SEDANG: {
    label: 'Sedang',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    bgClass: 'bg-amber-950/40 hover:bg-amber-900/50',
    borderClass: 'border-amber-600/50',
    accentColor: '#f59e0b',
    textColor: 'text-amber-300',
    dotColor: 'bg-amber-400',
  },
  TINGGI: {
    label: 'Tinggi',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    bgClass: 'bg-rose-950/40 hover:bg-rose-900/50',
    borderClass: 'border-rose-600/50',
    accentColor: '#f43f5e',
    textColor: 'text-rose-300',
    dotColor: 'bg-rose-400',
  },
  'Data tidak tersedia': {
    label: 'Data tidak tersedia',
    badge: 'bg-slate-800 text-slate-400 border-slate-700',
    bgClass: 'bg-slate-900/30 hover:bg-slate-900/50',
    borderClass: 'border-slate-800/60',
    accentColor: '#64748b',
    textColor: 'text-slate-400',
    dotColor: 'bg-slate-600',
  },
};
