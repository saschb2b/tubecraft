"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type {
  AdapterConfig,
  TubeSpec,
  AdapterEndShape,
  RoundTubeSpec,
  SquareTubeSpec,
  RectangularTubeSpec,
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

function TubeEndControls({
  label,
  tube,
  onChange,
}: {
  label: string;
  tube: TubeSpec;
  onChange: (tube: TubeSpec) => void;
}) {
  const [open, setOpen] = useState(true);

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
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium hover:text-foreground text-foreground/80 transition-colors">
        {label}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 pb-4">
        {/* Shape Selection */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Tube Shape</Label>
          <Select value={tube.shape} onValueChange={handleShapeChange}>
            <SelectTrigger className="bg-muted/50 border-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="round">Round / Circular</SelectItem>
              <SelectItem value="square">Square</SelectItem>
              <SelectItem value="rectangular">Rectangular</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Dimensions - specifying the TUBE that will connect */}
        <p className="text-xs text-muted-foreground">
          Enter the outer dimensions of the tube that will connect here.
        </p>

        {tube.shape === "round" && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Tube Outer Diameter
            </Label>
            <div className="relative">
              <Input
                type="number"
                value={(tube as RoundTubeSpec).outerDiameter}
                onChange={(e) =>
                  onChange({
                    ...tube,
                    outerDiameter: Number(e.target.value),
                  } as RoundTubeSpec)
                }
                className="bg-muted/50 border-0 pr-8"
                min={1}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                mm
              </span>
            </div>
          </div>
        )}

        {tube.shape === "square" && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Tube Outer Size
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  value={(tube as SquareTubeSpec).outerSize}
                  onChange={(e) =>
                    onChange({
                      ...tube,
                      outerSize: Number(e.target.value),
                    } as SquareTubeSpec)
                  }
                  className="bg-muted/50 border-0 pr-8"
                  min={1}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  mm
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Corner Radius
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  value={(tube as SquareTubeSpec).cornerRadius}
                  onChange={(e) =>
                    onChange({
                      ...tube,
                      cornerRadius: Number(e.target.value),
                    } as SquareTubeSpec)
                  }
                  className="bg-muted/50 border-0 pr-8"
                  min={0}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  mm
                </span>
              </div>
            </div>
          </>
        )}

        {tube.shape === "rectangular" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Tube Outer Width
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={(tube as RectangularTubeSpec).outerWidth}
                    onChange={(e) =>
                      onChange({
                        ...tube,
                        outerWidth: Number(e.target.value),
                      } as RectangularTubeSpec)
                    }
                    className="bg-muted/50 border-0 pr-8"
                    min={1}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    mm
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Tube Outer Height
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={(tube as RectangularTubeSpec).outerHeight}
                    onChange={(e) =>
                      onChange({
                        ...tube,
                        outerHeight: Number(e.target.value),
                      } as RectangularTubeSpec)
                    }
                    className="bg-muted/50 border-0 pr-8"
                    min={1}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    mm
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Corner Radius
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  value={(tube as RectangularTubeSpec).cornerRadius}
                  onChange={(e) =>
                    onChange({
                      ...tube,
                      cornerRadius: Number(e.target.value),
                    } as RectangularTubeSpec)
                  }
                  className="bg-muted/50 border-0 pr-8"
                  min={0}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  mm
                </span>
              </div>
            </div>
          </>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AdapterControls({ config, onChange }: AdapterControlsProps) {
  const [adapterOpen, setAdapterOpen] = useState(true);
  const [bendOpen, setBendOpen] = useState(true);
  const [segmentOpen, setSegmentOpen] = useState(false);

  return (
    <div className="space-y-1">
      {/* End A - Bottom socket */}
      <TubeEndControls
        label="Socket A (Bottom)"
        tube={config.endA}
        onChange={(endA) => onChange({ ...config, endA })}
      />

      <Separator />

      {/* End B - Top socket */}
      <TubeEndControls
        label="Socket B (Top)"
        tube={config.endB}
        onChange={(endB) => onChange({ ...config, endB })}
      />

      <Separator />

      {/* Adapter Body Settings */}
      <Collapsible open={adapterOpen} onOpenChange={setAdapterOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium hover:text-foreground text-foreground/80 transition-colors">
          Adapter Body
          <ChevronDown
            className={`h-4 w-4 transition-transform ${adapterOpen ? "rotate-180" : ""}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Wall Thickness
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  value={config.wallThickness}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      wallThickness: Number(e.target.value),
                    })
                  }
                  className="bg-muted/50 border-0 pr-8"
                  min={1}
                  step={0.5}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  mm
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Socket Depth
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  value={config.socketDepth}
                  onChange={(e) =>
                    onChange({ ...config, socketDepth: Number(e.target.value) })
                  }
                  className="bg-muted/50 border-0 pr-8"
                  min={5}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  mm
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Socket Clearance (fit tolerance)
            </Label>
            <div className="relative">
              <Input
                type="number"
                value={config.socketClearance}
                onChange={(e) =>
                  onChange({
                    ...config,
                    socketClearance: Number(e.target.value),
                  })
                }
                className="bg-muted/50 border-0 pr-8"
                min={0}
                step={0.05}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                mm
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              0.2mm for snug fit, 0.3mm for loose fit
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Bend Settings */}
      <Collapsible open={bendOpen} onOpenChange={setBendOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium hover:text-foreground text-foreground/80 transition-colors">
          Elbow / Bend
          <ChevronDown
            className={`h-4 w-4 transition-transform ${bendOpen ? "rotate-180" : ""}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pb-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Bend Angle</Label>
            <div className="relative">
              <Input
                type="number"
                value={config.bendAngle}
                onChange={(e) =>
                  onChange({ ...config, bendAngle: Number(e.target.value) })
                }
                className="bg-muted/50 border-0 pr-6"
                min={0}
                max={180}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                °
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              0° = straight coupling, 45° = 45° elbow, 90° = 90° elbow
            </p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Bend Radius (0 = auto)
            </Label>
            <div className="relative">
              <Input
                type="number"
                value={config.bendRadius}
                onChange={(e) =>
                  onChange({ ...config, bendRadius: Number(e.target.value) })
                }
                className="bg-muted/50 border-0 pr-8"
                min={0}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                mm
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Leave at 0 to auto-calculate based on tube size
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
      <Separator />

      <Collapsible open={segmentOpen} onOpenChange={setSegmentOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium hover:text-foreground text-foreground/80 transition-colors">
          Segments
          <ChevronDown
            className={`h-4 w-4 transition-transform ${segmentOpen ? "rotate-180" : ""}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pb-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Amount of Segments</Label>
            <div className="relative">
              <Input
                type="number"
                value={config.segmentAmount}
                onChange={(e) =>
                  onChange({ ...config, segmentAmount: Number(e.target.value) })
                }
                className="bg-muted/50 border-0 pr-6"
                min={4}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                °
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Amount of Segments in a circle that the exported STL will have. Increasing this will increase the circular resolution at the expense of file size.
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function Separator() {
  return <div className="border-t border-border my-2" />;
}
