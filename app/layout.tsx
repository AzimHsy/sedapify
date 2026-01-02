import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar"; // Import the new Sidebar

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
        <div className="flex min-h-screen bg-gray-50">
          
          <Sidebar />
          <main className="flex-1 md:ml-64 pb-16 md:pb-0 w-full">
            {children}
          </main>
          
        </div>
      </body>
    </html>
  );
}