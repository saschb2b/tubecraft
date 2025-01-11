"use client";

import React, { useState } from "react";
import { TextField, Container, Typography, Box, Grid } from "@mui/material";
import AdapterPreview from "../components/AdapterPreview";
import STLGenerator from "../components/STLGenerator";

export default function Home() {
  const [innerDiameter, setInnerDiameter] = useState(15);
  const [outerDiameter, setOuterDiameter] = useState(20);
  const [height, setHeight] = useState(10);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        3D Adapter Configurator
      </Typography>
      <Box component="form" sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Inner Diameter (mm)"
              type="number"
              fullWidth
              value={innerDiameter}
              onChange={(e) => setInnerDiameter(parseFloat(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Outer Diameter (mm)"
              type="number"
              fullWidth
              value={outerDiameter}
              onChange={(e) => setOuterDiameter(parseFloat(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Height (mm)"
              type="number"
              fullWidth
              value={height}
              onChange={(e) => setHeight(parseFloat(e.target.value))}
            />
          </Grid>
        </Grid>
      </Box>

      <AdapterPreview
        innerDiameter={innerDiameter}
        outerDiameter={outerDiameter}
        height={height}
      />

      <STLGenerator
        innerDiameter={innerDiameter}
        outerDiameter={outerDiameter}
        height={height}
      />
    </Container>
  );
}
