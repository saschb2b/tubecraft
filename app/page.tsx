"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { TubePreview } from "@/components/tube-preview"
import { TubeControls } from "@/components/tube-controls"
import { downloadSTL } from "@/lib/stl-generator"
import type { TubeConfig } from "@/lib/tube-types"
import { DEFAULT_ROUND_CONFIG } from "@/lib/tube-types"
import { Download, RotateCcw, Box } from "lucide-react"

export default function Home() {
  const [config, setConfig] = useState<TubeConfig>(DEFAULT_ROUND_CONFIG)

  const handleDownload = () => {
    const shapeName = config.shape
    const filename = `tube-${shapeName}-${config.length}mm.stl`
    downloadSTL(config, filename)
  }

  const handleReset = () => {
    setConfig(DEFAULT_ROUND_CONFIG)
  }

  const getBadges = () => {
    const badges: { label: string; color: string }[] = []

    if (config.flare.enabled && config.topCut.type === "flat") {
      badges.push({ label: `Press-Fit (${config.flare.fitType})`, color: "bg-pink-500/10 text-pink-500" })
    }

    if (config.topCut.type !== "flat") {
      badges.push({ label: `Top: ${config.topCut.type}`, color: "bg-purple-500/10 text-purple-500" })
    }

    if (config.bottomCut.type !== "flat") {
      badges.push({ label: `Bottom: ${config.bottomCut.type}`, color: "bg-orange-500/10 text-orange-500" })
    }

    return badges
  }

  const badges = getBadges()

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
            <p className="text-xs text-muted-foreground">3D Printable Tube Generator</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 overflow-y-auto p-4">
          <TubeControls config={config} onChange={setConfig} />
        </div>

        {/* Actions */}
        <div className="border-t border-border p-4 space-y-2">
          <Button onClick={handleDownload} className="w-full gap-2" size="lg">
            <Download className="h-4 w-4" />
            Download STL
          </Button>
          <Button onClick={handleReset} variant="outline" className="w-full gap-2 bg-transparent" size="sm">
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
            <span className="text-muted-foreground">
              Shape: <span className="text-foreground font-medium capitalize">{config.shape}</span>
            </span>
            <span className="text-muted-foreground">
              Length: <span className="text-foreground font-medium">{config.length}mm</span>
            </span>
            {badges.map((badge, i) => (
              <span
                key={i}
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badge.color}`}
              >
                {badge.label}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground hidden sm:block">Drag to rotate, scroll to zoom</p>
        </div>

        {/* 3D Preview */}
        <div className="flex-1 relative">
          <TubePreview config={config} />
        </div>
      </main>
    </div>
  )
}
