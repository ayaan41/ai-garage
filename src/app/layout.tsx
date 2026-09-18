import "./globals.css";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#050507] text-white">
        <div className="aura-yellow"></div>
        <div className="fixed inset-0 pointer-events-none opacity-[0.04] text-">⚙️ 🛞 🔧</div>
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}