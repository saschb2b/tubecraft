"use client";

import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Grid,
  GizmoHelper,
  GizmoViewport,
  Line,
  Text,
  ContactShadows,
} from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import type { TubeConfig, EndCutConfig } from "@/lib/tube-types";

interface TubePreviewProps {
  config: TubeConfig;
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

function HorizontalDimension({
  width,
  y,
  z,
  label,
  color = "#f59e0b",
}: {
  width: number;
  y: number;
  z: number;
  label: string;
  color?: string;
}) {
  const halfWidth = width / 2;

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
          [-halfWidth, y - 2, z],
          [-halfWidth, y + 2, z],
        ]}
        color={color}
        lineWidth={1.5}
      />
      <Line
        points={[
          [halfWidth, y - 2, z],
          [halfWidth, y + 2, z],
        ]}
        color={color}
        lineWidth={1.5}
      />
      <Text
        position={[0, y + 5, z]}
        fontSize={Math.max(4, width * 0.1)}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {label}mm
      </Text>
    </group>
  );
}

function VerticalDimension({
  height,
  x,
  z,
  label,
  color = "#f59e0b",
  startY = 0,
}: {
  height: number;
  x: number;
  z: number;
  label: string;
  color?: string;
  startY?: number;
}) {
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
          [x - 2, startY, z],
          [x + 2, startY, z],
        ]}
        color={color}
        lineWidth={1.5}
      />
      <Line
        points={[
          [x - 2, startY + height, z],
          [x + 2, startY + height, z],
        ]}
        color={color}
        lineWidth={1.5}
      />
      <Text
        position={[x + 8, startY + height / 2, z]}
        fontSize={Math.max(4, height * 0.06)}
        color={color}
        anchorX="left"
        anchorY="middle"
      >
        {label}mm
      </Text>
    </group>
  );
}

function DepthDimension({
  depth,
  y,
  x,
  label,
  color = "#f59e0b",
}: {
  depth: number;
  y: number;
  x: number;
  label: string;
  color?: string;
}) {
  const halfDepth = depth / 2;

  return (
    <group>
      <Line
        points={[
          [x, y, -halfDepth],
          [x, y, halfDepth],
        ]}
        color={color}
        lineWidth={1.5}
      />
      <Line
        points={[
          [x, y - 2, -halfDepth],
          [x, y + 2, -halfDepth],
        ]}
        color={color}
        lineWidth={1.5}
      />
      <Line
        points={[
          [x, y - 2, halfDepth],
          [x, y + 2, halfDepth],
        ]}
        color={color}
        lineWidth={1.5}
      />
      <Text
        position={[x, y, halfDepth + 8]}
        fontSize={Math.max(4, depth * 0.1)}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {label}mm
      </Text>
    </group>
  );
}

function DimensionIndicators({ config }: { config: TubeConfig }) {
  const isRectangular = config.shape === "rectangular";
  const isSquare = config.shape === "square";
  const isRound = config.shape === "round";

  const outerWidth = isRound
    ? config.outerDiameter
    : isSquare
      ? config.outerSize
      : config.outerWidth;
  const outerHeight = isRound
    ? config.outerDiameter
    : isSquare
      ? config.outerSize
      : config.outerHeight;
  const innerWidth = isRound
    ? config.innerDiameter
    : isSquare
      ? config.innerSize
      : config.innerWidth;
  const innerHeight = isRound
    ? config.innerDiameter
    : isSquare
      ? config.innerSize
      : config.innerHeight;

  const maxOuter = Math.max(outerWidth, outerHeight);
  const xOffset = maxOuter / 2 + 15;
  const useFlare = config.flare.enabled && config.topCut.type === "flat";
  const flareStartY = useFlare ? config.length - config.flare.length : 0;

  return (
    <group>
      <VerticalDimension
        height={config.length}
        x={xOffset}
        z={0}
        label={config.length.toString()}
        color="#f59e0b"
      />

      <HorizontalDimension
        width={outerWidth}
        y={-8}
        z={outerHeight / 2 + 5}
        label={isRound ? `⌀${outerWidth}` : outerWidth.toString()}
        color="#3b82f6"
      />

      <HorizontalDimension
        width={innerWidth}
        y={config.length + 8}
        z={0}
        label={isRound ? `⌀${innerWidth}` : innerWidth.toString()}
        color="#22c55e"
      />

      {isRectangular && (
        <DepthDimension
          depth={outerHeight}
          y={-8}
          x={outerWidth / 2 + 8}
          label={outerHeight.toString()}
          color="#60a5fa"
        />
      )}

      {isRectangular && (
        <DepthDimension
          depth={innerHeight}
          y={config.length + 8}
          x={-(innerWidth / 2 + 8)}
          label={innerHeight.toString()}
          color="#4ade80"
        />
      )}

      {useFlare && (
        <group>
          <group>
            <Line
              points={[
                [-xOffset, flareStartY, 0],
                [-xOffset, config.length, 0],
              ]}
              color="#ec4899"
              lineWidth={1.5}
            />
            <Line
              points={[
                [-xOffset - 2, flareStartY, 0],
                [-xOffset + 2, flareStartY, 0],
              ]}
              color="#ec4899"
              lineWidth={1.5}
            />
            <Line
              points={[
                [-xOffset - 2, config.length, 0],
                [-xOffset + 2, config.length, 0],
              ]}
              color="#ec4899"
              lineWidth={1.5}
            />
            <Text
              position={[
                -xOffset - 8,
                flareStartY + config.flare.length / 2,
                0,
              ]}
              fontSize={Math.max(4, config.flare.length * 0.15)}
              color="#ec4899"
              anchorX="right"
              anchorY="middle"
            >
              {config.flare.length}mm
            </Text>
          </group>

          <HorizontalDimension
            width={isRound ? config.flare.diameter : config.flare.width}
            y={config.length + 16}
            z={-(maxOuter / 2 + 5)}
            label={
              isRound
                ? `⌀${config.flare.diameter}`
                : config.flare.width.toString()
            }
            color="#ec4899"
          />

          {isRectangular && (
            <DepthDimension
              depth={config.flare.height}
              y={config.length + 16}
              x={config.flare.width / 2 + 8}
              label={config.flare.height.toString()}
              color="#f472b6"
            />
          )}
        </group>
      )}

      {config.topCut.type === "saddle" && (
        <HorizontalDimension
          width={config.topCut.targetDiameter}
          y={config.length + 20}
          z={0}
          label={`Target ⌀${config.topCut.targetDiameter}`}
          color="#a855f7"
        />
      )}

      {config.topCut.type === "miter" && (
        <Text
          position={[-xOffset, config.length, 0]}
          fontSize={Math.max(4, config.length * 0.05)}
          color="#a855f7"
          anchorX="right"
          anchorY="middle"
        >
          {config.topCut.angle}° miter
        </Text>
      )}

      {config.bottomCut.type === "miter" && (
        <Text
          position={[-xOffset, 0, 0]}
          fontSize={Math.max(4, config.length * 0.05)}
          color="#f97316"
          anchorX="right"
          anchorY="middle"
        >
          {config.bottomCut.angle}° miter
        </Text>
      )}

      {config.bottomCut.type === "saddle" && (
        <HorizontalDimension
          width={config.bottomCut.targetDiameter}
          y={-16}
          z={0}
          label={`Target ⌀${config.bottomCut.targetDiameter}`}
          color="#f97316"
        />
      )}
    </group>
  );
}

function getTopZForPreview(
  angle: number,
  radius: number,
  baseLength: number,
  topCut: EndCutConfig,
  outerRadius: number,
): number {
  if (topCut.type === "flat") {
    return baseLength;
  } else if (topCut.type === "miter") {
    const miterAngle = (topCut.angle * Math.PI) / 180;
    return baseLength + radius * Math.tan(miterAngle) * Math.cos(angle);
  } else if (topCut.type === "saddle") {
    const targetRadius = topCut.targetDiameter / 2;
    const x = outerRadius * Math.cos(angle);
    const distFromCenter = Math.abs(x);

    if (distFromCenter <= targetRadius) {
      const saddleHeight = Math.sqrt(
        targetRadius * targetRadius - distFromCenter * distFromCenter,
      );
      return (
        baseLength + saddleHeight * Math.sin((topCut.angle * Math.PI) / 180)
      );
    }
    return baseLength;
  } else if (topCut.type === "chamfer") {
    return baseLength;
  }
  return baseLength;
}

function getBottomZForPreview(
  angle: number,
  radius: number,
  bottomCut: EndCutConfig,
  outerRadius: number,
  bottomOffset: number,
): number {
  if (bottomCut.type === "flat") {
    return bottomOffset;
  } else if (bottomCut.type === "miter") {
    const miterAngle = (bottomCut.angle * Math.PI) / 180;
    return (
      bottomOffset +
      Math.max(0, -radius * Math.tan(miterAngle) * Math.cos(angle))
    );
  } else if (bottomCut.type === "saddle") {
    const targetRadius = bottomCut.targetDiameter / 2;
    const x = outerRadius * Math.cos(angle);
    const distFromCenter = Math.abs(x);

    if (distFromCenter <= targetRadius) {
      const saddleHeight = Math.sqrt(
        targetRadius * targetRadius - distFromCenter * distFromCenter,
      );
      return (
        bottomOffset -
        saddleHeight * Math.sin((bottomCut.angle * Math.PI) / 180)
      );
    }
    return bottomOffset;
  }
  return bottomOffset;
}

function calculateBottomOffset(
  bottomCut: EndCutConfig,
  outerRadius: number,
  segments: number,
): number {
  if (bottomCut.type === "flat" || bottomCut.type === "chamfer") return 0;

  let maxNegative = 0;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    let z = 0;
    if (bottomCut.type === "miter") {
      const miterAngle = (bottomCut.angle * Math.PI) / 180;
      z = -outerRadius * Math.tan(miterAngle) * Math.cos(angle);
    } else if (bottomCut.type === "saddle") {
      const targetRadius = bottomCut.targetDiameter / 2;
      const x = outerRadius * Math.cos(angle);
      const distFromCenter = Math.abs(x);
      if (distFromCenter <= targetRadius) {
        z = -Math.sqrt(
          targetRadius * targetRadius - distFromCenter * distFromCenter,
        );
      }
    }
    if (z < maxNegative) maxNegative = z;
  }
  return -maxNegative;
}

function RoundTubeMesh({
  config,
}: {
  config: TubeConfig & { shape: "round" };
}) {
  const { innerDiameter, outerDiameter, length, flare, topCut, bottomCut } =
    config;
  const innerRadius = innerDiameter / 2;
  const outerRadius = outerDiameter / 2;
  const useFlare = flare.enabled && topCut.type === "flat";
  const mainLength = useFlare ? length - flare.length : length;
  const segments = 64;

  const bottomOffset = useMemo(
    () => calculateBottomOffset(bottomCut, outerRadius, segments),
    [bottomCut, outerRadius, segments],
  );

  const geometry = useMemo(() => {
    const positions: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      const topZOuter = getTopZForPreview(
        angle,
        outerRadius,
        mainLength,
        topCut,
        outerRadius,
      );
      const topZInner = getTopZForPreview(
        angle,
        innerRadius,
        mainLength,
        topCut,
        outerRadius,
      );
      const bottomZOuter = getBottomZForPreview(
        angle,
        outerRadius,
        bottomCut,
        outerRadius,
        bottomOffset,
      );
      const bottomZInner = getBottomZForPreview(
        angle,
        innerRadius,
        bottomCut,
        outerRadius,
        bottomOffset,
      );

      positions.push(outerRadius * cos, bottomZOuter, outerRadius * sin);
      positions.push(innerRadius * cos, bottomZInner, innerRadius * sin);
      positions.push(outerRadius * cos, topZOuter, outerRadius * sin);
      positions.push(innerRadius * cos, topZInner, innerRadius * sin);
    }

    const vertsPerSegment = 4;

    for (let i = 0; i < segments; i++) {
      const curr = i * vertsPerSegment;
      const next = (i + 1) * vertsPerSegment;

      // Outer wall
      indices.push(curr + 0, next + 0, curr + 2);
      indices.push(next + 0, next + 2, curr + 2);

      // Inner wall
      indices.push(curr + 1, curr + 3, next + 1);
      indices.push(next + 1, curr + 3, next + 3);

      // Bottom cap
      indices.push(curr + 0, curr + 1, next + 0);
      indices.push(next + 0, curr + 1, next + 1);

      // Top cap
      indices.push(curr + 2, next + 2, curr + 3);
      indices.push(next + 2, next + 3, curr + 3);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [innerRadius, outerRadius, mainLength, topCut, bottomCut, bottomOffset]);

  const flareGeometry = useMemo(() => {
    if (!useFlare) return null;

    const flareOuterRadius = (flare.diameter + flare.clearance * 2) / 2;
    const positions: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      positions.push(outerRadius * cos, 0, outerRadius * sin);
      positions.push(innerRadius * cos, 0, innerRadius * sin);
      positions.push(
        flareOuterRadius * cos,
        flare.length,
        flareOuterRadius * sin,
      );
      positions.push(innerRadius * cos, flare.length, innerRadius * sin);
    }

    for (let i = 0; i < segments; i++) {
      const curr = i * 4;
      const next = (i + 1) * 4;

      indices.push(curr, next, curr + 2);
      indices.push(next, next + 2, curr + 2);
      indices.push(curr + 1, curr + 3, next + 1);
      indices.push(next + 1, curr + 3, next + 3);
      indices.push(curr + 2, next + 2, curr + 3);
      indices.push(next + 2, next + 3, curr + 3);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [flare, outerRadius, innerRadius, useFlare]);

  return (
    <group position={[0, 0, 0]}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color="#b8c4ce"
          metalness={0.85}
          roughness={0.15}
          side={THREE.DoubleSide}
          envMapIntensity={1.2}
        />
      </mesh>
      {flareGeometry && (
        <mesh geometry={flareGeometry} position={[0, mainLength, 0]}>
          <meshStandardMaterial
            color="#b8c4ce"
            metalness={0.85}
            roughness={0.15}
            side={THREE.DoubleSide}
            envMapIntensity={1.2}
          />
        </mesh>
      )}
    </group>
  );
}

function getRectTopZForPreview(
  x: number,
  baseLength: number,
  topCut: EndCutConfig,
): number {
  if (topCut.type === "flat") {
    return baseLength;
  } else if (topCut.type === "miter") {
    const miterAngle = (topCut.angle * Math.PI) / 180;
    return baseLength + x * Math.tan(miterAngle);
  } else if (topCut.type === "saddle") {
    const targetRadius = topCut.targetDiameter / 2;
    const distFromCenter = Math.abs(x);

    if (distFromCenter <= targetRadius) {
      const saddleHeight = Math.sqrt(
        targetRadius * targetRadius - distFromCenter * distFromCenter,
      );
      return baseLength + saddleHeight;
    }
    return baseLength;
  }
  return baseLength;
}

function getRectBottomZForPreview(
  x: number,
  bottomCut: EndCutConfig,
  bottomOffset: number,
): number {
  if (bottomCut.type === "flat") {
    return bottomOffset;
  } else if (bottomCut.type === "miter") {
    const miterAngle = (bottomCut.angle * Math.PI) / 180;
    return bottomOffset + Math.max(0, -x * Math.tan(miterAngle));
  } else if (bottomCut.type === "saddle") {
    const targetRadius = bottomCut.targetDiameter / 2;
    const distFromCenter = Math.abs(x);

    if (distFromCenter <= targetRadius) {
      const saddleHeight = Math.sqrt(
        targetRadius * targetRadius - distFromCenter * distFromCenter,
      );
      return bottomOffset - saddleHeight;
    }
    return bottomOffset;
  }
  return bottomOffset;
}

function calculateRectBottomOffset(
  bottomCut: EndCutConfig,
  outerPoints: THREE.Vector2[],
): number {
  if (bottomCut.type === "flat" || bottomCut.type === "chamfer") return 0;

  let maxNegative = 0;
  for (const pt of outerPoints) {
    let z = 0;
    if (bottomCut.type === "miter") {
      const miterAngle = (bottomCut.angle * Math.PI) / 180;
      z = -pt.x * Math.tan(miterAngle);
    } else if (bottomCut.type === "saddle") {
      const targetRadius = bottomCut.targetDiameter / 2;
      const distFromCenter = Math.abs(pt.x);
      if (distFromCenter <= targetRadius) {
        z = -Math.sqrt(
          targetRadius * targetRadius - distFromCenter * distFromCenter,
        );
      }
    }
    if (z < maxNegative) maxNegative = z;
  }
  return -maxNegative;
}

function RectangularTubeMesh({
  config,
}: {
  config: TubeConfig & { shape: "square" | "rectangular" };
}) {
  const isSquare = config.shape === "square";
  const innerWidth = isSquare ? config.innerSize : config.innerWidth;
  const innerHeight = isSquare ? config.innerSize : config.innerHeight;
  const outerWidth = isSquare ? config.outerSize : config.outerWidth;
  const outerHeight = isSquare ? config.outerSize : config.outerHeight;
  const { length, cornerRadius, flare, topCut, bottomCut } = config;
  const useFlare = flare.enabled && topCut.type === "flat";
  const mainLength = useFlare ? length - flare.length : length;

  const createRoundedRectShape = (w: number, h: number, r: number) => {
    const shape = new THREE.Shape();
    const hw = w / 2;
    const hh = h / 2;
    const radius = Math.min(r, hw, hh);

    shape.moveTo(-hw + radius, -hh);
    shape.lineTo(hw - radius, -hh);
    shape.quadraticCurveTo(hw, -hh, hw, -hh + radius);
    shape.lineTo(hw, hh - radius);
    shape.quadraticCurveTo(hw, hh, hw - radius, hh);
    shape.lineTo(-hw + radius, hh);
    shape.quadraticCurveTo(-hw, hh, -hw, hh - radius);
    shape.lineTo(-hw, -hh + radius);
    shape.quadraticCurveTo(-hw, -hh, -hw + radius, -hh);

    return shape;
  };

  const geometry = useMemo(() => {
    const outer = createRoundedRectShape(outerWidth, outerHeight, cornerRadius);
    const inner = createRoundedRectShape(innerWidth, innerHeight, cornerRadius);

    const segments = 32;
    const outerPoints = outer.getPoints(segments);
    const innerPoints = inner.getPoints(segments);

    const bottomOffset = calculateRectBottomOffset(bottomCut, outerPoints);

    const n = outerPoints.length;
    const positions: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i < n; i++) {
      const topZOuter = getRectTopZForPreview(
        outerPoints[i].x,
        mainLength,
        topCut,
      );
      const topZInner = getRectTopZForPreview(
        innerPoints[i].x,
        mainLength,
        topCut,
      );
      const bottomZOuter = getRectBottomZForPreview(
        outerPoints[i].x,
        bottomCut,
        bottomOffset,
      );
      const bottomZInner = getRectBottomZForPreview(
        innerPoints[i].x,
        bottomCut,
        bottomOffset,
      );

      positions.push(outerPoints[i].x, bottomZOuter, outerPoints[i].y);
      positions.push(innerPoints[i].x, bottomZInner, innerPoints[i].y);
      positions.push(outerPoints[i].x, topZOuter, outerPoints[i].y);
      positions.push(innerPoints[i].x, topZInner, innerPoints[i].y);
    }

    for (let i = 0; i < n - 1; i++) {
      const curr = i * 4;
      const next = (i + 1) * 4;

      indices.push(curr + 0, next + 0, curr + 2);
      indices.push(next + 0, next + 2, curr + 2);
      indices.push(curr + 1, curr + 3, next + 1);
      indices.push(next + 1, curr + 3, next + 3);
      indices.push(curr + 0, curr + 1, next + 0);
      indices.push(next + 0, curr + 1, next + 1);
      indices.push(curr + 2, next + 2, curr + 3);
      indices.push(next + 2, next + 3, curr + 3);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [
    innerWidth,
    innerHeight,
    outerWidth,
    outerHeight,
    cornerRadius,
    mainLength,
    topCut,
    bottomCut,
  ]);

  const flareGeometry = useMemo(() => {
    if (!useFlare) return null;

    const flareW = flare.width + flare.clearance * 2;
    const flareH =
      (isSquare ? flare.width : flare.height) + flare.clearance * 2;

    const outerShape = createRoundedRectShape(
      outerWidth,
      outerHeight,
      cornerRadius,
    );
    const flareOuter = createRoundedRectShape(flareW, flareH, cornerRadius);
    const innerShape = createRoundedRectShape(
      innerWidth,
      innerHeight,
      cornerRadius,
    );

    const segments = 32;
    const outerPoints = outerShape.getPoints(segments);
    const flarePoints = flareOuter.getPoints(segments);
    const innerPoints = innerShape.getPoints(segments);
    const n = outerPoints.length;

    const positions: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i < n; i++) {
      positions.push(outerPoints[i].x, 0, outerPoints[i].y);
      positions.push(innerPoints[i].x, 0, innerPoints[i].y);
      positions.push(flarePoints[i].x, flare.length, flarePoints[i].y);
      positions.push(innerPoints[i].x, flare.length, innerPoints[i].y);
    }

    for (let i = 0; i < n - 1; i++) {
      const curr = i * 4;
      const next = (i + 1) * 4;

      indices.push(curr, next, curr + 2);
      indices.push(next, next + 2, curr + 2);
      indices.push(curr + 1, curr + 3, next + 1);
      indices.push(next + 1, curr + 3, next + 3);
      indices.push(curr + 2, next + 2, curr + 3);
      indices.push(next + 2, next + 3, curr + 3);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [
    flare,
    outerWidth,
    outerHeight,
    innerWidth,
    innerHeight,
    cornerRadius,
    isSquare,
    useFlare,
  ]);

  return (
    <group position={[0, 0, 0]}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color="#b8c4ce"
          metalness={0.85}
          roughness={0.15}
          side={THREE.DoubleSide}
          envMapIntensity={1.2}
        />
      </mesh>
      {flareGeometry && (
        <mesh geometry={flareGeometry} position={[0, mainLength, 0]}>
          <meshStandardMaterial
            color="#b8c4ce"
            metalness={0.85}
            roughness={0.15}
            side={THREE.DoubleSide}
            envMapIntensity={1.2}
          />
        </mesh>
      )}
    </group>
  );
}

function TubeMesh({ config }: { config: TubeConfig }) {
  if (config.shape === "round") {
    return <RoundTubeMesh config={config} />;
  }
  return <RectangularTubeMesh config={config} />;
}

export function TubePreview({ config }: TubePreviewProps) {
  const maxDimension = Math.max(
    config.length,
    config.shape === "round"
      ? config.outerDiameter
      : config.shape === "square"
        ? config.outerSize
        : Math.max(config.outerWidth, config.outerHeight),
  );

  const cameraDistance = maxDimension * 2.5;

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
        far: maxDimension * 20,
      }}
      style={{
        background: "linear-gradient(180deg, #e2e8f0 0%, #94a3b8 100%)",
      }}
    >
      <Environment preset="studio" />

      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
      <directionalLight position={[-10, 10, -10]} intensity={0.5} />
      <directionalLight position={[0, -10, 0]} intensity={0.2} />

      <group>
        <TubeMesh config={config} />
        <DimensionIndicators config={config} />
      </group>

      <GridFloor size={maxDimension} />

      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.4}
        scale={maxDimension * 2}
        blur={2}
        far={maxDimension}
      />

      <OrbitControls
        makeDefault
        minDistance={maxDimension * 0.5}
        maxDistance={maxDimension * 5}
        target={[0, config.length / 2, 0]}
      />

      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport labelColor="white" axisHeadScale={1} />
      </GizmoHelper>
    </Canvas>
  );
}
