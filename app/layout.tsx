import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Advertising Intelligence Galaxy",
  description: "AI advertising intelligence platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-white">
        <div className="border-b border-white/10 bg-black/70 backdrop-blur-xl">
          <div className="mx-auto flex h-16 items-center gap-3 px-6">
            <img
              src="/logo.png"
              alt="Brand Galaxy Logo"
              className="h-10 w-10 rounded-xl object-cover shadow-[0_0_20px_rgba(139,92,246,0.35)]"
            />

            <div>
              <div className="text-sm font-bold leading-tight text-white">
                Advertising Intelligence Galaxy
              </div>

              <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-300">
                Brand Galaxy
              </div>
            </div>
          </div>
        </div>

        {children}
      </body>
    </html>
  );
}
