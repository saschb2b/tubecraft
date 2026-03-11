"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#3c6e71",
      contrastText: "#ffffff",
    },
    background: {
      default: "#353535",
      paper: "#3e3e3e",
    },
    text: {
      primary: "#ffffff",
      secondary: "#d9d9d9",
    },
    divider: "#555555",
  },
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          color: "#999999",
          "&.Mui-selected": {
            color: "#ffffff",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#555555",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#777777",
          },
        },
      },
    },
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
