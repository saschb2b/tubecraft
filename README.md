# TubeCraft

<p align="center">
  <strong>A powerful 3D tube generator for makers and engineers</strong>
  <br />
  Design custom tubes, pipes, and connectors for 3D printing with real-time preview
</p>

<p align="center">
  <a href="https://github.com/saschb2b/tubecraft">
    <img src="https://img.shields.io/github/stars/saschb2b/tubecraft?style=social" alt="GitHub Stars" />
  </a>
  <a href="https://github.com/saschb2b/tubecraft/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" />
  </a>
  <a href="https://buymeacoffee.com/qohreuukw">
    <img src="https://img.shields.io/badge/Buy%20me%20a%20coffee-FFDD00?style=flat&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee" />
  </a>
</p>

---

## Features

### 🎯 Multiple Tube Shapes
- **Round/Circular** - Standard pipe profiles
- **Square** - Perfect for downspouts and ducts  
- **Rectangular** - Custom aspect ratios for any application

### ✂️ Advanced End Operations
Control top and bottom ends independently:
- **Flat** - Standard straight cut
- **Miter** - Angled cuts (0-60°) for corner joints
- **Chamfer** - Beveled edges for easier insertion
- **Saddle** - Curved fish-mouth cuts for T-joints and branch connections

### 🔗 Professional Press-Fit System
- **Fit Type Presets** - Loose (0.3mm) / Snug (0.15mm) / Interference (-0.05mm)
- **Custom Clearance** - Fine-tune tolerances for your printer
- **Lead-in Chamfer** - Auto-generated tapers for easier assembly
- **Stop Shoulder** - Internal step for consistent seating depth
- **Anti-Rotation** - Add flats or keys to prevent spinning

### 🎨 Real-Time 3D Preview
- Professional CAD-style metallic rendering
- Interactive dimension indicators
- Grid floor with axis visualization
- Orbit controls (drag to rotate, scroll to zoom)

### 📦 STL Export
- Watertight mesh generation (no open edges)
- Compatible with all major slicers
- Optimized for 3D printing

---

## Use Cases

- **Downspout Extensions** - Square/rectangular tubes for rain gutters
- **Pipe Adapters** - Connect different diameters with press-fit flares
- **T-Joint Connections** - Saddle cuts for branch fittings on half-round gutters
- **Custom Ducting** - Air flow, cable management, vacuum systems
- **Modular Assemblies** - Print multiple pieces that snap together

---

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/saschb2b/tubecraft.git
cd tubecraft

# Install dependencies
pnpm install

# Run development server
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Usage

1. **Select Shape** - Choose round, square, or rectangular
2. **Set Dimensions** - Configure inner/outer sizes, wall thickness, length
3. **Configure Ends** - Add miters, chamfers, or saddle cuts as needed
4. **Enable Press-Fit** - Toggle flare and adjust fit tolerance
5. **Preview** - Rotate and inspect your design in 3D
6. **Download STL** - Export for immediate 3D printing

---

## Tech Stack

- **Next.js 14** - React framework with App Router
- **React Three Fiber** - 3D rendering with Three.js
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful UI components

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Support

If you find TubeCraft useful, consider supporting the project:

<a href="https://buymeacoffee.com/qohreuukw">
  <img src="https://img.shields.io/badge/Buy%20me%20a%20coffee-Support-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee" />
</a>

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

Built with passion for the maker community. Special thanks to all contributors and users who provide feedback and feature requests.

---

<p align="center">
  Made with ❤️ by the open source community
</p>
```

```tsx file="" isHidden
