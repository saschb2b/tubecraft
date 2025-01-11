"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Cylinder } from "@react-three/drei";
import { Box } from "@mui/material";

const AdapterPreview = ({
  innerDiameter,
  outerDiameter,
  height,
}: {
  innerDiameter: number;
  outerDiameter: number;
  height: number;
}) => {
  // Calculate the maximum dimension to determine the camera distance
  const maxDimension = Math.max(innerDiameter, outerDiameter, height);
  const cameraDistance = maxDimension * 2; // Adjust multiplier as needed for optimal zoom

  return (
    <Box sx={{ width: "100%", height: 400, mt: 3 }}>
      <Canvas
        camera={{
          position: [cameraDistance, cameraDistance, cameraDistance], // Position the camera diagonally
          near: 0.1,
          far: 1000,
        }}
      >
        <ambientLight />
        <OrbitControls
          enableDamping={true}
          dampingFactor={0.1}
          rotateSpeed={0.5}
          target={[0, height / 2, 0]} // Focus on the center of the adapter
        />
        {/* Add GridHelper for the grid background */}
        <gridHelper args={[maxDimension * 2, 20]} />
        <Cylinder
          args={[outerDiameter / 2, outerDiameter / 2, height, 32]}
          position={[0, height / 2, 0]}
        >
          <meshStandardMaterial attach="material" color="gray" />
        </Cylinder>
        <Cylinder
          args={[innerDiameter / 2, innerDiameter / 2, height + 1, 32]}
          position={[0, height / 2, 0]}
        >
          <meshStandardMaterial attach="material" color="white" />
        </Cylinder>
      </Canvas>
    </Box>
  );
};

export default AdapterPreview;
