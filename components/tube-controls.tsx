"use client";

import type React from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import Stack from "@mui/material/Stack";
import type {
  TubeConfig,
  TubeShape,
  CutType,
  EndCutConfig,
  FlareConfig,
} from "@/lib/tube-types";
import {
  DEFAULT_ROUND_CONFIG,
  DEFAULT_SQUARE_CONFIG,
  DEFAULT_RECTANGULAR_CONFIG,
} from "@/lib/tube-types";

interface TubeControlsProps {
  config: TubeConfig;
  onChange: (config: TubeConfig) => void;
}

function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
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
      onChange={(e) => onChange(Number.parseFloat(e.target.value) || 0)}
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

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant="overline"
      color="text.secondary"
      sx={{ letterSpacing: 1 }}
    >
      {children}
    </Typography>
  );
}

function EndCutControls({
  cutConfig,
  onChange,
  outerSize,
  disabled = false,
}: {
  cutConfig: EndCutConfig;
  onChange: (config: EndCutConfig) => void;
  outerSize: number;
  disabled?: boolean;
}) {
  const handleTypeChange = (type: CutType) => {
    let newCut: EndCutConfig;
    if (type === "flat") {
      newCut = { type: "flat" };
    } else if (type === "miter") {
      newCut = { type: "miter", angle: 45 };
    } else if (type === "chamfer") {
      newCut = { type: "chamfer", angle: 45, depth: 2 };
    } else {
      newCut = { type: "saddle", targetDiameter: outerSize * 2, angle: 90 };
    }
    onChange(newCut);
  };

  return (
    <Stack spacing={1.5}>
      <TextField
        select
        size="small"
        value={cutConfig.type}
        onChange={(e) => handleTypeChange(e.target.value as CutType)}
        disabled={disabled}
        fullWidth
      >
        <MenuItem value="flat">Flat (Standard)</MenuItem>
        <MenuItem value="miter">Miter (Angled)</MenuItem>
        <MenuItem value="chamfer">Chamfer (Beveled Edge)</MenuItem>
        <MenuItem value="saddle">Saddle (T-Joint / Fish-mouth)</MenuItem>
      </TextField>

      {cutConfig.type === "miter" && (
        <NumberInput
          label="Miter Angle"
          value={cutConfig.angle}
          onChange={(v) => onChange({ ...cutConfig, angle: v })}
          min={0}
          max={60}
          step={1}
          unit="°"
        />
      )}

      {cutConfig.type === "chamfer" && (
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
          <NumberInput
            label="Chamfer Angle"
            value={cutConfig.angle}
            onChange={(v) => onChange({ ...cutConfig, angle: v })}
            min={15}
            max={75}
            step={1}
            unit="°"
          />
          <NumberInput
            label="Chamfer Depth"
            value={cutConfig.depth}
            onChange={(v) => onChange({ ...cutConfig, depth: v })}
            min={0.5}
            max={10}
            step={0.5}
          />
        </Box>
      )}

      {cutConfig.type === "saddle" && (
        <>
          <Typography variant="caption" color="text.secondary">
            Creates a curved cut to fit against another cylindrical pipe
          </Typography>
          <Box
            sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}
          >
            <NumberInput
              label="Target Pipe Diameter"
              value={cutConfig.targetDiameter}
              onChange={(v) => onChange({ ...cutConfig, targetDiameter: v })}
              min={1}
              step={1}
            />
            <NumberInput
              label="Intersection Angle"
              value={cutConfig.angle}
              onChange={(v) => onChange({ ...cutConfig, angle: v })}
              min={45}
              max={90}
              step={1}
              unit="°"
            />
          </Box>
        </>
      )}
    </Stack>
  );
}

export function TubeControls({ config, onChange }: TubeControlsProps) {
  const handleShapeChange = (shape: TubeShape) => {
    if (shape === "round") {
      onChange({
        ...DEFAULT_ROUND_CONFIG,
        length: config.length,
        flare: config.flare,
        topCut: config.topCut,
        bottomCut: config.bottomCut,
      });
    } else if (shape === "square") {
      onChange({
        ...DEFAULT_SQUARE_CONFIG,
        length: config.length,
        flare: config.flare,
        topCut: config.topCut,
        bottomCut: config.bottomCut,
      });
    } else {
      onChange({
        ...DEFAULT_RECTANGULAR_CONFIG,
        length: config.length,
        flare: config.flare,
        topCut: config.topCut,
        bottomCut: config.bottomCut,
      });
    }
  };

  const updateConfig = (updates: Partial<TubeConfig>) => {
    onChange({ ...config, ...updates } as TubeConfig);
  };

  const updateFlare = (updates: Partial<FlareConfig>) => {
    onChange({
      ...config,
      flare: { ...config.flare, ...updates },
    } as TubeConfig);
  };

  const getOuterSize = () => {
    if (config.shape === "round") return config.outerDiameter;
    if (config.shape === "square") return config.outerSize;
    return config.outerWidth;
  };

  const canUseFlare = config.topCut.type === "flat";

  return (
    <Stack spacing={2.5}>
      {/* Shape */}
      <Stack spacing={1}>
        <SectionHeader>Tube Shape</SectionHeader>
        <TextField
          select
          size="small"
          value={config.shape}
          onChange={(e) => handleShapeChange(e.target.value as TubeShape)}
          fullWidth
        >
          <MenuItem value="round">Round / Circular</MenuItem>
          <MenuItem value="square">Square</MenuItem>
          <MenuItem value="rectangular">Rectangular</MenuItem>
        </TextField>
      </Stack>

      {/* Dimensions */}
      <Stack spacing={1}>
        <SectionHeader>Dimensions</SectionHeader>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
          {config.shape === "round" && (
            <>
              <NumberInput
                label="Inner Diameter"
                value={config.innerDiameter}
                onChange={(v) => updateConfig({ innerDiameter: v })}
                step={0.5}
              />
              <NumberInput
                label="Outer Diameter"
                value={config.outerDiameter}
                onChange={(v) => updateConfig({ outerDiameter: v })}
                step={0.5}
              />
            </>
          )}

          {config.shape === "square" && (
            <>
              <NumberInput
                label="Inner Size"
                value={config.innerSize}
                onChange={(v) => updateConfig({ innerSize: v })}
                step={0.5}
              />
              <NumberInput
                label="Outer Size"
                value={config.outerSize}
                onChange={(v) => updateConfig({ outerSize: v })}
                step={0.5}
              />
              <NumberInput
                label="Corner Radius"
                value={config.cornerRadius}
                onChange={(v) => updateConfig({ cornerRadius: v })}
                step={0.5}
              />
            </>
          )}

          {config.shape === "rectangular" && (
            <>
              <NumberInput
                label="Inner Width"
                value={config.innerWidth}
                onChange={(v) => updateConfig({ innerWidth: v })}
                step={0.5}
              />
              <NumberInput
                label="Inner Height"
                value={config.innerHeight}
                onChange={(v) => updateConfig({ innerHeight: v })}
                step={0.5}
              />
              <NumberInput
                label="Outer Width"
                value={config.outerWidth}
                onChange={(v) => updateConfig({ outerWidth: v })}
                step={0.5}
              />
              <NumberInput
                label="Outer Height"
                value={config.outerHeight}
                onChange={(v) => updateConfig({ outerHeight: v })}
                step={0.5}
              />
              <NumberInput
                label="Corner Radius"
                value={config.cornerRadius}
                onChange={(v) => updateConfig({ cornerRadius: v })}
                step={0.5}
              />
            </>
          )}

          <NumberInput
            label="Length"
            value={config.length}
            onChange={(v) => updateConfig({ length: v })}
            step={1}
          />
        </Box>
      </Stack>

      {/* Top End */}
      <Stack spacing={1}>
        <SectionHeader>Top End</SectionHeader>
        <EndCutControls
          cutConfig={config.topCut}
          onChange={(cut) => updateConfig({ topCut: cut })}
          outerSize={getOuterSize()}
        />
        {config.topCut.type !== "flat" && config.flare.enabled && (
          <Typography variant="caption" color="warning.main">
            Flare disabled - only works with flat top cut
          </Typography>
        )}
      </Stack>

      {/* Bottom End */}
      <Stack spacing={1}>
        <SectionHeader>Bottom End</SectionHeader>
        <EndCutControls
          cutConfig={config.bottomCut}
          onChange={(cut) => updateConfig({ bottomCut: cut })}
          outerSize={getOuterSize()}
        />
      </Stack>

      {/* Press-Fit Flare */}
      <Stack spacing={1.5}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <SectionHeader>Press-Fit Flare</SectionHeader>
            <Typography variant="caption" color="text.secondary" display="block">
              Add a flared end for press-fit connections
            </Typography>
          </Box>
          <Switch
            checked={config.flare.enabled && canUseFlare}
            onChange={(e) => updateFlare({ enabled: e.target.checked })}
            disabled={!canUseFlare}
          />
        </Box>

        {!canUseFlare && (
          <Typography variant="caption" color="warning.main">
            Flare only available with flat top cut
          </Typography>
        )}

        {config.flare.enabled && canUseFlare && (
          <Stack spacing={2}>
            {/* Flare dimensions */}
            <Stack spacing={1}>
              <Typography variant="body2" fontWeight={500}>
                Flare Dimensions
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 1.5,
                }}
              >
                {config.shape === "round" && (
                  <NumberInput
                    label="Flare Diameter"
                    value={config.flare.diameter}
                    onChange={(v) => updateFlare({ diameter: v })}
                    step={0.5}
                  />
                )}

                {(config.shape === "square" ||
                  config.shape === "rectangular") && (
                  <>
                    <NumberInput
                      label="Flare Width"
                      value={config.flare.width}
                      onChange={(v) => updateFlare({ width: v })}
                      step={0.5}
                    />
                    {config.shape === "rectangular" && (
                      <NumberInput
                        label="Flare Height"
                        value={config.flare.height}
                        onChange={(v) => updateFlare({ height: v })}
                        step={0.5}
                      />
                    )}
                  </>
                )}

                <NumberInput
                  label="Flare Length"
                  value={config.flare.length}
                  onChange={(v) => updateFlare({ length: v })}
                  step={1}
                />
              </Box>
            </Stack>

            {/* Fit tolerance */}
            <Stack spacing={1}>
              <Typography variant="body2" fontWeight={500}>
                Fit Tolerance
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 1.5,
                }}
              >
                <TextField
                  select
                  size="small"
                  label="Fit Type"
                  value={config.flare.fitType}
                  onChange={(e) =>
                    updateFlare({
                      fitType: e.target.value as FlareConfig["fitType"],
                    })
                  }
                  fullWidth
                >
                  <MenuItem value="loose">Loose (0.3mm)</MenuItem>
                  <MenuItem value="snug">Snug (0.15mm)</MenuItem>
                  <MenuItem value="interference">
                    Interference (-0.05mm)
                  </MenuItem>
                </TextField>
                <NumberInput
                  label="Clearance"
                  value={config.flare.clearance}
                  onChange={(v) => updateFlare({ clearance: v })}
                  min={-0.2}
                  max={1}
                  step={0.05}
                />
              </Box>
              {config.flare.fitType === "interference" && (
                <Typography variant="caption" color="warning.main">
                  Warning: Interference fit may require force to assemble
                </Typography>
              )}
            </Stack>

            {/* Lead-in chamfer */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  Lead-in Chamfer
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Easier assembly, less elephant-foot issues
                </Typography>
              </Box>
              <Switch
                checked={config.flare.leadInChamfer}
                onChange={(e) =>
                  updateFlare({ leadInChamfer: e.target.checked })
                }
              />
            </Box>
            {config.flare.leadInChamfer && (
              <NumberInput
                label="Chamfer Angle"
                value={config.flare.leadInAngle}
                onChange={(v) => updateFlare({ leadInAngle: v })}
                min={30}
                max={60}
                step={5}
                unit="°"
              />
            )}

            {/* Stop shoulder */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  Stop Shoulder
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Internal step for consistent seating
                </Typography>
              </Box>
              <Switch
                checked={config.flare.stopShoulder}
                onChange={(e) =>
                  updateFlare({ stopShoulder: e.target.checked })
                }
              />
            </Box>
            {config.flare.stopShoulder && (
              <NumberInput
                label="Stop Depth"
                value={config.flare.stopDepth}
                onChange={(v) => updateFlare({ stopDepth: v })}
                min={1}
                max={10}
                step={0.5}
              />
            )}

            {/* Anti-rotation */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  Anti-Rotation
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Prevents press-fit parts from spinning
                </Typography>
              </Box>
              <Switch
                checked={config.flare.antiRotation}
                onChange={(e) =>
                  updateFlare({ antiRotation: e.target.checked })
                }
              />
            </Box>
            {config.flare.antiRotation && (
              <TextField
                select
                size="small"
                value={config.flare.antiRotationType}
                onChange={(e) =>
                  updateFlare({
                    antiRotationType: e.target
                      .value as FlareConfig["antiRotationType"],
                  })
                }
                fullWidth
              >
                <MenuItem value="flat">Flat (D-shape)</MenuItem>
                <MenuItem value="key">Key (Slot)</MenuItem>
                <MenuItem value="notch">Notch</MenuItem>
              </TextField>
            )}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
