export type MatterState = 'Padat' | 'Cair' | 'Gas';
export type MaterialCategory = 'Pelarut' | 'Asam' | 'Garam' | 'Basa' | 'Bahan Alami' | 'Organik';

export interface Material {
  id: string;
  name: string;
  chemicalFormula: string;
  category: MaterialCategory;
  initialColor: string; // Color representation
  liquidColor: string; // Tint when poured in beaker
  matterState: MatterState;
  appearance: string;
  description: string;
  containedElements: number[]; // Atomic numbers Z for Phase 2/3 Atom 3D linking
  safetyNote?: string;
}

export const MATERIALS: Material[] = [
  {
    id: 'air',
    name: 'Air',
    chemicalFormula: 'H₂O',
    category: 'Pelarut',
    initialColor: '#38bdf8',
    liquidColor: 'rgba(56, 189, 248, 0.25)',
    matterState: 'Cair',
    appearance: 'Cairan bening, tidak berwarna dan tidak berbau',
    description: 'Pelarut universal polar yang melarutkan banyak senyawa ionik dan molekuler polar.',
    containedElements: [1, 8], // H, O
  },
  {
    id: 'cuka',
    name: 'Cuka Dapur (Asam Asetat)',
    chemicalFormula: 'CH₃COOH',
    category: 'Asam',
    initialColor: '#f1f5f9',
    liquidColor: 'rgba(241, 245, 249, 0.28)',
    matterState: 'Cair',
    appearance: 'Cairan bening tidak berwarna dengan aroma menyengat khas asam',
    description: 'Larutan asam asetat encer (sekitar 4-6%) yang merupakan asam lemah organik.',
    containedElements: [1, 6, 8], // H, C, O
  },
  {
    id: 'soda_kue',
    name: 'Soda Kue (Natrium Bikarbonat)',
    chemicalFormula: 'NaHCO₃',
    category: 'Garam',
    initialColor: '#ffffff',
    liquidColor: 'rgba(255, 255, 255, 0.4)',
    matterState: 'Padat',
    appearance: 'Serbuk kristal putih halus',
    description: 'Senyawa garam basa yang mudah melepaskan gas karbon dioksida bila bereaksi dengan senyawa asam.',
    containedElements: [11, 1, 6, 8], // Na, H, C, O
  },
  {
    id: 'garam',
    name: 'Garam Dapur (Natrium Klorida)',
    chemicalFormula: 'NaCl',
    category: 'Garam',
    initialColor: '#e2e8f0',
    liquidColor: 'rgba(226, 232, 240, 0.3)',
    matterState: 'Padat',
    appearance: 'Kristal putih padat berbentuk kubus halus',
    description: 'Garam ionik netral yang terdisosiasi sempurna menjadi ion natrium (Na⁺) dan ion klorida (Cl⁻) dalam air.',
    containedElements: [11, 17], // Na, Cl
  },
  {
    id: 'gula',
    name: 'Gula Pasir (Sukrosa)',
    chemicalFormula: 'C₁₂H₂₂O₁₁',
    category: 'Organik',
    initialColor: '#fef08a',
    liquidColor: 'rgba(254, 240, 138, 0.3)',
    matterState: 'Padat',
    appearance: 'Kristal putih kekuningan transparan',
    description: 'Senyawa karbohidrat disakarida yang larut dalam air membentuk larutan molekuler tanpa menghasilkan zat baru.',
    containedElements: [6, 1, 8], // C, H, O
  },
  {
    id: 'air_jeruk',
    name: 'Air Jeruk (Mengandung Asam Sitrat)',
    chemicalFormula: 'C₆H₈O₇ + H₂O',
    category: 'Bahan Alami',
    initialColor: '#fbbf24',
    liquidColor: 'rgba(251, 191, 36, 0.45)',
    matterState: 'Cair',
    appearance: 'Cairan kuning agak keruh dengan rasa dan aroma asam sitrus',
    description: 'Mengandung asam sitrat alami (asam trikarboksilat) yang dapat mendonorkan proton H⁺ pada garam bikarbonat.',
    containedElements: [6, 1, 8], // C, H, O
  },
  {
    id: 'larutan_asam',
    name: 'Larutan Asam Encer (HCl)',
    chemicalFormula: 'HCl(aq)',
    category: 'Asam',
    initialColor: '#f87171',
    liquidColor: 'rgba(248, 113, 113, 0.25)',
    matterState: 'Cair',
    appearance: 'Larutan bening dengan ion hidronium (H₃O⁺)',
    description: 'Asam kuat yang terionisasi sempurna dalam air menghasilkan ion H⁺ dan ion Cl⁻.',
    containedElements: [1, 17], // H, Cl
  },
  {
    id: 'larutan_basa',
    name: 'Larutan Basa Encer (NaOH)',
    chemicalFormula: 'NaOH(aq)',
    category: 'Basa',
    initialColor: '#818cf8',
    liquidColor: 'rgba(129, 140, 248, 0.25)',
    matterState: 'Cair',
    appearance: 'Larutan bening licin dengan ion hidroksida (OH⁻)',
    description: 'Basa kuat yang bereaksi cepat dengan asam menghasilkan garam dan molekul air (reaksi netralisasi).',
    containedElements: [11, 8, 1], // Na, O, H
  },
  {
    id: 'larutan_garam',
    name: 'Larutan Garam (Air Garam)',
    chemicalFormula: 'NaCl(aq)',
    category: 'Pelarut',
    initialColor: '#38bdf8',
    liquidColor: 'rgba(56, 189, 248, 0.3)',
    matterState: 'Cair',
    appearance: 'Cairan bening mengandung ion bebas Na⁺ dan Cl⁻',
    description: 'Larutan elektrolit kuat yang dapat menghantarkan arus listrik karena adanya ion bergerak bebas.',
    containedElements: [11, 17, 1, 8], // Na, Cl, H, O
  },
];

export type VisualEffectType =
  | 'effervescence' // Bubbles & foam (gas release)
  | 'citrus_foam' // Yellowish foam & bubbles
  | 'dissolution_salt' // White salt crystals dissolve into clear water
  | 'dissolution_sugar' // Sugar crystals dissolve into clear water
  | 'neutralization' // Warm slight clear mixing
  | 'none';

export interface ChemicalProduct {
  name: string;
  formula: string;
  state: string; // (g), (l), (aq), (s)
}

export interface Experiment {
  id: string;
  title: string;
  materials: [string, string]; // [materialId1, materialId2]
  chemicalEquation: string;
  wordEquation: string;
  products: ChemicalProduct[];
  observations: string[];
  whatHappened: string;
  gasProduced?: string;
  precipitateProduced?: string;
  isChemicalChange: boolean; // True for chemical reaction, False for physical dissolution
  visualEffect: VisualEffectType;
  primaryElements: number[]; // Elements to explore in Atom 3D
  particleNotes: string;
  safetyNote: string;
  predictionOutcome:
    | 'Terbentuk gas'
    | 'Bahan larut'
    | 'Terbentuk endapan'
    | 'Perubahan warna'
    | 'Tidak terjadi perubahan';
}

export const EXPERIMENTS: Experiment[] = [
  {
    id: 'cuka_soda_kue',
    title: 'Cuka Dapur + Soda Kue',
    materials: ['cuka', 'soda_kue'],
    chemicalEquation: 'CH₃COOH(aq) + NaHCO₃(s) → CH₃COONa(aq) + H₂O(l) + CO₂(g)↑',
    wordEquation:
      'Asam Asetat + Natrium Bikarbonat → Natrium Asetat + Air + Gas Karbon Dioksida',
    products: [
      { name: 'Natrium Asetat', formula: 'CH₃COONa', state: '(aq)' },
      { name: 'Air', formula: 'H₂O', state: '(l)' },
      { name: 'Karbon Dioksida', formula: 'CO₂', state: '(g)' },
    ],
    observations: [
      'Muncul gelembung buih putih secara aktif dan cepat.',
      'Terbentuk gas karbon dioksida (CO₂) yang naik ke permukaan.',
      'Suhu wadah terasa sedikit lebih dingin (reaksi endotermik menyerap kalor).',
      'Serbuk padat soda kue bereaksi habis menyatu menjadi larutan bening natrium asetat.',
    ],
    whatHappened:
      'Asam asetat (CH₃COOH) dalam cuka mendonorkan proton (H⁺) kepada ion bikarbonat (HCO₃⁻) pada soda kue. Hal ini membentuk asam karbonat (H₂CO₃) sementara yang langsung terurai spontan menjadi air (H₂O) dan gas karbon dioksida (CO₂). Gas inilah yang kita amati sebagai gelembung buih mendesis.',
    gasProduced: 'Karbon Dioksida (CO₂)',
    isChemicalChange: true,
    visualEffect: 'effervescence',
    primaryElements: [1, 6, 8, 11], // H, C, O, Na
    particleNotes:
      'Molekul asam asetat melepaskan H⁺ ke ion HCO₃⁻. Ikatan kovalen terputus dan terbentuk kembali menjadi molekul gas CO₂ nonpolar yang cepat melepaskan diri dari kisi cairan ke udara.',
    safetyNote:
      'Aman untuk demonstrasi rumah, namun hindari terkena percikan cuka ke mata karena bersifat asam ringan.',
    predictionOutcome: 'Terbentuk gas',
  },
  {
    id: 'air_garam',
    title: 'Air + Garam Dapur',
    materials: ['air', 'garam'],
    chemicalEquation: 'NaCl(s) xrightarrow{H₂O} Na⁺(aq) + Cl⁻(aq)',
    wordEquation: 'Natrium Klorida (padat) → Ion Natrium (terhidrasi) + Ion Klorida (terhidrasi)',
    products: [
      { name: 'Ion Natrium Terlarut', formula: 'Na⁺', state: '(aq)' },
      { name: 'Ion Klorida Terlarut', formula: 'Cl⁻', state: '(aq)' },
    ],
    observations: [
      'Kristal garam putih perlahan berkurang dan menghilang dari dasar wadah.',
      'Larutan tetap jernih dan homogen tanpa pembentukan gas maupun endapan baru.',
      'Massa larutan bertambah, dan larutan kini mampu menghantarkan arus listrik (larutan elektrolit).',
    ],
    whatHappened:
      'Proses ini merupakan pelarutan fisik dan disosiasi ionik, bukan pembentukan senyawa kimia baru. Molekul air (H₂O) yang bersifat polar mengelilingi ion Na⁺ dengan ujung oksigen parsial negatif, dan mengelilingi ion Cl⁻ dengan ujung hidrogen parsial positif, memisahkan kisi kristal menjadi ion-ion bebas (hidrasi).',
    isChemicalChange: false,
    visualEffect: 'dissolution_salt',
    primaryElements: [11, 17, 1, 8], // Na, Cl, H, O
    particleNotes:
      'Kisi kristal ionik NaCl ditarik lepas oleh momen dipol air. Kation Na⁺ dan anion Cl⁻ kini bergerak bebas di antara molekul-molekul H₂O.',
    safetyNote:
      'Bahan dapur umum yang tidak beracun dan aman dipelajari di laboratorium.',
    predictionOutcome: 'Bahan larut',
  },
  {
    id: 'air_gula',
    title: 'Air + Gula Pasir',
    materials: ['air', 'gula'],
    chemicalEquation: 'C₁₂H₂₂O₁₁(s) xrightarrow{H₂O} C₁₂H₂₂O₁₁(aq)',
    wordEquation: 'Sukrosa (padat) → Sukrosa (larut dalam air)',
    products: [{ name: 'Larutan Sukrosa', formula: 'C₁₂H₂₂O₁₁', state: '(aq)' }],
    observations: [
      'Kristal gula transparan perlahan menghilang setelah diaduk ke dalam air.',
      'Larutan menjadi homogen sempurna dan tetap jernih.',
      'Tidak ada gelembung gas atau perubahan warna yang menandakan reaksi kimia.',
    ],
    whatHappened:
      'Gula larut dalam air melalui pembentukan ikatan hidrogen antara gugus hidroksil (-OH) molekul sukrosa dengan molekul air. Tidak ada ikatan kovalen yang putus atau senyawa baru yang terbentuk, sehingga proses ini adalah perubahan fisika murni.',
    isChemicalChange: false,
    visualEffect: 'dissolution_sugar',
    primaryElements: [6, 1, 8], // C, H, O
    particleNotes:
      'Molekul sukrosa tetap utuh sebagai unit molekuler C₁₂H₂₂O₁₁, tetapi terdispersi merata di antara molekul air berkat gaya antarmolekul ikatan hidrogen.',
    safetyNote:
      'Bahan aman non-reaktif untuk demonstrasi perbedaan antara pelarutan molekuler dan disosiasi ionik.',
    predictionOutcome: 'Bahan larut',
  },
  {
    id: 'air_jeruk_soda_kue',
    title: 'Air Jeruk + Soda Kue',
    materials: ['air_jeruk', 'soda_kue'],
    chemicalEquation: 'H₃C₆H₅O₇(aq) + 3NaHCO₃(s) → Na₃C₆H₅O₇(aq) + 3H₂O(l) + 3CO₂(g)↑',
    wordEquation:
      'Asam Sitrat + Natrium Bikarbonat → Natrium Sitrat + Air + Gas Karbon Dioksida',
    products: [
      { name: 'Natrium Sitrat', formula: 'Na₃C₆H₅O₇', state: '(aq)' },
      { name: 'Air', formula: 'H₂O', state: '(l)' },
      { name: 'Gas Karbon Dioksida', formula: 'CO₂', state: '(g)' },
    ],
    observations: [
      'Terjadi pembuihan hebat dengan busa kuning kekuningan bergelembung.',
      'Pelepasan gas karbon dioksida (CO₂) cepat yang mengangkat lapisan cairan jeruk.',
      'Rasa asam tajam air jeruk berkurang drastis karena dinetralkan oleh bikarbonat.',
    ],
    whatHappened:
      'Asam sitrat dalam air jeruk memiliki 3 gugus asam karboksilat yang bereaksi stoikiometris dengan 3 molekul natrium bikarbonat. Reaksi menghasilkan garam natrium sitrat dan membebaskan gas karbon dioksida yang membentuk buih busa berlimpah.',
    gasProduced: 'Karbon Dioksida (CO₂)',
    isChemicalChange: true,
    visualEffect: 'citrus_foam',
    primaryElements: [6, 1, 8, 11], // C, H, O, Na
    particleNotes:
      'Setiap satu molekul asam sitrat mengikat 3 kation natrium sambil melepaskan 3 molekul air dan 3 molekul gas karbon dioksida.',
    safetyNote:
      'Reaksi menghasilkan busa yang mengembang cepat, gunakan wadah dengan ruang udara cukup.',
    predictionOutcome: 'Terbentuk gas',
  },
  {
    id: 'asam_basa_netralisasi',
    title: 'Larutan Asam (HCl) + Larutan Basa (NaOH)',
    materials: ['larutan_asam', 'larutan_basa'],
    chemicalEquation: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)',
    wordEquation: 'Asam Klorida + Natrium Hidroksida → Natrium Klorida + Air',
    products: [
      { name: 'Natrium Klorida', formula: 'NaCl', state: '(aq)' },
      { name: 'Air', formula: 'H₂O', state: '(l)' },
    ],
    observations: [
      'Kedua larutan bening bercampur tetap jernih tanpa gelembung gas terlihat langsung.',
      'Terjadi kenaikan suhu teraba pada dinding gelas (reaksi eksotermik netralisasi).',
      'Sifat asam dan basa saling meniadakan membentuk larutan garam netral.',
    ],
    whatHappened:
      'Ion H⁺ dari asam bereaksi langsung dengan ion OH⁻ dari basa membentuk molekul air (H⁺ + OH⁻ → H₂O). Reaksi ini membebaskan energi panas pembentukan ikatan kovalen polar (entalpi netralisasi).',
    isChemicalChange: true,
    visualEffect: 'neutralization',
    primaryElements: [1, 17, 11, 8], // H, Cl, Na, O
    particleNotes:
      'Ion hidrogen (H⁺) dan hidroksida (OH⁻) bergabung membentuk molekul H₂O netral, menyisakan ion penonton Na⁺ dan Cl⁻ terhidrasi.',
    safetyNote:
      'Asam dan basa kuat harus selalu ditangani dengan kacamata pelindung dan sarung tangan laboratorium.',
    predictionOutcome: 'Tidak terjadi perubahan',
  },
];

// Helper to look up an experiment by two material IDs (order independent)
export function findExperiment(materialIdA: string, materialIdB: string): Experiment | null {
  if (!materialIdA || !materialIdB || materialIdA === materialIdB) return null;

  return (
    EXPERIMENTS.find(
      (exp) =>
        (exp.materials[0] === materialIdA && exp.materials[1] === materialIdB) ||
        (exp.materials[1] === materialIdA && exp.materials[0] === materialIdB)
    ) || null
  );
}

export function getMaterialById(id: string): Material | undefined {
  return MATERIALS.find((m) => m.id === id);
}
