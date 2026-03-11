"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
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
  Box as BoxIcon,
  Coffee,
  Heart,
  ExternalLink,
  Github,
  Link2,
} from "lucide-react";
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
        color: "#ec4899",
      });
    }

    if (tubeConfig.topCut.type !== "flat") {
      badges.push({
        label: `Top: ${tubeConfig.topCut.type}`,
        color: "#a855f7",
      });
    }

    if (tubeConfig.bottomCut.type !== "flat") {
      badges.push({
        label: `Bottom: ${tubeConfig.bottomCut.type}`,
        color: "#f97316",
      });
    }

    return badges;
  };

  const getAdapterBadges = () => {
    const badges: { label: string; color: string }[] = [];

    if (adapterConfig.endA.shape !== adapterConfig.endB.shape) {
      badges.push({
        label: `${adapterConfig.endA.shape} → ${adapterConfig.endB.shape}`,
        color: "#3b82f6",
      });
    }

    if (adapterConfig.bendAngle > 0) {
      badges.push({
        label: `${adapterConfig.bendAngle}° elbow`,
        color: "#a855f7",
      });
    } else {
      badges.push({
        label: "Straight coupling",
        color: "#22c55e",
      });
    }

    return badges;
  };

  const badges = activeTab === "tube" ? getTubeBadges() : getAdapterBadges();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", flexDirection: { xs: "column", lg: "row" } }}>
      {/* Sidebar Controls */}
      <Box
        component="aside"
        sx={{
          width: { xs: "100%", lg: 320, xl: 384 },
          borderBottom: { xs: 1, lg: 0 },
          borderRight: { lg: 1 },
          borderColor: "divider",
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Box
            sx={{
              display: "flex",
              height: 36,
              width: 36,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 2,
              bgcolor: "primary.main",
            }}
          >
            <BoxIcon size={20} color="#1a1b2e" />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              TubeCraft
            </Typography>
            <Typography variant="caption" color="text.secondary">
              3D Printable Tube Generator
            </Typography>
          </Box>
        </Box>

        {/* Tab Navigation */}
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab icon={<BoxIcon size={16} />} iconPosition="start" label="Tubes" value="tube" />
          <Tab icon={<Link2 size={16} />} iconPosition="start" label="Adapters" value="adapter" />
        </Tabs>

        {/* Controls */}
        <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
          {activeTab === "tube" ? (
            <TubeControls config={tubeConfig} onChange={setTubeConfig} />
          ) : (
            <AdapterControls
              config={adapterConfig}
              onChange={setAdapterConfig}
            />
          )}
        </Box>

        {/* Actions */}
        <Box sx={{ borderTop: 1, borderColor: "divider", p: 2 }}>
          <Stack spacing={1}>
            <Button
              onClick={handleDownload}
              variant="contained"
              size="large"
              fullWidth
              startIcon={<Download size={16} />}
            >
              Download STL
            </Button>
            <Button
              onClick={handleReset}
              variant="outlined"
              size="small"
              fullWidth
              startIcon={<RotateCcw size={14} />}
            >
              Reset to Default
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Preview Area */}
      <Box component="main" sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: { xs: "50vh", lg: 0 } }}>
        {/* Info Bar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "rgba(36, 37, 56, 0.5)",
            px: 2,
            py: 1,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
            {activeTab === "tube" ? (
              <>
                <Typography variant="body2" color="text.secondary">
                  Shape:{" "}
                  <Typography component="span" variant="body2" fontWeight={500} color="text.primary" sx={{ textTransform: "capitalize" }}>
                    {tubeConfig.shape}
                  </Typography>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Length:{" "}
                  <Typography component="span" variant="body2" fontWeight={500} color="text.primary">
                    {tubeConfig.length}mm
                  </Typography>
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary">
                  Type:{" "}
                  <Typography component="span" variant="body2" fontWeight={500} color="text.primary" sx={{ textTransform: "capitalize" }}>
                    {adapterConfig.endA.shape} to {adapterConfig.endB.shape}
                  </Typography>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Socket:{" "}
                  <Typography component="span" variant="body2" fontWeight={500} color="text.primary">
                    {adapterConfig.socketDepth}mm
                  </Typography>
                </Typography>
                {adapterConfig.bendAngle > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Bend:{" "}
                    <Typography component="span" variant="body2" fontWeight={500} color="text.primary">
                      {adapterConfig.bendAngle}&deg;
                    </Typography>
                  </Typography>
                )}
              </>
            )}
            {badges.map((badge, i) => (
              <Chip
                key={i}
                label={badge.label}
                size="small"
                sx={{
                  bgcolor: `${badge.color}1a`,
                  color: badge.color,
                  fontSize: "0.75rem",
                  height: 24,
                }}
              />
            ))}
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: { xs: "none", sm: "block" } }}
          >
            Drag to rotate, scroll to zoom
          </Typography>
        </Box>

        {/* 3D Preview */}
        <Box sx={{ flex: 1, position: "relative" }}>
          {activeTab === "tube" ? (
            <TubePreview config={tubeConfig} />
          ) : (
            <AdapterPreview config={adapterConfig} />
          )}
        </Box>

        <Box
          component="footer"
          sx={{
            borderTop: 1,
            borderColor: "divider",
            bgcolor: "rgba(36, 37, 56, 0.3)",
            backdropFilter: "blur(12px)",
            px: 2,
            py: 1.5,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap spacing={1}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Made with{" "}
                <Heart
                  size={14}
                  color="#ef4444"
                  fill="#ef4444"
                  style={{ verticalAlign: "middle" }}
                />{" "}
                by Sascha
              </Typography>
              <Box
                component="a"
                href="https://github.com/saschb2b/tubecraft"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.75,
                  color: "text.secondary",
                  textDecoration: "none",
                  "&:hover": { color: "text.primary" },
                  transition: "color 0.2s",
                }}
              >
                <Github size={16} />
                <Typography variant="body2" sx={{ display: { xs: "none", sm: "inline" } }}>
                  Open Source
                </Typography>
              </Box>
            </Stack>
            <Box
              component="a"
              href="https://buymeacoffee.com/qohreuukw"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                color: "text.secondary",
                textDecoration: "none",
                "&:hover": { color: "text.primary" },
                transition: "color 0.2s",
              }}
            >
              <Coffee size={16} />
              <Typography variant="body2" sx={{ display: { xs: "none", sm: "inline" } }}>
                Buy me a coffee
              </Typography>
              <ExternalLink size={12} />
            </Box>
          </Stack>
        </Box>
      </Box>

      <Dialog
        open={showThankYou}
        onClose={() => setShowThankYou(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Download size={20} color="#34d399" />
          Download Started!
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5}>
            <Typography>
              Your STL file is ready for 3D printing. Thank you for using
              TubeCraft!
            </Typography>
            <Box
              sx={{
                bgcolor: "rgba(45, 46, 70, 0.5)",
                borderRadius: 2,
                p: 2.5,
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                If you find TubeCraft useful, consider supporting the project:
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  component="a"
                  href="https://github.com/saschb2b/tubecraft"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  fullWidth
                  startIcon={<Github size={20} />}
                  endIcon={<ExternalLink size={16} />}
                >
                  Star on GitHub
                </Button>
                <Button
                  component="a"
                  href="https://buymeacoffee.com/qohreuukw"
                  target="_blank"
                  rel="noopener noreferrer"
                  fullWidth
                  startIcon={<Coffee size={20} />}
                  endIcon={<ExternalLink size={16} />}
                  sx={{
                    bgcolor: "#FFDD00",
                    color: "#000",
                    "&:hover": { bgcolor: "#e6c700" },
                  }}
                >
                  Buy me a coffee
                </Button>
              </Stack>
            </Box>
            <Typography variant="caption" color="text.secondary" textAlign="center">
              Your support helps keep TubeCraft free and open source
            </Typography>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
