"use client";

import React, { useState } from "react";
import {
  TextField,
  Typography,
  Box,
  Grid,
  Drawer,
  Avatar,
} from "@mui/material";
import AdapterPreview from "../components/AdapterPreview";
import STLGenerator from "../components/STLGenerator";
import { Stack } from "@mui/system";

const drawerWidth = 256;

export default function Home() {
  const [innerDiameter, setInnerDiameter] = useState(15);
  const [outerDiameter, setOuterDiameter] = useState(20);
  const [height, setHeight] = useState(10);

  return (
    <Box sx={{ display: "flex", flex: 1 }}>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            px: 2,
            py: 1,
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 3,
          }}
        >
          <Avatar sx={{ width: 24, height: 24 }}>T</Avatar>
          <Typography variant="h5">TubeCraft</Typography>
        </Box>
        <Stack flexDirection={"column"} component="form" gap={2}>
          <TextField
            label="Inner Diameter (mm)"
            type="number"
            fullWidth
            value={innerDiameter}
            onChange={(e) => setInnerDiameter(parseFloat(e.target.value))}
          />
          <TextField
            label="Outer Diameter (mm)"
            type="number"
            fullWidth
            value={outerDiameter}
            onChange={(e) => setOuterDiameter(parseFloat(e.target.value))}
          />
          <TextField
            label="Height (mm)"
            type="number"
            fullWidth
            value={height}
            onChange={(e) => setHeight(parseFloat(e.target.value))}
          />
        </Stack>
        <STLGenerator
          innerDiameter={innerDiameter}
          outerDiameter={outerDiameter}
          height={height}
        />
      </Drawer>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          p: 3,
          width: "100%",
          bgcolor: "action.hover",
        }}
      >
        <AdapterPreview
          innerDiameter={innerDiameter}
          outerDiameter={outerDiameter}
          height={height}
        />
      </Box>
    </Box>
  );
}
