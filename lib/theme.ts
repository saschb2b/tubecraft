"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#34d399",
      contrastText: "#1a1b2e",
    },
    background: {
      default: "#1a1b2e",
      paper: "#242538",
    },
    divider: "#3b3c58",
  },
  components: {
    MuiAccordion: {
      defaultProps: {
        disableGutters: true,
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: "transparent",
          "&:before": { display: "none" },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          padding: 0,
          minHeight: 40,
        },
        content: {
          margin: "8px 0",
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: "8px 0 0 0",
        },
      },
    },
  },
});

export default theme;
