"use client";

import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Grid,
  GizmoHelper,
  GizmoViewport,
  ContactShadows,
  Line,
  Text,
} from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import type { AdapterConfig, TubeSpec, FitType } from "@/lib/adapter-types";
import {
  getTubeOuterDimensions,
  getTubeInnerDimensions,
  getAdapterOuterDimensions,
  getEffectiveBendRadius,
} from "@/lib/adapter-types";

// Generate profile points
function generateRoundProfile(
  diameter: number,
  segments: number,
): { x: number; z: number }[] {
  const radius = diameter / 2;
  const points: { x: number; z: number }[] = [];
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push({ x: Math.cos(angle) * radius, z: Math.sin(angle) * radius });
  }
  return points;
}

function generateRoundedRectProfile(
  width: number,
  height: number,
  cornerRadius: number,
  segmentsPerCorner = 8,
): { x: number; z: number }[] {
  const halfW = width / 2;
  const halfH = height / 2;
  const points: { x: number; z: number }[] = [];
  const r = Math.min(cornerRadius, Math.min(halfW, halfH) * 0.9);

  const corners = [
    { cx: halfW - r, cz: halfH - r, startAngle: 0 },
    { cx: -(halfW - r), cz: halfH - r, startAngle: Math.PI / 2 },
    { cx: -(halfW - r), cz: -(halfH - r), startAngle: Math.PI },
    { cx: halfW - r, cz: -(halfH - r), startAngle: (3 * Math.PI) / 2 },
  ];

  for (const corner of corners) {
    for (let i = 0; i < segmentsPerCorner; i++) {
      const angle = corner.startAngle + (i / segmentsPerCorner) * (Math.PI / 2);
      points.push({
        x: corner.cx + Math.cos(angle) * r,
        z: corner.cz + Math.sin(angle) * r,
      });
    }
  }
  return points;
}

function getInnerProfile(
  tube: TubeSpec,
  clearance: number,
  wallThickness: number,
  fitType: FitType,
  segments: number,
): { x: number; z: number }[] {
  if (fitType === "plug") {
    const inner = getTubeInnerDimensions(tube);
    const plugOuterW = inner.width - clearance * 2;
    const plugOuterH = inner.height - clearance * 2;
    const plugInnerW = plugOuterW - wallThickness * 2;
    const plugInnerH = plugOuterH - wallThickness * 2;
    switch (tube.shape) {
      case "round":
        return generateRoundProfile(plugInnerW, segments);
      case "square":
        return generateRoundedRectProfile(
          plugInnerW,
          plugInnerH,
          Math.max(0, tube.cornerRadius - wallThickness),
          segments / 4,
        );
      case "rectangular":
        return generateRoundedRectProfile(
          plugInnerW,
          plugInnerH,
          Math.max(0, tube.cornerRadius - wallThickness),
          segments / 4,
        );
    }
  }
  switch (tube.shape) {
    case "round":
      return generateRoundProfile(tube.outerDiameter + clearance * 2, segments);
    case "square":
      return generateRoundedRectProfile(
        tube.outerSize + clearance * 2,
        tube.outerSize + clearance * 2,
        tube.cornerRadius,
        segments / 4,
      );
    case "rectangular":
      return generateRoundedRectProfile(
        tube.outerWidth + clearance * 2,
        tube.outerHeight + clearance * 2,
        tube.cornerRadius,
        segments / 4,
      );
  }
}

function getOuterProfile(
  tube: TubeSpec,
  clearance: number,
  wallThickness: number,
  fitType: FitType,
  segments: number,
): { x: number; z: number }[] {
  if (fitType === "plug") {
    const inner = getTubeInnerDimensions(tube);
    const plugOuterW = inner.width - clearance * 2;
    const plugOuterH = inner.height - clearance * 2;
    switch (tube.shape) {
      case "round":
        return generateRoundProfile(plugOuterW, segments);
      case "square":
        return generateRoundedRectProfile(
          plugOuterW,
          plugOuterH,
          tube.cornerRadius,
          segments / 4,
        );
      case "rectangular":
        return generateRoundedRectProfile(
          plugOuterW,
          plugOuterH,
          tube.cornerRadius,
          segments / 4,
        );
    }
  }
  switch (tube.shape) {
    case "round":
      return generateRoundProfile(
        tube.outerDiameter + clearance * 2 + wallThickness * 2,
        segments,
      );
    case "square":
      return generateRoundedRectProfile(
        tube.outerSize + clearance * 2 + wallThickness * 2,
        tube.outerSize + clearance * 2 + wallThickness * 2,
        tube.cornerRadius + wallThickness,
        segments / 4,
      );
    case "rectangular":
      return generateRoundedRectProfile(
        tube.outerWidth + clearance * 2 + wallThickness * 2,
        tube.outerHeight + clearance * 2 + wallThickness * 2,
        tube.cornerRadius + wallThickness,
        segments / 4,
      );
  }
}

function interpolateProfiles(
  profileA: { x: number; z: number }[],
  profileB: { x: number; z: number }[],
  t: number,
): { x: number; z: number }[] {
  const numPoints = Math.max(profileA.length, profileB.length);
  const result: { x: number; z: number }[] = [];
  for (let i = 0; i < numPoints; i++) {
    const idxA =
      Math.floor((i / numPoints) * profileA.length) % profileA.length;
    const idxB =
      Math.floor((i / numPoints) * profileB.length) % profileB.length;
    result.push({
      x: profileA[idxA].x + (profileB[idxB].x - profileA[idxA].x) * t,
      z: profileA[idxA].z + (profileB[idxB].z - profileA[idxA].z) * t,
    });
  }
  return result;
}

function transformAlongPath(
  localX: number,
  localZ: number,
  pathT: number,
  bendAngle: number,
  bendRadius: number,
  straightLength: number,
): { x: number; y: number; z: number } {
  if (bendAngle === 0) {
    return { x: localX, y: pathT * straightLength, z: localZ };
  }

  const angleRad = (bendAngle * Math.PI) / 180;
  const currentAngle = pathT * angleRad;

  // Position on the centerline of the bend
  const centerY = bendRadius * Math.sin(currentAngle);
  const centerZ = bendRadius * (1 - Math.cos(currentAngle));

  // Rotate the profile plane around X axis as we go around the bend
  const transformedY = -localZ * Math.sin(currentAngle);
  const transformedZ = localZ * Math.cos(currentAngle);

  return {
    x: localX,
    y: centerY + transformedY,
    z: centerZ + transformedZ,
  };
}

function AdapterMesh({ config }: { config: AdapterConfig }) {
  const geometry = useMemo(() => {
    const {
      endA,
      endB,
      wallThickness,
      socketDepth,
      socketClearance,
      bendAngle,
    } = config;
    const bendRadius = getEffectiveBendRadius(config);
    const segments = 64;
    const slicesSocket = 4;
    const slicesBend = bendAngle > 0 ? Math.max(32, Math.ceil(bendAngle)) : 2;
    const straightLength = bendAngle === 0 ? bendRadius : 0;

    const { endAFit, endBFit } = config;
    const innerProfileA = getInnerProfile(endA, socketClearance, wallThickness, endAFit, segments);
    const outerProfileA = getOuterProfile(endA, socketClearance, wallThickness, endAFit, segments);
    const innerProfileB = getInnerProfile(endB, socketClearance, wallThickness, endBFit, segments);
    const outerProfileB = getOuterProfile(endB, socketClearance, wallThickness, endBFit, segments);

    const numPoints = Math.max(
      innerProfileA.length,
      innerProfileB.length,
      segments,
    );

    const normalizeProfile = (
      profile: { x: number; z: number }[],
    ): { x: number; z: number }[] => {
      const result: { x: number; z: number }[] = [];
      for (let i = 0; i < numPoints; i++) {
        const idx =
          Math.floor((i / numPoints) * profile.length) % profile.length;
        result.push(profile[idx]);
      }
      return result;
    };

    const normInnerA = normalizeProfile(innerProfileA);
    const normOuterA = normalizeProfile(outerProfileA);
    const normInnerB = normalizeProfile(innerProfileB);
    const normOuterB = normalizeProfile(outerProfileB);

    const vertices: number[] = [];
    const indices: number[] = [];

    const allOuterSlices: { x: number; y: number; z: number }[][] = [];
    const allInnerSlices: { x: number; y: number; z: number }[][] = [];

    const yOffset = socketDepth;

    // Socket A
    for (let s = 0; s <= slicesSocket; s++) {
      const t = s / slicesSocket;
      const y = -socketDepth * (1 - t) + yOffset;
      const outerSlice: { x: number; y: number; z: number }[] = [];
      const innerSlice: { x: number; y: number; z: number }[] = [];
      for (let i = 0; i < numPoints; i++) {
        outerSlice.push({ x: normOuterA[i].x, y, z: normOuterA[i].z });
        innerSlice.push({ x: normInnerA[i].x, y, z: normInnerA[i].z });
      }
      allOuterSlices.push(outerSlice);
      allInnerSlices.push(innerSlice);
    }

    // Bend section
    for (let s = 0; s <= slicesBend; s++) {
      const t = s / slicesBend;
      const outerInterp = interpolateProfiles(normOuterA, normOuterB, t);
      const innerInterp = interpolateProfiles(normInnerA, normInnerB, t);
      const outerSlice: { x: number; y: number; z: number }[] = [];
      const innerSlice: { x: number; y: number; z: number }[] = [];
      for (let i = 0; i < numPoints; i++) {
        const outerPos = transformAlongPath(
          outerInterp[i].x,
          outerInterp[i].z,
          t,
          bendAngle,
          bendRadius,
          straightLength,
        );
        const innerPos = transformAlongPath(
          innerInterp[i].x,
          innerInterp[i].z,
          t,
          bendAngle,
          bendRadius,
          straightLength,
        );
        outerSlice.push({
          x: outerPos.x,
          y: outerPos.y + yOffset,
          z: outerPos.z,
        });
        innerSlice.push({
          x: innerPos.x,
          y: innerPos.y + yOffset,
          z: innerPos.z,
        });
      }
      allOuterSlices.push(outerSlice);
      allInnerSlices.push(innerSlice);
    }

    // Socket B
    const bendEndOuter = allOuterSlices[allOuterSlices.length - 1];
    const bendEndInner = allInnerSlices[allInnerSlices.length - 1];
    const endAngleRad = (bendAngle * Math.PI) / 180;
    const dirY = bendAngle > 0 ? Math.cos(endAngleRad) : 1;
    const dirZ = bendAngle > 0 ? Math.sin(endAngleRad) : 0;

    for (let s = 1; s <= slicesSocket; s++) {
      const t = s / slicesSocket;
      const offset = socketDepth * t;
      const outerSlice: { x: number; y: number; z: number }[] = [];
      const innerSlice: { x: number; y: number; z: number }[] = [];
      for (let i = 0; i < numPoints; i++) {
        outerSlice.push({
          x: normOuterB[i].x,
          y: bendEndOuter[i].y + dirY * offset,
          z: bendEndOuter[i].z + dirZ * offset,
        });
        innerSlice.push({
          x: normInnerB[i].x,
          y: bendEndInner[i].y + dirY * offset,
          z: bendEndInner[i].z + dirZ * offset,
        });
      }
      allOuterSlices.push(outerSlice);
      allInnerSlices.push(innerSlice);
    }

    // Build geometry
    for (let s = 0; s < allOuterSlices.length; s++) {
      for (let i = 0; i < numPoints; i++) {
        const op = allOuterSlices[s][i];
        const ip = allInnerSlices[s][i];
        vertices.push(op.x, op.y, op.z);
        vertices.push(ip.x, ip.y, ip.z);
      }
    }

    const totalSlices = allOuterSlices.length;
    for (let s = 0; s < totalSlices - 1; s++) {
      for (let i = 0; i < numPoints; i++) {
        const next = (i + 1) % numPoints;
        const o1 = s * numPoints * 2 + i * 2;
        const i1 = o1 + 1;
        const o2 = s * numPoints * 2 + next * 2;
        const i2 = o2 + 1;
        const o3 = (s + 1) * numPoints * 2 + i * 2;
        const i3 = o3 + 1;
        const o4 = (s + 1) * numPoints * 2 + next * 2;
        const i4 = o4 + 1;

        indices.push(o1, o3, o2);
        indices.push(o2, o3, o4);
        indices.push(i1, i2, i3);
        indices.push(i2, i4, i3);
      }
    }

    // Bottom cap
    for (let i = 0; i < numPoints; i++) {
      const next = (i + 1) % numPoints;
      const o1 = i * 2;
      const i1 = o1 + 1;
      const o2 = next * 2;
      const i2 = o2 + 1;
      indices.push(o1, o2, i1);
      indices.push(o2, i2, i1);
    }

    // Top cap
    const lastS = (totalSlices - 1) * numPoints * 2;
    for (let i = 0; i < numPoints; i++) {
      const next = (i + 1) % numPoints;
      const o1 = lastS + i * 2;
      const i1 = o1 + 1;
      const o2 = lastS + next * 2;
      const i2 = o2 + 1;
      indices.push(o1, i1, o2);
      indices.push(o2, i1, i2);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [config]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color="#b8c4ce"
        metalness={0.85}
        roughness={0.15}
        side={THREE.DoubleSide}
        envMapIntensity={1.2}
      />
    </mesh>
  );
}


function HorizontalDimension({
  width,
  y,
  z,
  label,
  color = "#f59e0b",
  labelPosition = "above",
}: {
  width: number;
  y: number;
  z: number;
  label: string;
  color?: string;
  labelPosition?: "above" | "below";
}) {
  const halfWidth = width / 2;
  const tickSize = Math.max(2, width * 0.06);
  const textSize = Math.max(3, width * 0.08);
  const textY =
    labelPosition === "above"
      ? y + tickSize + textSize
      : y - tickSize - textSize;

  return (
    <group>
      <Line
        points={[
          [-halfWidth, y, z],
          [halfWidth, y, z],
        ]}
        color={color}
        lineWidth={1.5}
      />
      <Line
        points={[
          [-halfWidth, y - tickSize, z],
          [-halfWidth, y + tickSize, z],
        ]}
        color={color}
        lineWidth={1.5}
      />
      <Line
        points={[
          [halfWidth, y - tickSize, z],
          [halfWidth, y + tickSize, z],
        ]}
        color={color}
        lineWidth={1.5}
      />
      <Text
        position={[0, textY, z]}
        fontSize={textSize}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

function VerticalDimension({
  height,
  x,
  z,
  startY,
  label,
  color = "#f59e0b",
  labelSide = "right",
}: {
  height: number;
  x: number;
  z: number;
  startY: number;
  label: string;
  color?: string;
  labelSide?: "left" | "right";
}) {
  const tickSize = Math.max(2, height * 0.04);
  const textSize = Math.max(3, height * 0.06);
  const textX =
    labelSide === "right"
      ? x + tickSize + textSize * 2
      : x - tickSize - textSize * 2;

  return (
    <group>
      <Line
        points={[
          [x, startY, z],
          [x, startY + height, z],
        ]}
        color={color}
        lineWidth={1.5}
      />
      <Line
        points={[
          [x - tickSize, startY, z],
          [x + tickSize, startY, z],
        ]}
        color={color}
        lineWidth={1.5}
      />
      <Line
        points={[
          [x - tickSize, startY + height, z],
          [x + tickSize, startY + height, z],
        ]}
        color={color}
        lineWidth={1.5}
      />
      <Text
        position={[textX, startY + height / 2, z]}
        fontSize={textSize}
        color={color}
        anchorX={labelSide === "right" ? "left" : "right"}
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

function DimensionIndicators({ config }: { config: AdapterConfig }) {
  const dimA = getTubeOuterDimensions(config.endA);
  const dimB = getTubeOuterDimensions(config.endB);
  const adapterA = getAdapterOuterDimensions(
    config.endA,
    config.socketClearance,
    config.wallThickness,
    config.endAFit,
  );
  const bendRadius = getEffectiveBendRadius(config);
  const straightLength = config.bendAngle === 0 ? bendRadius : 0;

  const yOffset = config.socketDepth;
  const maxOuterWidth = Math.max(adapterA.width, adapterA.height);
  const xOffset = maxOuterWidth / 2 + 12;

  // Calculate end B position
  const endAngleRad = (config.bendAngle * Math.PI) / 180;
  let endBY: number;

  if (config.bendAngle > 0) {
    endBY =
      bendRadius * Math.sin(endAngleRad) +
      config.socketDepth * Math.cos(endAngleRad) +
      yOffset;
  } else {
    endBY = straightLength + config.socketDepth + yOffset;
  }

  return (
    <group>
      {/* Socket A - tube diameter (horizontal line across bottom) */}
      <HorizontalDimension
        width={dimA.width}
        y={-6}
        z={maxOuterWidth / 2 + 5}
        label={`⌀${dimA.width}mm`}
        color="#3b82f6"
        labelPosition="below"
      />

      {/* Socket B - tube diameter (horizontal line across top) */}
      <HorizontalDimension
        width={dimB.width}
        y={endBY + 6}
        z={0}
        label={`⌀${dimB.width}mm`}
        color="#22c55e"
      />

      {/* Socket depth A (vertical line on left side) */}
      <VerticalDimension
        height={config.socketDepth}
        x={-xOffset}
        z={0}
        startY={0}
        label={`${config.socketDepth}mm`}
        color="#f59e0b"
        labelSide="left"
      />

      {/* Total height (vertical line on right side) */}
      <VerticalDimension
        height={endBY}
        x={xOffset}
        z={0}
        startY={0}
        label={`${Math.round(endBY)}mm`}
        color="#f59e0b"
      />

      {/* Bend angle label */}
      {config.bendAngle > 0 && (
        <Text
          position={[
            -xOffset - 8,
            bendRadius * 0.5 + yOffset,
            bendRadius * 0.3,
          ]}
          fontSize={Math.max(3, bendRadius * 0.06)}
          color="#a855f7"
          anchorX="right"
          anchorY="middle"
        >
          {config.bendAngle}° elbow
        </Text>
      )}
    </group>
  );
}

function GridFloor({ size }: { size: number }) {
  const gridSize = Math.max(size * 2, 100);

  return (
    <group position={[0, -0.01, 0]}>
      <Grid
        args={[gridSize, gridSize]}
        cellSize={10}
        cellThickness={0.5}
        cellColor="#555555"
        sectionSize={50}
        sectionThickness={1}
        sectionColor="#6a6a6a"
        fadeDistance={gridSize * 2}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={false}
      />
      {/* X-axis (red) */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={
              new Float32Array([-gridSize / 2, 0.01, 0, gridSize / 2, 0.01, 0])
            }
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ef4444" linewidth={2} />
      </line>
      {/* Z-axis (blue) */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={
              new Float32Array([0, 0.01, -gridSize / 2, 0, 0.01, gridSize / 2])
            }
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#3b82f6" linewidth={2} />
      </line>
    </group>
  );
}

export function AdapterPreview({ config }: { config: AdapterConfig }) {
  const adapterDim = getAdapterOuterDimensions(
    config.endA,
    config.socketClearance,
    config.wallThickness,
    config.endAFit,
  );
  const bendRadius = getEffectiveBendRadius(config);
  const straightLength = config.bendAngle === 0 ? bendRadius : 0;
  const totalHeight =
    config.socketDepth * 2 +
    (config.bendAngle > 0 ? bendRadius : straightLength);
  const maxDim = Math.max(adapterDim.width, adapterDim.height, totalHeight);
  const cameraDistance = maxDim * 2.5;

  const centerY = totalHeight / 2;

  return (
    <Canvas
      camera={{
        position: [
          cameraDistance * 0.6,
          cameraDistance * 0.4,
          cameraDistance * 0.6,
        ],
        fov: 45,
        near: 0.1,
        far: maxDim * 20,
      }}
      style={{
        background: "linear-gradient(180deg, #404040 0%, #2a2a2a 100%)",
      }}
    >
      <Environment preset="studio" />

      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
      <directionalLight position={[-10, 10, -10]} intensity={0.5} />
      <directionalLight position={[0, 10, 5]} intensity={0.4} />

      <GridFloor size={maxDim} />

      <AdapterMesh config={config} />
      <DimensionIndicators config={config} />

      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.3}
        scale={200}
        blur={2.5}
        far={100}
      />

      <OrbitControls
        makeDefault
        target={[0, centerY, config.bendAngle > 0 ? bendRadius / 4 : 0]}
        enableDamping
        dampingFactor={0.05}
        minDistance={20}
        maxDistance={maxDim * 10}
      />

      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport
          axisColors={["#ef4444", "#22c55e", "#3b82f6"]}
          labelColor="white"
        />
      </GizmoHelper>
    </Canvas>
  );
}
