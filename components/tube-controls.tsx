"use client";

import type React from "react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type {
  TubeConfig,
  TubeShape,
  RoundTubeConfig,
  SquareTubeConfig,
  RectangularTubeConfig,
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
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="relative">
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number.parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          className="pr-10 bg-muted/50 border-border/50 h-9"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {unit}
        </span>
      </div>
    </div>
  );
}

function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-muted/50 rounded-md px-2 -mx-2">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 space-y-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

function EndCutControls({
  label,
  cutConfig,
  onChange,
  outerSize,
  disabled = false,
}: {
  label: string;
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
    <div className="space-y-3">
      <Select
        value={cutConfig.type}
        onValueChange={(v) => handleTypeChange(v as CutType)}
        disabled={disabled}
      >
        <SelectTrigger className="bg-muted/50 border-border/50">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="flat">Flat (Standard)</SelectItem>
          <SelectItem value="miter">Miter (Angled)</SelectItem>
          <SelectItem value="chamfer">Chamfer (Beveled Edge)</SelectItem>
          <SelectItem value="saddle">Saddle (T-Joint / Fish-mouth)</SelectItem>
        </SelectContent>
      </Select>

      {cutConfig.type === "miter" && (
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="Miter Angle"
            value={cutConfig.angle}
            onChange={(v) => onChange({ ...cutConfig, angle: v })}
            min={0}
            max={60}
            step={1}
            unit="°"
          />
        </div>
      )}

      {cutConfig.type === "chamfer" && (
        <div className="grid grid-cols-2 gap-3">
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
        </div>
      )}

      {cutConfig.type === "saddle" && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Creates a curved cut to fit against another cylindrical pipe
          </p>
          <div className="grid grid-cols-2 gap-3">
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
          </div>
        </div>
      )}
    </div>
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
    <div className="space-y-4">
      {/* Shape Selection */}
      <Section title="Tube Shape" defaultOpen={true}>
        <Select
          value={config.shape}
          onValueChange={(v) => handleShapeChange(v as TubeShape)}
        >
          <SelectTrigger className="bg-muted/50 border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="round">Round / Circular</SelectItem>
            <SelectItem value="square">Square</SelectItem>
            <SelectItem value="rectangular">Rectangular</SelectItem>
          </SelectContent>
        </Select>
      </Section>

      <Separator className="bg-border/50" />

      {/* Dimensions */}
      <Section title="Dimensions" defaultOpen={true}>
        <div className="grid grid-cols-2 gap-3">
          {config.shape === "round" && (
            <>
              <NumberInput
                label="Inner Diameter"
                value={(config as RoundTubeConfig).innerDiameter}
                onChange={(v) =>
                  updateConfig({ innerDiameter: v } as Partial<RoundTubeConfig>)
                }
                step={0.5}
              />
              <NumberInput
                label="Outer Diameter"
                value={(config as RoundTubeConfig).outerDiameter}
                onChange={(v) =>
                  updateConfig({ outerDiameter: v } as Partial<RoundTubeConfig>)
                }
                step={0.5}
              />
            </>
          )}

          {config.shape === "square" && (
            <>
              <NumberInput
                label="Inner Size"
                value={(config as SquareTubeConfig).innerSize}
                onChange={(v) =>
                  updateConfig({ innerSize: v } as Partial<SquareTubeConfig>)
                }
                step={0.5}
              />
              <NumberInput
                label="Outer Size"
                value={(config as SquareTubeConfig).outerSize}
                onChange={(v) =>
                  updateConfig({ outerSize: v } as Partial<SquareTubeConfig>)
                }
                step={0.5}
              />
              <NumberInput
                label="Corner Radius"
                value={(config as SquareTubeConfig).cornerRadius}
                onChange={(v) =>
                  updateConfig({ cornerRadius: v } as Partial<SquareTubeConfig>)
                }
                step={0.5}
              />
            </>
          )}

          {config.shape === "rectangular" && (
            <>
              <NumberInput
                label="Inner Width"
                value={(config as RectangularTubeConfig).innerWidth}
                onChange={(v) =>
                  updateConfig({
                    innerWidth: v,
                  } as Partial<RectangularTubeConfig>)
                }
                step={0.5}
              />
              <NumberInput
                label="Inner Height"
                value={(config as RectangularTubeConfig).innerHeight}
                onChange={(v) =>
                  updateConfig({
                    innerHeight: v,
                  } as Partial<RectangularTubeConfig>)
                }
                step={0.5}
              />
              <NumberInput
                label="Outer Width"
                value={(config as RectangularTubeConfig).outerWidth}
                onChange={(v) =>
                  updateConfig({
                    outerWidth: v,
                  } as Partial<RectangularTubeConfig>)
                }
                step={0.5}
              />
              <NumberInput
                label="Outer Height"
                value={(config as RectangularTubeConfig).outerHeight}
                onChange={(v) =>
                  updateConfig({
                    outerHeight: v,
                  } as Partial<RectangularTubeConfig>)
                }
                step={0.5}
              />
              <NumberInput
                label="Corner Radius"
                value={(config as RectangularTubeConfig).cornerRadius}
                onChange={(v) =>
                  updateConfig({
                    cornerRadius: v,
                  } as Partial<RectangularTubeConfig>)
                }
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
        </div>
      </Section>

      <Separator className="bg-border/50" />

      <Section title="Top End" defaultOpen={true}>
        <EndCutControls
          label="Top Cut"
          cutConfig={config.topCut}
          onChange={(cut) => updateConfig({ topCut: cut })}
          outerSize={getOuterSize()}
        />
        {config.topCut.type !== "flat" && config.flare.enabled && (
          <p className="text-xs text-amber-500">
            Flare disabled - only works with flat top cut
          </p>
        )}
      </Section>

      <Separator className="bg-border/50" />

      <Section title="Bottom End" defaultOpen={false}>
        <EndCutControls
          label="Bottom Cut"
          cutConfig={config.bottomCut}
          onChange={(cut) => updateConfig({ bottomCut: cut })}
          outerSize={getOuterSize()}
        />
      </Section>

      <Separator className="bg-border/50" />

      <Section title="Press-Fit Flare" defaultOpen={true}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label className="text-xs font-medium">Enable Flare</Label>
              <p className="text-xs text-muted-foreground">
                Add a flared end for press-fit connections
              </p>
            </div>
            <Switch
              checked={config.flare.enabled && canUseFlare}
              onCheckedChange={(v) => updateFlare({ enabled: v })}
              disabled={!canUseFlare}
            />
          </div>

          {!canUseFlare && (
            <p className="text-xs text-amber-500">
              Flare only available with flat top cut
            </p>
          )}

          {config.flare.enabled && canUseFlare && (
            <>
              <Separator className="bg-border/30" />

              {/* Basic flare dimensions */}
              <div className="space-y-3">
                <Label className="text-xs font-medium">Flare Dimensions</Label>
                <div className="grid grid-cols-2 gap-3">
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
                </div>
              </div>

              <Separator className="bg-border/30" />

              {/* Fit tolerance controls */}
              <div className="space-y-3">
                <Label className="text-xs font-medium">Fit Tolerance</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Fit Type
                    </Label>
                    <Select
                      value={config.flare.fitType}
                      onValueChange={(v) =>
                        updateFlare({ fitType: v as FlareConfig["fitType"] })
                      }
                    >
                      <SelectTrigger className="bg-muted/50 border-border/50 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="loose">Loose (0.3mm)</SelectItem>
                        <SelectItem value="snug">Snug (0.15mm)</SelectItem>
                        <SelectItem value="interference">
                          Interference (-0.05mm)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <NumberInput
                    label="Clearance"
                    value={config.flare.clearance}
                    onChange={(v) => updateFlare({ clearance: v })}
                    min={-0.2}
                    max={1}
                    step={0.05}
                  />
                </div>
                {config.flare.fitType === "interference" && (
                  <p className="text-xs text-amber-500">
                    Warning: Interference fit may require force to assemble
                  </p>
                )}
              </div>

              <Separator className="bg-border/30" />

              {/* Lead-in chamfer */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-medium">
                      Lead-in Chamfer
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Easier assembly, less elephant-foot issues
                    </p>
                  </div>
                  <Switch
                    checked={config.flare.leadInChamfer}
                    onCheckedChange={(v) => updateFlare({ leadInChamfer: v })}
                  />
                </div>
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
              </div>

              <Separator className="bg-border/30" />

              {/* Stop shoulder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-medium">Stop Shoulder</Label>
                    <p className="text-xs text-muted-foreground">
                      Internal step for consistent seating
                    </p>
                  </div>
                  <Switch
                    checked={config.flare.stopShoulder}
                    onCheckedChange={(v) => updateFlare({ stopShoulder: v })}
                  />
                </div>
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
              </div>

              <Separator className="bg-border/30" />

              {/* Anti-rotation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-medium">Anti-Rotation</Label>
                    <p className="text-xs text-muted-foreground">
                      Prevents press-fit parts from spinning
                    </p>
                  </div>
                  <Switch
                    checked={config.flare.antiRotation}
                    onCheckedChange={(v) => updateFlare({ antiRotation: v })}
                  />
                </div>
                {config.flare.antiRotation && (
                  <Select
                    value={config.flare.antiRotationType}
                    onValueChange={(v) =>
                      updateFlare({
                        antiRotationType: v as FlareConfig["antiRotationType"],
                      })
                    }
                  >
                    <SelectTrigger className="bg-muted/50 border-border/50 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flat">Flat (D-shape)</SelectItem>
                      <SelectItem value="key">Key (Slot)</SelectItem>
                      <SelectItem value="notch">Notch</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </>
          )}
        </div>
      </Section>
    </div>
  );
}
