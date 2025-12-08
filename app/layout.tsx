import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sedapify",
  description: "Your food recipe platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
