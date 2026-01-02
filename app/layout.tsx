import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavigationWrapper from "@/components/NavigationWrapper"; // Import the wrapper

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sedapify",
  description: "AI-Powered Recipe Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* The wrapper handles showing/hiding Sidebar based on the page */}
        <NavigationWrapper>
          {children}
        </NavigationWrapper>
      </body>
    </html>
  );
}