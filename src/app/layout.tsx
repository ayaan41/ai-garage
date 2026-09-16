import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "AI Garage - UK 10k Standard",
  description: "Haji Autos - Car Service History",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col bg-gray-50">{children}</body>
    </html>
  );
}
