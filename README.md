# Molecular Visualizer

A WebGL-powered 3D molecular visualization application built with Nuxt 3, TypeScript, and 3Dmol.js.

![Molecular Visualizer](https://img.shields.io/badge/Nuxt-3.x-00DC82?style=flat-square&logo=nuxt.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)
![3Dmol.js](https://img.shields.io/badge/3Dmol.js-WebGL-orange?style=flat-square)

## Overview

This application demonstrates professional-grade molecular visualization using WebGL for hardware-accelerated 3D rendering. It showcases modern Vue 3 architecture patterns, TypeScript best practices, and scientific visualization techniques.

**Built for OpenEye/Cadence Molecular Sciences demo.**

## Features

### Core Visualization
- **WebGL-Powered Rendering**: Hardware-accelerated 3D graphics using 3Dmol.js
- **PDB Database Search**: Load ANY molecule from the RCSB Protein Data Bank (200,000+ structures)
- **Preset Molecules**: Caffeine, Aspirin, Glucose, Ethanol for quick demos
- **Visualization Styles**: Stick, Sphere, Line, Cross representations
- **Color Schemes**: Jmol (CPK), Carbon, Spectrum, Chain coloring
- **Background Options**: White, Black, Gray backgrounds

### Interactive Tools
- **Atom Selection**: Click atoms to view element name (full name, e.g., "Oxygen"), position, residue, and chain info
- **Distance Measurement**: Measure distances between atoms in Angstroms (Å) with guided instructions
- **Auto-Rotate**: Continuous Y-axis rotation for presentation
- **Atom Labels**: Display element symbols on atoms (optimized for performance, max 50 labels)
- **Screenshot Export**: Save current view as PNG
- **Comparison Mode**: Side-by-side split-screen view for comparing two molecules

### User Experience
- **Dark Modern UI**: Sleek dark theme with frosted glass effects and blue accents
- **Collapsible Controls**: Accordion-style control panels for better space management
- **Quick Tools Bar**: Essential tools (Spin, Measure, Labels, Reset, Screenshot, Compare) accessible below the viewer
- **Keyboard Shortcuts**: Full keyboard control (press `?` for help)
- **Responsive Design**: Works on desktop, tablet, and mobile with proper breakpoints
- **Loading States**: Visual feedback during molecule loading
- **Intuitive Measure Mode**: Step-by-step instructions for distance measurement
- **Error Handling**: Clear error messages for invalid PDB IDs or failed loads

## Tech Stack

- **Framework**: Nuxt 3.x with Vue 3 Composition API
- **Language**: TypeScript (strict mode)
- **3D Rendering**: 3Dmol.js (WebGL-based molecular viewer)
- **Icons**: Nuxt Icon with MDI icon set
- **Styling**: Scoped CSS with BEM-like naming

## Architecture

The project follows enterprise-grade architecture patterns:

```
app/
├── app.vue                    # Main application component
├── assets/css/main.css        # Global styles and resets
├── types/                     # TypeScript type definitions
│   └── molecule.ts            # Interfaces for atoms, molecules, viewer
├── constants/                 # Configuration and data
│   └── molecules.ts           # Molecule data, styles, color schemes
├── composables/               # Reusable business logic
│   ├── useMoleculeViewer.ts   # Core viewer functionality
│   └── useKeyboardShortcuts.ts # Keyboard event handling
└── components/
    ├── ui/                    # Generic reusable components
    │   ├── ControlCard.vue    # Collapsible card container
    │   ├── ButtonGroup.vue    # Selection button group
    │   └── ActionButton.vue   # Action button with icon
    └── molecules/             # Domain-specific components
        ├── StatsCard.vue      # Molecule statistics display
        ├── HelpModal.vue      # Keyboard shortcuts modal
        ├── AtomInfoCard.vue   # Selected atom information
        ├── MeasurementCard.vue # Distance measurement display
        ├── LoadingOverlay.vue # Loading spinner
        ├── ControlPanel.vue   # All control sections
        ├── PdbSearch.vue      # PDB database search input
        ├── ComparisonMode.vue # Split-screen comparison view
        └── SingleViewer.vue   # Reusable viewer for comparison
```

### Design Principles

- **DRY (Don't Repeat Yourself)**: Reusable components and composables
- **Separation of Concerns**: Logic in composables, presentation in components
- **Type Safety**: Strict TypeScript throughout
- **Single Source of Truth**: Constants file for all configuration
- **Performance Optimized**: Label limiting, efficient WebGL usage

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/chrisobo98/molecular-viz.git
cd molecular-viz

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

### Build for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `R` | Reset view |
| `S` | Toggle auto-rotate |
| `1` | Load Caffeine |
| `2` | Load Aspirin |
| `3` | Load Glucose |
| `4` | Load Ethanol |
| `Space` | Take screenshot |
| `M` | Toggle measure mode |
| `L` | Toggle atom labels |
| `?` | Show help modal |

## Mouse Controls

- **Left Click + Drag**: Rotate molecule
- **Right Click + Drag**: Pan view
- **Scroll**: Zoom in/out
- **Click Atom**: Select atom (shows info)

## Technical Details

### WebGL & 3Dmol.js

3Dmol.js is a WebGL-based molecular viewer that provides:

- GPU-accelerated rendering for smooth 60fps interaction
- Efficient atom picking using color-coded picking buffers
- Multiple rendering styles (stick, sphere, surface)
- Built-in PDB file parsing and database fetching

### PDB File Format

Molecules are loaded from the RCSB Protein Data Bank using 4-character PDB IDs:

- **Caffeine**: 1UAO
- **Aspirin**: 2OYE
- **Glucose**: 3W7B
- **Ethanol**: Inline PDB (simple molecule)

### Distance Calculation

Atomic distances are calculated using 3D Euclidean distance:

```
d = √[(x₂-x₁)² + (y₂-y₁)² + (z₂-z₁)²]
```

Results are displayed in Angstroms (Å), where 1Å = 10⁻¹⁰ meters.

### Performance Optimizations

- **Label Limiting**: Max 50 labels, skip hydrogens to prevent browser freeze
- **Efficient Re-renders**: Only update WebGL when necessary
- **Lazy Loading**: 3Dmol.js loaded via CDN after DOM ready

## Component API

### useMoleculeViewer Composable

Main composable for all viewer functionality:

```typescript
const {
  // Refs
  viewerContainer,      // Template ref for viewer element
  isLoading,            // Loading state
  currentMolecule,      // Current molecule ID
  currentStyle,         // Current visualization style
  currentColorScheme,   // Current color scheme
  currentBackground,    // Current background
  isSpinning,           // Auto-rotate state
  showLabels,           // Labels visibility
  measureMode,          // Measure mode state
  selectedAtom,         // Currently selected atom
  measurementDistance,  // Measured distance
  searchError,          // PDB search error message

  // Computed
  currentMoleculeName,  // Display name of current molecule
  moleculeStats,        // Formula, atom count, weight
  hasFirstAtom,         // Whether first measurement atom is selected

  // Methods
  initViewer,           // Initialize/reinitialize the viewer
  loadMolecule,         // Load preset molecule by ID
  searchPDB,            // Search and load from PDB database
  clearSearchError,     // Clear search error message
  setStyle,             // Set visualization style
  setColorScheme,       // Set color scheme
  setBackground,        // Set background color
  resetView,            // Reset to default view
  toggleSpin,           // Toggle auto-rotate
  toggleLabels,         // Toggle atom labels
  toggleMeasureMode,    // Toggle measure mode
  clearMeasurement,     // Clear current measurement
  takeScreenshot        // Export as PNG
} = useMoleculeViewer()
```

## PDB Database Search

Search and load any molecule from the RCSB Protein Data Bank:

```typescript
// Search for a molecule by PDB ID
await searchPDB('1CRN')  // Crambin protein
await searchPDB('4HHB')  // Hemoglobin
await searchPDB('1BNA')  // DNA double helix
```

### Popular PDB IDs to Try

| PDB ID | Molecule | Description |
|--------|----------|-------------|
| 1CRN | Crambin | Small plant protein (46 residues) |
| 4HHB | Hemoglobin | Oxygen-carrying protein |
| 1BNA | B-DNA | Classic DNA double helix |
| 2POR | Porin | Membrane channel protein |
| 1GFL | GFP | Green fluorescent protein |
| 3J3Y | Ribosome | Large macromolecular complex |

## Molecules Data

| Molecule | Formula | Molecular Weight | PDB ID |
|----------|---------|-----------------|--------|
| Caffeine | C₈H₁₀N₄O₂ | 194.19 g/mol | 1UAO |
| Aspirin | C₉H₈O₄ | 180.16 g/mol | 2OYE |
| Glucose | C₆H₁₂O₆ | 180.16 g/mol | 3W7B |
| Ethanol | C₂H₆O | 46.07 g/mol | Inline |

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

Requires WebGL support.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Author

**Christopher Bermudez**
- Website: [christopherbermudez.com](https://christopherbermudez.com)

---

*WebGL-powered molecular visualization demo for OpenEye/Cadence Molecular Sciences*
