"use client";

import React from "react";
import { primitives, booleans } from "@jscad/modeling";
// @ts-ignore
import { serialize } from "@jscad/stl-serializer";
import { Button } from "@mui/material";

const STLGenerator = ({
  innerDiameter,
  outerDiameter,
  height,
}: {
  innerDiameter: number;
  outerDiameter: number;
  height: number;
}) => {
  const generateSTL = () => {
    // Create outer cylinder
    const outerCylinder = primitives.cylinder({
      height,
      radius: outerDiameter / 2,
      segments: 32,
    });

    // Create inner cylinder
    const innerCylinder = primitives.cylinder({
      height: height + 1, // Slightly taller to avoid artifacts
      radius: innerDiameter / 2,
      segments: 32,
    });

    // Subtract inner cylinder from outer cylinder
    const adapter = booleans.subtract(outerCylinder, innerCylinder);

    // Serialize to STL
    const stlData = serialize({ binary: false }, adapter);

    // Create a downloadable STL file
    const blob = new Blob(stlData, { type: "application/sla" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tube_adapter_inner${innerDiameter}mm_outer${outerDiameter}mm_height${height}mm.stl`;
    link.click();
  };

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={generateSTL}
      sx={{ marginTop: 2 }}
    >
      Download STL
    </Button>
  );
};

export default STLGenerator;
