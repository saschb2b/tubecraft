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
  },
});

export default theme;
