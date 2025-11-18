/**
 * Molecular Data Constants
 *
 * Single source of truth for all molecular visualization configuration.
 * Centralizing data prevents duplication and makes updates trivial.
 */

import type { MoleculeData, VisualizationStyle, ColorScheme, Background } from '~/types/molecule'

/**
 * Available molecules with PDB IDs and chemical properties
 *
 * PDB ID Format: 4-character alphanumeric codes assigned by RCSB
 * - First character: typically 1-9
 * - Remaining: alphanumeric
 */
export const MOLECULES: MoleculeData[] = [
  {
    id: 'caffeine',
    name: 'Caffeine',
    pdbId: '1UAO',
    formula: 'C₈H₁₀N₄O₂',
    weight: 194.19,
    description: 'Stimulant found in coffee and tea'
  },
  {
    id: 'aspirin',
    name: 'Aspirin',
    pdbId: '2OYE',
    formula: 'C₉H₈O₄',
    weight: 180.16,
    description: 'Anti-inflammatory and pain reliever'
  },
  {
    id: 'glucose',
    name: 'Glucose',
    pdbId: '3W7B',
    formula: 'C₆H₁₂O₆',
    weight: 180.16,
    description: 'Primary energy source for cells'
  },
  {
    id: 'ethanol',
    name: 'Ethanol',
    pdbId: 'INLINE',
    formula: 'C₂H₆O',
    weight: 46.07,
    description: 'Alcohol found in beverages'
  }
]

/**
 * Atom counts for each molecule (by PDB ID)
 * Used for stats display
 */
export const ATOM_COUNTS: Record<string, number> = {
  '1UAO': 24,   // Caffeine
  '2OYE': 21,   // Aspirin
  '3W7B': 24,   // Glucose
  'INLINE': 9   // Ethanol
}

/**
 * Visualization styles available in 3Dmol.js
 *
 * Each style uses different WebGL rendering techniques:
 * - Stick: Cylinders for bonds, small spheres for atoms
 * - Sphere: Van der Waals spheres showing atomic radii
 * - Line: Simple GL_LINES primitives (fastest)
 * - Cross: Cross-shaped markers at atom positions
 */
export const VISUALIZATION_STYLES: VisualizationStyle[] = [
  { id: 'stick', name: 'Stick' },
  { id: 'sphere', name: 'Sphere' },
  { id: 'line', name: 'Line' },
  { id: 'cross', name: 'Cross' }
]

/**
 * Color schemes for atom coloring
 *
 * - Jmol: Standard CPK coloring (C=gray, N=blue, O=red)
 * - Carbon: All carbons green, others element colors
 * - Spectrum: Rainbow gradient by atom index
 * - Chain: Different color per protein chain
 */
export const COLOR_SCHEMES: ColorScheme[] = [
  { id: 'Jmol', name: 'Jmol' },
  { id: 'carbon', name: 'Carbon' },
  { id: 'spectrum', name: 'Spectrum' },
  { id: 'chain', name: 'Chain' }
]

/**
 * Background options for the viewer
 */
export const BACKGROUNDS: Background[] = [
  { id: 'white', name: 'White', color: 'white' },
  { id: 'black', name: 'Black', color: 'black' },
  { id: 'gray', name: 'Gray', color: '#1a1a2e' }
]

/**
 * Inline PDB data for ethanol molecule
 *
 * PDB FORMAT:
 * - Columns 1-6: Record type (ATOM)
 * - Columns 7-11: Atom serial number
 * - Columns 13-16: Atom name
 * - Columns 18-20: Residue name
 * - Column 22: Chain identifier
 * - Columns 23-26: Residue sequence number
 * - Columns 31-38: X coordinate (Angstroms)
 * - Columns 39-46: Y coordinate
 * - Columns 47-54: Z coordinate
 * - Columns 77-78: Element symbol
 */
export const ETHANOL_PDB = `COMPND    ETHANOL
AUTHOR    GENERATED FOR MOLECULAR VISUALIZER
ATOM      1  C1  ETH A   1      -0.757   0.429   0.000  1.00  0.00           C
ATOM      2  C2  ETH A   1       0.757  -0.429   0.000  1.00  0.00           C
ATOM      3  O   ETH A   1       1.584   0.720   0.000  1.00  0.00           O
ATOM      4  H1  ETH A   1      -1.164   0.437   1.014  1.00  0.00           H
ATOM      5  H2  ETH A   1      -0.537   1.450  -0.333  1.00  0.00           H
ATOM      6  H3  ETH A   1      -1.497   0.003  -0.681  1.00  0.00           H
ATOM      7  H4  ETH A   1       0.537  -1.450   0.333  1.00  0.00           H
ATOM      8  H5  ETH A   1       1.164  -0.437  -1.014  1.00  0.00           H
ATOM      9  H6  ETH A   1       2.484   0.400   0.000  1.00  0.00           H
END`

/**
 * Keyboard shortcuts configuration
 */
export const KEYBOARD_SHORTCUTS = [
  { key: 'R', label: 'Reset View' },
  { key: 'S', label: 'Toggle Spin' },
  { key: '1', label: 'Load Caffeine' },
  { key: '2', label: 'Load Aspirin' },
  { key: '3', label: 'Load Glucose' },
  { key: '4', label: 'Load Ethanol' },
  { key: 'Space', label: 'Screenshot' },
  { key: 'M', label: 'Toggle Measure' },
  { key: 'L', label: 'Toggle Labels' },
  { key: '?', label: 'Show Help' }
]

/**
 * Default viewer configuration
 */
export const VIEWER_CONFIG = {
  backgroundColor: 'white',
  antialias: true,
  defaultMolecule: 'caffeine',
  defaultStyle: 'stick',
  defaultColorScheme: 'Jmol',
  defaultBackground: 'white',
  zoomFactor: 0.8,
  animationDuration: 500,
  spinAxis: 'y',
  spinSpeed: 1
}

/**
 * Helper to find molecule by ID
 */
export const getMoleculeById = (id: string): MoleculeData | undefined =>
  MOLECULES.find(m => m.id === id)

/**
 * Helper to find background by ID
 */
export const getBackgroundById = (id: string): Background | undefined =>
  BACKGROUNDS.find(b => b.id === id)

/**
 * Helper to get atom count for a PDB ID
 */
export const getAtomCount = (pdbId: string): number =>
  ATOM_COUNTS[pdbId] || 0
