import type { Metadata } from "next";
import "./globals.css";

// Using system fonts instead of Google Fonts so production builds
// work offline and without Google Fonts network access.
// Geist is available as a system font on most modern setups.

export const metadata: Metadata = {
  title: "BWF Student Portal",
  description: "Bright Welfare Foundation — Student Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "'Geist', 'Inter', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
