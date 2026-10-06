import { Roboto, Roboto_Condensed } from "next/font/google";
import "./globals.css";

// Thermos' brand type is DIN Condensed Bold for display and DIN for text. Roboto Condensed /
// Roboto are the closest Google fonts that also cover cyrillic-ext (Mongolian Ө and Ү).
const display = Roboto_Condensed({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-display",
  display: "swap",
});

const sans = Roboto({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: {
    default: "Thermos — Дулаан хадгалагч термос",
    template: "%s · Thermos",
  },
  description: "Өндөр чанартай вакуум термос, аяга. Улаанбаатар хотод хүргэлттэй.",
};

export const viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }) {
  return (
    <html lang="mn" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
