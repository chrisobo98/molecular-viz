/**
 * Type Definitions for Molecular Visualization
 *
 * Centralized type definitions ensure type safety across components
 * and make the codebase self-documenting.
 */

/**
 * 3D coordinates in Angstroms (Å)
 * 1 Angstrom = 10⁻¹⁰ meters = 0.1 nanometers
 */
export interface Position3D {
  x: number
  y: number
  z: number
}

/**
 * Atom data from PDB file
 * Maps to ATOM record fields in PDB format
 */
export interface AtomInfo extends Position3D {
  /** Element symbol (C, N, O, H, etc.) */
  elem: string
  /** Residue name for proteins (ALA, GLY, etc.) */
  resn?: string
  /** Residue sequence number */
  resi?: number
  /** Chain identifier (A, B, C, etc.) */
  chain?: string
  /** Atom serial number */
  serial?: number
}

/**
 * Molecule metadata with PDB information
 */
export interface MoleculeData {
  /** Internal identifier */
  id: string
  /** Display name */
  name: string
  /** PDB ID (4-char code) or 'INLINE' for embedded data */
  pdbId: string
  /** Chemical formula with subscripts */
  formula: string
  /** Molecular weight in g/mol */
  weight: number
  /** Brief description */
  description: string
}

/**
 * Visualization style configuration
 */
export interface VisualizationStyle {
  id: string
  name: string
}

/**
 * Color scheme configuration
 */
export interface ColorScheme {
  id: string
  name: string
}

/**
 * Background configuration
 */
export interface Background {
  id: string
  name: string
  color: string
}

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
  key: string
  label: string
  action: () => void
}

/**
 * Molecule statistics for display
 */
export interface MoleculeStats {
  formula: string
  atomCount: number
  weight: string
}

/**
 * 3Dmol.js Viewer interface
 * Represents the WebGL context and rendering operations
 */
export interface Viewer {
  addModel: (data: string, format: string) => Model
  setStyle: (sel: object, style: object) => void
  setBackgroundColor: (color: string | number) => void
  render: () => void
  zoom: (factor: number, animationDuration?: number) => void
  center: (sel?: object, animationDuration?: number) => void
  zoomTo: (sel?: object, animationDuration?: number) => void
  spin: (axis: string | boolean, speed?: number) => void
  setClickable: (sel: object, clickable: boolean, callback: (atom: AtomInfo) => void) => void
  addLabel: (text: string, options: object) => void
  removeAllLabels: () => void
  addCylinder: (start: object, end: object, options: object) => void
  removeAllShapes: () => void
  pngURI: () => string
  clear: () => void
}

/**
 * 3Dmol.js Model interface
 */
export interface Model {
  setStyle: (sel: object, style: object) => void
  addSurface: (type: number, options: object) => void
}

/**
 * Global 3Dmol.js library interface
 */
export interface ThreeDmol {
  createViewer: (element: HTMLElement, config: object) => Viewer
  download: (query: string, viewer: Viewer, options: object, callback: () => void) => void
  SurfaceType: {
    VDW: number
    SAS: number
    SES: number
  }
  elementColors: {
    Jmol: object
    rasmol: object
    defaultColors: object
  }
}

// Extend Window interface globally
declare global {
  interface Window {
    $3Dmol: ThreeDmol
  }
}
