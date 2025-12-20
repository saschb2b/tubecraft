"use client";

import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  GizmoHelper,
  GizmoViewport,
  ContactShadows,
  Html,
} from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import type { AdapterConfig, TubeSpec } from "@/lib/adapter-types";
import {
  getTubeOuterDimensions,
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

function getSocketProfile(
  tube: TubeSpec,
  clearance: number,
  segments: number,
): { x: number; z: number }[] {
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
  segments: number,
): { x: number; z: number }[] {
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

    const innerProfileA = getSocketProfile(endA, socketClearance, segments);
    const outerProfileA = getOuterProfile(
      endA,
      socketClearance,
      wallThickness,
      segments,
    );
    const innerProfileB = getSocketProfile(endB, socketClearance, segments);
    const outerProfileB = getOuterProfile(
      endB,
      socketClearance,
      wallThickness,
      segments,
    );

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
      />
    </mesh>
  );
}

function Grid() {
  const gridSize = 200;
  const divisions = 20;
  return (
    <group position={[0, 0, 0]}>
      <gridHelper args={[gridSize, divisions, "#64748b", "#334155"]} />
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array([-gridSize / 2, 0.01, 0, gridSize / 2, 0.01, 0]),
              3,
            ]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ef4444" />
      </line>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array([0, 0.01, -gridSize / 2, 0, 0.01, gridSize / 2]),
              3,
            ]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#3b82f6" />
      </line>
    </group>
  );
}

function DimensionLabel({
  position,
  text,
  color,
}: {
  position: [number, number, number];
  text: string;
  color: string;
}) {
  return (
    <Html position={position} center style={{ pointerEvents: "none" }}>
      <div
        className="text-xs font-mono px-1.5 py-0.5 rounded whitespace-nowrap"
        style={{ color, textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
      >
        {text}
      </div>
    </Html>
  );
}

function DimensionIndicators({ config }: { config: AdapterConfig }) {
  const dimA = getTubeOuterDimensions(config.endA);
  const dimB = getTubeOuterDimensions(config.endB);
  const adapterA = getAdapterOuterDimensions(
    config.endA,
    config.socketClearance,
    config.wallThickness,
  );
  const bendRadius = getEffectiveBendRadius(config);
  const straightLength = config.bendAngle === 0 ? bendRadius : 0;

  const yOffset = config.socketDepth;

  // Calculate end B position
  const endAngleRad = (config.bendAngle * Math.PI) / 180;
  let endBY: number;
  let endBZ: number;

  if (config.bendAngle > 0) {
    endBY =
      bendRadius * Math.sin(endAngleRad) +
      config.socketDepth * Math.cos(endAngleRad) +
      yOffset;
    endBZ =
      bendRadius * (1 - Math.cos(endAngleRad)) +
      config.socketDepth * Math.sin(endAngleRad);
  } else {
    endBY = straightLength + config.socketDepth + yOffset;
    endBZ = 0;
  }

  return (
    <group>
      {/* Socket A - tube diameter */}
      <DimensionLabel
        position={[
          adapterA.width / 2 + 20,
          yOffset - config.socketDepth / 2,
          0,
        ]}
        text={`⌀${dimA.width}mm tube`}
        color="#3b82f6"
      />

      {/* Socket B - tube diameter */}
      <DimensionLabel
        position={[adapterA.width / 2 + 20, endBY, endBZ]}
        text={`⌀${dimB.width}mm tube`}
        color="#22c55e"
      />

      {/* Socket depth */}
      <DimensionLabel
        position={[
          -adapterA.width / 2 - 15,
          yOffset - config.socketDepth / 2,
          0,
        ]}
        text={`${config.socketDepth}mm socket`}
        color="#f59e0b"
      />

      {/* Bend angle - only show when bent */}
      {config.bendAngle > 0 && (
        <DimensionLabel
          position={[0, bendRadius * 0.5 + yOffset, bendRadius * 0.3]}
          text={`${config.bendAngle}° elbow`}
          color="#a855f7"
        />
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
        cellColor="#475569"
        sectionSize={50}
        sectionThickness={1}
        sectionColor="#64748b"
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
        background: "linear-gradient(180deg, #e2e8f0 0%, #94a3b8 100%)",
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
