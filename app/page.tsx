"use client";

import { useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Chip from "@mui/material/Chip";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
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
  Cylinder,
  Coffee,
  Heart,
  Link2,
  X,
  Star,
  ExternalLink,
  Printer,
  Layers,
  Thermometer,
  Gauge,
} from "lucide-react";
import GitHubIcon from "@mui/icons-material/GitHub";

type TabType = "tube" | "adapter";

function getInitialTab(): TabType {
  if (typeof window === "undefined") return "tube";
  const params = new URLSearchParams(window.location.search);
  return params.get("tab") === "adapter" ? "adapter" : "tube";
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    const url = tab === "tube" ? "/" : "/?tab=adapter";
    window.history.replaceState(null, "", url);
  }, []);
  const [tubeConfig, setTubeConfig] =
    useState<TubeConfig>(DEFAULT_ROUND_CONFIG);
  const [adapterConfig, setAdapterConfig] = useState<AdapterConfig>(
    DEFAULT_ADAPTER_CONFIG,
  );
  const [showThankYou, setShowThankYou] = useState(false);

  const handleDownload = () => {
    if (activeTab === "tube") {
      const shapeName = tubeConfig.shape;
      const clamshellSuffix = tubeConfig.clamshell.enabled ? "-clamshell" : "";
      const filename = `tube-${shapeName}${clamshellSuffix}-${String(tubeConfig.length)}mm.stl`;
      downloadSTL(tubeConfig, filename);
    } else {
      const filename = `adapter-${adapterConfig.endA.shape}-to-${adapterConfig.endB.shape}-${String(adapterConfig.bendAngle)}deg.stl`;
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

    if (tubeConfig.clamshell.enabled) {
      badges.push({
        label: "Clamshell",
        color: "#06b6d4",
      });
    }

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

    if (adapterConfig.endAFit !== "socket" || adapterConfig.endBFit !== "socket") {
      const fitLabel = `A: ${adapterConfig.endAFit} / B: ${adapterConfig.endBFit}`;
      badges.push({
        label: fitLabel,
        color: "#ec4899",
      });
    }

    if (adapterConfig.bendAngle > 0) {
      badges.push({
        label: `${String(adapterConfig.bendAngle)}° elbow`,
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
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        flexDirection: { xs: "column", lg: "row" },
      }}
    >
      {/* Sidebar Controls */}
      <Box
        component="aside"
        sx={{
          width: { xs: "100%", lg: 320, xl: 384 },
          height: { lg: "100vh" },
          position: { lg: "sticky" },
          top: 0,
          borderBottom: { xs: 1, lg: 0 },
          borderRight: { lg: 1 },
          borderColor: "divider",
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 2,
            py: 1.5,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              display: "flex",
              height: 32,
              width: 32,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 1.5,
              bgcolor: "primary.main",
            }}
          >
            <Cylinder size={18} color="#ffffff" />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
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
          onChange={(_, v: TabType) => handleTabChange(v)}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTabs-indicator": { height: 3 },
          }}
        >
          <Tab
            icon={<Cylinder size={16} />}
            iconPosition="start"
            label="Tubes"
            value="tube"
          />
          <Tab
            icon={<Link2 size={16} />}
            iconPosition="start"
            label="Adapters"
            value="adapter"
          />
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
              color="primary"
            >
              Download STL
            </Button>
            <Button
              onClick={handleReset}
              variant="text"
              size="small"
              fullWidth
              startIcon={<RotateCcw size={14} />}
              sx={{ color: "#d9d9d9" }}
            >
              Reset to Default
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Preview Area */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: { xs: "50vh", lg: 0 },
        }}
      >
        {/* Info Bar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "rgba(53, 53, 53, 0.5)",
            px: 2,
            py: 1,
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
          >
            {activeTab === "tube" ? (
              <>
                <Typography variant="body2" color="text.secondary">
                  Shape:{" "}
                  <Typography
                    component="span"
                    variant="body2"
                    fontWeight={500}
                    color="text.primary"
                    sx={{ textTransform: "capitalize" }}
                  >
                    {tubeConfig.shape}
                  </Typography>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Length:{" "}
                  <Typography
                    component="span"
                    variant="body2"
                    fontWeight={500}
                    color="text.primary"
                  >
                    {tubeConfig.length}mm
                  </Typography>
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary">
                  Type:{" "}
                  <Typography
                    component="span"
                    variant="body2"
                    fontWeight={500}
                    color="text.primary"
                    sx={{ textTransform: "capitalize" }}
                  >
                    {adapterConfig.endA.shape} to {adapterConfig.endB.shape}
                  </Typography>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Socket:{" "}
                  <Typography
                    component="span"
                    variant="body2"
                    fontWeight={500}
                    color="text.primary"
                  >
                    {adapterConfig.socketDepth}mm
                  </Typography>
                </Typography>
                {adapterConfig.bendAngle > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Bend:{" "}
                    <Typography
                      component="span"
                      variant="body2"
                      fontWeight={500}
                      color="text.primary"
                    >
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
            bgcolor: "rgba(53, 53, 53, 0.3)",
            backdropFilter: "blur(12px)",
            px: 2,
            py: 0.75,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography variant="caption" color="text.secondary">
                Made with{" "}
                <Heart
                  size={12}
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
                  color: "text.secondary",
                  "&:hover": { color: "text.primary" },
                  transition: "color 0.2s",
                }}
              >
                <GitHubIcon sx={{ fontSize: 16 }} />
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
                gap: 0.5,
                color: "text.secondary",
                textDecoration: "none",
                "&:hover": { color: "text.primary" },
                transition: "color 0.2s",
              }}
            >
              <Coffee size={14} />
              <Typography
                variant="caption"
                sx={{ display: { xs: "none", sm: "inline" } }}
              >
                Support
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>

      <Drawer
        anchor="right"
        open={showThankYou}
        onClose={() => setShowThankYou(false)}
      >
        <Box sx={{ width: 320, p: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography variant="h6">Download Started!</Typography>
            <IconButton
              size="small"
              onClick={() => setShowThankYou(false)}
            >
              <X size={18} />
            </IconButton>
          </Box>

          <Stack spacing={2.5}>
            <Typography variant="body2" color="text.secondary">
              Your STL file is ready for 3D printing.
            </Typography>

            <Divider />

            <Box>
              <Typography variant="overline" color="text.secondary">
                Print Tips
              </Typography>
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Layers size={16} color="#5a9a9d" style={{ marginTop: 2, flexShrink: 0 }} />
                  <Typography variant="caption" color="text.secondary">
                    <strong>Layer height:</strong> 0.2mm for a good balance of speed and quality. Use 0.12mm for press-fit parts.
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Gauge size={16} color="#5a9a9d" style={{ marginTop: 2, flexShrink: 0 }} />
                  <Typography variant="caption" color="text.secondary">
                    <strong>Infill:</strong> 20-30% is usually enough. Use 50%+ for structural joints.
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Thermometer size={16} color="#5a9a9d" style={{ marginTop: 2, flexShrink: 0 }} />
                  <Typography variant="caption" color="text.secondary">
                    <strong>Material:</strong> PETG for durability and heat resistance. PLA works for prototyping.
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Printer size={16} color="#5a9a9d" style={{ marginTop: 2, flexShrink: 0 }} />
                  <Typography variant="caption" color="text.secondary">
                    <strong>Orientation:</strong> Print upright for best layer adhesion along the tube walls.
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="overline" color="text.secondary">
                Support the project
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, mb: 1.5, display: "block" }}>
                TubeCraft is free and open source. If it saved you time, consider giving back!
              </Typography>
              <Stack spacing={1.5}>
                <Button
                  component="a"
                  href="https://github.com/saschb2b/tubecraft"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  fullWidth
                  startIcon={<Star size={18} />}
                  endIcon={<ExternalLink size={14} />}
                >
                  Star on GitHub
                </Button>
                <Button
                  component="a"
                  href="https://buymeacoffee.com/qohreuukw"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="contained"
                  fullWidth
                  startIcon={<Coffee size={18} />}
                  endIcon={<ExternalLink size={14} />}
                >
                  Buy me a coffee
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
}
