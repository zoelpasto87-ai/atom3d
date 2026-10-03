import { ChemicalElement } from '../types/element';
import { ELEMENTS_P1_P3 } from './elements-p1-p3';
import { ELEMENTS_P4 } from './elements-p4';
import { ELEMENTS_P5 } from './elements-p5';
import { ELEMENTS_P6 } from './elements-p6';
import { ELEMENTS_P7 } from './elements-p7';

export const ELEMENTS: ChemicalElement[] = [
  ...ELEMENTS_P1_P3,
  ...ELEMENTS_P4,
  ...ELEMENTS_P5,
  ...ELEMENTS_P6,
  ...ELEMENTS_P7,
];

// Verify at compile/runtime that we have strictly 118 elements
if (ELEMENTS.length !== 118) {
  console.warn(`[ATOM 3D] Expected 118 elements, found: ${ELEMENTS.length}`);
}

export const ELEMENT_BY_NUMBER: Record<number, ChemicalElement> = {};
export const ELEMENT_BY_SYMBOL: Record<string, ChemicalElement> = {};

ELEMENTS.forEach((element) => {
  ELEMENT_BY_NUMBER[element.atomicNumber] = element;
  ELEMENT_BY_SYMBOL[element.symbol.toLowerCase()] = element;
});

export function getElementByNumber(atomicNumber: number): ChemicalElement | undefined {
  return ELEMENT_BY_NUMBER[atomicNumber];
}

export function getElementBySymbol(symbol: string): ChemicalElement | undefined {
  return ELEMENT_BY_SYMBOL[symbol.toLowerCase()];
}

// Shell letter names for Bohr model visualization
export const SHELL_NAMES = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];

export const TOTAL_ELEMENTS_COUNT = 118;
