import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MySATScore — Digital SAT practice",
    template: "%s · MySATScore",
  },
  description:
    "Full-length adaptive Digital SAT practice tests with realistic timing, scaled scoring, and question-level analytics.",
  applicationName: "MySATScore",
  appleWebApp: { capable: true, title: "MySATScore", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f6f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1115" },
  ],
};

/**
 * Applies the stored theme before first paint so a dark-mode user never sees a
 * white flash. Kept inline and tiny for that reason.
 */
const THEME_SCRIPT = `
try {
  var stored = localStorage.getItem("mss-theme");
  var theme = stored || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
