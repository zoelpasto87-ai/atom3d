export type ElementCategory =
  | 'Logam Alkali'
  | 'Logam Alkali Tanah'
  | 'Logam Transisi'
  | 'Logam Pascatransisi'
  | 'Metaloid'
  | 'Nonlogam'
  | 'Halogen'
  | 'Gas Mulia'
  | 'Lantanida'
  | 'Aktinida';

export type MatterState = 'Padat' | 'Cair' | 'Gas' | 'Sintetis';

export type BlockType = 's' | 'p' | 'd' | 'f';

export interface ChemicalElement {
  atomicNumber: number;
  symbol: string;
  name: string;
  latinName?: string;
  atomicMass: number | string;
  group: number | null; // 1-18, null for lanthanides/actinides
  period: number; // 1-7
  block: BlockType;
  category: ElementCategory;
  state: MatterState;
  electronConfiguration: string;
  electronShells: number[]; // e.g. [2, 8, 1] for K, L, M
  valenceElectrons: number | null;
  oxidationStates: string;
  electronegativity?: number | null; // Pauling scale
  density?: number | null; // g/cm³ or g/L for gases
  meltingPoint?: number | null; // in Celsius
  boilingPoint?: number | null; // in Celsius
  discoveryYear?: number | string;
  discoveredBy?: string;
  description: string;
  uses: string;
  reactivitySummary?: string;
}
