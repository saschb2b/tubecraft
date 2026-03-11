"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import { ExpandMore } from "@mui/icons-material";
import type {
  AdapterConfig,
  TubeSpec,
  AdapterEndShape,
} from "@/lib/adapter-types";
import {
  DEFAULT_ROUND_TUBE,
  DEFAULT_SQUARE_TUBE,
  DEFAULT_RECTANGULAR_TUBE,
} from "@/lib/adapter-types";

interface AdapterControlsProps {
  config: AdapterConfig;
  onChange: (config: AdapterConfig) => void;
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit = "mm",
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}) {
  return (
    <TextField
      label={label}
      type="number"
      size="small"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      slotProps={{
        htmlInput: { min, max, step },
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <Typography variant="caption" color="text.secondary">
                {unit}
              </Typography>
            </InputAdornment>
          ),
        },
      }}
      fullWidth
    />
  );
}

function TubeEndControls({
  label,
  tube,
  onChange,
  defaultExpanded = true,
}: {
  label: string;
  tube: TubeSpec;
  onChange: (tube: TubeSpec) => void;
  defaultExpanded?: boolean;
}) {
  const handleShapeChange = (shape: AdapterEndShape) => {
    if (shape === tube.shape) return;

    let newTube: TubeSpec;
    switch (shape) {
      case "round":
        newTube = { ...DEFAULT_ROUND_TUBE };
        break;
      case "square":
        newTube = { ...DEFAULT_SQUARE_TUBE };
        break;
      case "rectangular":
        newTube = { ...DEFAULT_RECTANGULAR_TUBE };
        break;
    }
    onChange(newTube);
  };

  return (
    <Accordion defaultExpanded={defaultExpanded}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="body2" fontWeight={500}>
          {label}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={1.5}>
          {/* Shape Selection */}
          <TextField
            select
            label="Tube Shape"
            size="small"
            value={tube.shape}
            onChange={(e) =>
              handleShapeChange(e.target.value as AdapterEndShape)
            }
            fullWidth
          >
            <MenuItem value="round">Round / Circular</MenuItem>
            <MenuItem value="square">Square</MenuItem>
            <MenuItem value="rectangular">Rectangular</MenuItem>
          </TextField>

          {/* Dimensions */}
          <Typography variant="caption" color="text.secondary">
            Enter the outer dimensions of the tube that will connect here.
          </Typography>

          {tube.shape === "round" && (
            <NumberField
              label="Tube Outer Diameter"
              value={tube.outerDiameter}
              onChange={(v) => onChange({ ...tube, outerDiameter: v })}
              min={1}
            />
          )}

          {tube.shape === "square" && (
            <>
              <NumberField
                label="Tube Outer Size"
                value={tube.outerSize}
                onChange={(v) => onChange({ ...tube, outerSize: v })}
                min={1}
              />
              <NumberField
                label="Corner Radius"
                value={tube.cornerRadius}
                onChange={(v) => onChange({ ...tube, cornerRadius: v })}
                min={0}
              />
            </>
          )}

          {tube.shape === "rectangular" && (
            <>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 1.5,
                }}
              >
                <NumberField
                  label="Tube Outer Width"
                  value={tube.outerWidth}
                  onChange={(v) => onChange({ ...tube, outerWidth: v })}
                  min={1}
                />
                <NumberField
                  label="Tube Outer Height"
                  value={tube.outerHeight}
                  onChange={(v) => onChange({ ...tube, outerHeight: v })}
                  min={1}
                />
              </Box>
              <NumberField
                label="Corner Radius"
                value={tube.cornerRadius}
                onChange={(v) => onChange({ ...tube, cornerRadius: v })}
                min={0}
              />
            </>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

export function AdapterControls({ config, onChange }: AdapterControlsProps) {
  return (
    <Stack spacing={0.5}>
      {/* End A - Bottom socket */}
      <TubeEndControls
        label="Socket A (Bottom)"
        tube={config.endA}
        onChange={(endA) => onChange({ ...config, endA })}
      />

      <Divider />

      {/* End B - Top socket */}
      <TubeEndControls
        label="Socket B (Top)"
        tube={config.endB}
        onChange={(endB) => onChange({ ...config, endB })}
        defaultExpanded
      />

      <Divider />

      {/* Adapter Body Settings */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="body2" fontWeight={500}>
            Adapter Body
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}
            >
              <NumberField
                label="Wall Thickness"
                value={config.wallThickness}
                onChange={(v) => onChange({ ...config, wallThickness: v })}
                min={1}
                step={0.5}
              />
              <NumberField
                label="Socket Depth"
                value={config.socketDepth}
                onChange={(v) => onChange({ ...config, socketDepth: v })}
                min={5}
              />
            </Box>
            <NumberField
              label="Socket Clearance (fit tolerance)"
              value={config.socketClearance}
              onChange={(v) => onChange({ ...config, socketClearance: v })}
              min={0}
              step={0.05}
            />
            <Typography variant="caption" color="text.secondary">
              0.2mm for snug fit, 0.3mm for loose fit
            </Typography>
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Divider />

      {/* Bend Settings */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="body2" fontWeight={500}>
            Elbow / Bend
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1.5}>
            <NumberField
              label="Bend Angle"
              value={config.bendAngle}
              onChange={(v) => onChange({ ...config, bendAngle: v })}
              min={0}
              max={180}
              unit="°"
            />
            <Typography variant="caption" color="text.secondary">
              0° = straight coupling, 45° = 45° elbow, 90° = 90° elbow
            </Typography>
            <NumberField
              label="Bend Radius (0 = auto)"
              value={config.bendRadius}
              onChange={(v) => onChange({ ...config, bendRadius: v })}
              min={0}
            />
            <Typography variant="caption" color="text.secondary">
              Leave at 0 to auto-calculate based on tube size
            </Typography>
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Divider />

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="body2" fontWeight={500}>
            Segments
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1.5}>
            <NumberField
              label="Amount of Segments"
              value={config.segmentAmount}
              onChange={(v) => onChange({ ...config, segmentAmount: v })}
              min={4}
              unit=""
            />
            <Typography variant="caption" color="text.secondary">
              Amount of Segments in a circle that the exported STL will have.
              Increasing this will increase the circular resolution at the
              expense of file size.
            </Typography>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
}
