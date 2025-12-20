export type AdapterEndShape = "round" | "square" | "rectangular";

// The adapter's socket will be calculated from the tube's outer dimensions
export interface RoundTubeSpec {
  shape: "round";
  outerDiameter: number; // The tube's outer diameter that will fit in this socket
}

export interface SquareTubeSpec {
  shape: "square";
  outerSize: number; // The tube's outer size
  cornerRadius: number;
}

export interface RectangularTubeSpec {
  shape: "rectangular";
  outerWidth: number;
  outerHeight: number;
  cornerRadius: number;
}

export type TubeSpec = RoundTubeSpec | SquareTubeSpec | RectangularTubeSpec;

export interface AdapterConfig {
  // What tube connects at each end (specify the tube's dimensions, socket calculated automatically)
  endA: TubeSpec;
  endB: TubeSpec;

  // Adapter body
  wallThickness: number;
  socketDepth: number; // How deep the tube inserts (socket length at each end)
  socketClearance: number; // Gap between socket and tube (0.2mm typical)

  // Elbow settings
  bendAngle: number; // 0 = straight coupling, 45 = 45° elbow, 90 = 90° elbow
  bendRadius: number; // Center-line radius of the bend (0 = auto-calculate)
}

// Default configurations
export const DEFAULT_ROUND_TUBE: RoundTubeSpec = {
  shape: "round",
  outerDiameter: 50,
};

export const DEFAULT_SQUARE_TUBE: SquareTubeSpec = {
  shape: "square",
  outerSize: 50,
  cornerRadius: 2,
};

export const DEFAULT_RECTANGULAR_TUBE: RectangularTubeSpec = {
  shape: "rectangular",
  outerWidth: 50,
  outerHeight: 75,
  cornerRadius: 2,
};

export const DEFAULT_ADAPTER_CONFIG: AdapterConfig = {
  endA: { ...DEFAULT_ROUND_TUBE },
  endB: { ...DEFAULT_ROUND_TUBE },
  wallThickness: 3,
  socketDepth: 20,
  socketClearance: 0.2,
  bendAngle: 0, // Default to straight coupling (0°) since bends are less common
  bendRadius: 0,
};

// Helper functions
export function getTubeOuterDimensions(tube: TubeSpec): {
  width: number;
  height: number;
} {
  switch (tube.shape) {
    case "round":
      return { width: tube.outerDiameter, height: tube.outerDiameter };
    case "square":
      return { width: tube.outerSize, height: tube.outerSize };
    case "rectangular":
      return { width: tube.outerWidth, height: tube.outerHeight };
  }
}

// Calculate the socket inner dimensions (tube fits inside)
export function getSocketInnerDimensions(
  tube: TubeSpec,
  clearance: number,
): { width: number; height: number } {
  const outer = getTubeOuterDimensions(tube);
  return {
    width: outer.width + clearance * 2,
    height: outer.height + clearance * 2,
  };
}

// Calculate the adapter outer dimensions (socket inner + wall thickness)
export function getAdapterOuterDimensions(
  tube: TubeSpec,
  clearance: number,
  wallThickness: number,
): { width: number; height: number } {
  const socketInner = getSocketInnerDimensions(tube, clearance);
  return {
    width: socketInner.width + wallThickness * 2,
    height: socketInner.height + wallThickness * 2,
  };
}

// Get the effective bend radius (auto-calculate if 0)
export function getEffectiveBendRadius(config: AdapterConfig): number {
  if (config.bendRadius > 0) return config.bendRadius;

  // Auto-calculate: use 1.5x the larger socket outer dimension
  const dimA = getAdapterOuterDimensions(
    config.endA,
    config.socketClearance,
    config.wallThickness,
  );
  const dimB = getAdapterOuterDimensions(
    config.endB,
    config.socketClearance,
    config.wallThickness,
  );
  const maxDim = Math.max(dimA.width, dimA.height, dimB.width, dimB.height);
  return maxDim * 1.5;
}
