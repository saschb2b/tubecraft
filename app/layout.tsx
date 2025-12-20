import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TubeCraft - 3D Printable Tube Generator",
  description:
    "Generate custom tubes and adapters for 3D printing. Supports round, square, and rectangular shapes with press-fit flare options.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.className} min-h-screen bg-background antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
