import type React from "react";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@/components/ThemeProvider";
import Script from "next/script";

const geistSans = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TubeCraft - 3D Printable Tube Generator",
  description:
    "Generate custom tubes and adapters for 3D printing. Supports round, square, and rectangular shapes with press-fit flare options.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://umami.saschb2b.com/script.js"
          data-website-id="51c8e9a6-abd3-475a-bca2-db808244f8c0"
        />
      </head>
      <body className={geistSans.className}>
        <AppRouterCacheProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
