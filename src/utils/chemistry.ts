import { ChemicalElement, ElementCategory } from '../types/element';
import { SHELL_NAMES } from '../data/elements';

export interface AtomicStructure {
  protons: number;
  electrons: number;
  neutrons: number;
  massNumber: number;
}

export function calculateAtomicStructure(element: ChemicalElement): AtomicStructure {
  const protons = element.atomicNumber;
  const electrons = element.atomicNumber;
  
  let massNumber: number;
  if (typeof element.atomicMass === 'number') {
    massNumber = Math.round(element.atomicMass);
  } else {
    // If it's a string like "[294]"
    const num = parseInt(element.atomicMass.replace(/[^0-9]/g, ''), 10);
    massNumber = isNaN(num) ? protons * 2 : num;
  }
  
  const neutrons = Math.max(0, massNumber - protons);
  
  return {
    protons,
    electrons,
    neutrons,
    massNumber,
  };
}

export function formatAtomicMass(mass: number | string): string {
  if (typeof mass === 'number') {
    return mass.toFixed(mass >= 100 ? 2 : 3);
  }
  return mass;
}

export interface ShellDetail {
  shellIndex: number; // 0, 1, 2...
  shellLetter: string; // K, L, M...
  electronCount: number;
  maxElectrons: number; // 2n² formula: 2, 8, 18, 32...
  isValence: boolean;
}

export function getShellDetails(shells: number[]): ShellDetail[] {
  return shells.map((count, index) => {
    const n = index + 1;
    const maxElectrons = 2 * n * n;
    const isValence = index === shells.length - 1;
    return {
      shellIndex: index,
      shellLetter: SHELL_NAMES[index] || `N${n}`,
      electronCount: count,
      maxElectrons,
      isValence,
    };
  });
}

export function filterElements(
  elements: ChemicalElement[],
  searchQuery: string,
  selectedCategory: ElementCategory | 'Semua'
): ChemicalElement[] {
  const query = searchQuery.trim().toLowerCase();

  return elements.filter((element) => {
    // 1. Filter by category
    if (selectedCategory !== 'Semua' && element.category !== selectedCategory) {
      return false;
    }

    // 2. Filter by search query
    if (!query) return true;

    // Search by exact symbol
    if (element.symbol.toLowerCase() === query) return true;

    // Search by atomic number
    if (element.atomicNumber.toString() === query) return true;

    // Search partial in symbol, name, or latinName
    if (element.symbol.toLowerCase().includes(query)) return true;
    if (element.name.toLowerCase().includes(query)) return true;
    if (element.latinName && element.latinName.toLowerCase().includes(query)) return true;
    if (element.atomicNumber.toString().includes(query)) return true;

    return false;
  });
}
