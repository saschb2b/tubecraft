"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TubePreview } from "@/components/tube-preview";
import { TubeControls } from "@/components/tube-controls";
import { AdapterPreview } from "@/components/adapter-preview";
import { AdapterControls } from "@/components/adapter-controls";
import { downloadSTL } from "@/lib/stl-generator";
import { downloadAdapterSTL } from "@/lib/adapter-generator";
import type { TubeConfig } from "@/lib/tube-types";
import type { AdapterConfig } from "@/lib/adapter-types";
import { DEFAULT_ROUND_CONFIG } from "@/lib/tube-types";
import { DEFAULT_ADAPTER_CONFIG } from "@/lib/adapter-types";
import {
  Download,
  RotateCcw,
  Box,
  Coffee,
  Heart,
  ExternalLink,
  Github,
  Link2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getEffectiveBendRadius } from "@/lib/adapter-types";

type TabType = "tube" | "adapter";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("tube");
  const [tubeConfig, setTubeConfig] =
    useState<TubeConfig>(DEFAULT_ROUND_CONFIG);
  const [adapterConfig, setAdapterConfig] = useState<AdapterConfig>(
    DEFAULT_ADAPTER_CONFIG,
  );
  const [showThankYou, setShowThankYou] = useState(false);

  const handleDownload = () => {
    if (activeTab === "tube") {
      const shapeName = tubeConfig.shape;
      const filename = `tube-${shapeName}-${tubeConfig.length}mm.stl`;
      downloadSTL(tubeConfig, filename);
    } else {
      const bendRadius = getEffectiveBendRadius(adapterConfig);
      const filename = `adapter-${adapterConfig.endA.shape}-to-${adapterConfig.endB.shape}-${adapterConfig.bendAngle}deg.stl`;
      downloadAdapterSTL(adapterConfig, filename);
    }
    setShowThankYou(true);
  };

  const handleReset = () => {
    if (activeTab === "tube") {
      setTubeConfig(DEFAULT_ROUND_CONFIG);
    } else {
      setAdapterConfig(DEFAULT_ADAPTER_CONFIG);
    }
  };

  const getTubeBadges = () => {
    const badges: { label: string; color: string }[] = [];

    if (tubeConfig.flare.enabled && tubeConfig.topCut.type === "flat") {
      badges.push({
        label: `Press-Fit (${tubeConfig.flare.fitType})`,
        color: "bg-pink-500/10 text-pink-500",
      });
    }

    if (tubeConfig.topCut.type !== "flat") {
      badges.push({
        label: `Top: ${tubeConfig.topCut.type}`,
        color: "bg-purple-500/10 text-purple-500",
      });
    }

    if (tubeConfig.bottomCut.type !== "flat") {
      badges.push({
        label: `Bottom: ${tubeConfig.bottomCut.type}`,
        color: "bg-orange-500/10 text-orange-500",
      });
    }

    return badges;
  };

  const getAdapterBadges = () => {
    const badges: { label: string; color: string }[] = [];

    if (adapterConfig.endA.shape !== adapterConfig.endB.shape) {
      badges.push({
        label: `${adapterConfig.endA.shape} → ${adapterConfig.endB.shape}`,
        color: "bg-blue-500/10 text-blue-500",
      });
    }

    if (adapterConfig.bendAngle > 0) {
      badges.push({
        label: `${adapterConfig.bendAngle}° elbow`,
        color: "bg-purple-500/10 text-purple-500",
      });
    } else {
      badges.push({
        label: "Straight coupling",
        color: "bg-green-500/10 text-green-500",
      });
    }

    return badges;
  };

  const badges = activeTab === "tube" ? getTubeBadges() : getAdapterBadges();

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Sidebar Controls */}
      <aside className="w-full lg:w-80 xl:w-96 border-b lg:border-b-0 lg:border-r border-border bg-card flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Box className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">TubeCraft</h1>
            <p className="text-xs text-muted-foreground">
              3D Printable Tube Generator
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("tube")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "tube"
                ? "bg-muted text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Box className="h-4 w-4" />
            Tubes
          </button>
          <button
            onClick={() => setActiveTab("adapter")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "adapter"
                ? "bg-muted text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Link2 className="h-4 w-4" />
            Adapters
          </button>
        </div>

        {/* Controls */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "tube" ? (
            <TubeControls config={tubeConfig} onChange={setTubeConfig} />
          ) : (
            <AdapterControls
              config={adapterConfig}
              onChange={setAdapterConfig}
            />
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-border p-4 space-y-2">
          <Button onClick={handleDownload} className="w-full gap-2" size="lg">
            <Download className="h-4 w-4" />
            Download STL
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full gap-2 bg-transparent"
            size="sm"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to Default
          </Button>
        </div>
      </aside>

      {/* Preview Area */}
      <main className="flex-1 flex flex-col min-h-[50vh] lg:min-h-0">
        {/* Info Bar */}
        <div className="flex items-center justify-between border-b border-border bg-card/50 px-4 py-2">
          <div className="flex items-center gap-3 text-sm flex-wrap">
            {activeTab === "tube" ? (
              <>
                <span className="text-muted-foreground">
                  Shape:{" "}
                  <span className="text-foreground font-medium capitalize">
                    {tubeConfig.shape}
                  </span>
                </span>
                <span className="text-muted-foreground">
                  Length:{" "}
                  <span className="text-foreground font-medium">
                    {tubeConfig.length}mm
                  </span>
                </span>
              </>
            ) : (
              <>
                <span className="text-muted-foreground">
                  Type:{" "}
                  <span className="text-foreground font-medium capitalize">
                    {adapterConfig.endA.shape} to {adapterConfig.endB.shape}
                  </span>
                </span>
                <span className="text-muted-foreground">
                  Socket:{" "}
                  <span className="text-foreground font-medium">
                    {adapterConfig.socketDepth}mm
                  </span>
                </span>
                {adapterConfig.bendAngle > 0 && (
                  <span className="text-muted-foreground">
                    Bend:{" "}
                    <span className="text-foreground font-medium">
                      {adapterConfig.bendAngle}°
                    </span>
                  </span>
                )}
              </>
            )}
            {badges.map((badge, i) => (
              <span
                key={i}
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badge.color}`}
              >
                {badge.label}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Drag to rotate, scroll to zoom
          </p>
        </div>

        {/* 3D Preview */}
        <div className="flex-1 relative">
          {activeTab === "tube" ? (
            <TubePreview config={tubeConfig} />
          ) : (
            <AdapterPreview config={adapterConfig} />
          )}
        </div>

        <footer className="border-t border-border bg-card/30 backdrop-blur-sm px-4 py-3">
          <div className="flex items-center justify-between text-sm flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <p className="text-muted-foreground">
                Made with{" "}
                <Heart className="inline h-3.5 w-3.5 text-red-500 fill-red-500" />{" "}
                by Sascha
              </p>
              <a
                href="https://github.com/saschb2b/tubecraft"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-4 w-4" />
                <span className="hidden sm:inline">Open Source</span>
              </a>
            </div>
            <a
              href="https://buymeacoffee.com/qohreuukw"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Coffee className="h-4 w-4" />
              <span className="hidden sm:inline">Buy me a coffee</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </footer>
      </main>

      <Dialog open={showThankYou} onOpenChange={setShowThankYou}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Download className="h-5 w-5 text-primary" />
              Download Started!
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-4 pt-4">
                <div className="text-base text-foreground">
                  Your STL file is ready for 3D printing. Thank you for using
                  TubeCraft!
                </div>
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="text-sm text-muted-foreground">
                    If you find TubeCraft useful, consider supporting the
                    project:
                  </div>
                  <div className="flex gap-2">
                    <a
                      href="https://github.com/saschb2b/tubecraft"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-muted hover:bg-muted/80 text-foreground font-medium px-4 py-2.5 transition-colors"
                    >
                      <Github className="h-5 w-5" />
                      Star on GitHub
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <a
                      href="https://buymeacoffee.com/qohreuukw"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-black font-medium px-4 py-2.5 transition-colors"
                    >
                      <Coffee className="h-5 w-5" />
                      Buy me a coffee
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  Your support helps keep TubeCraft free and open source
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
