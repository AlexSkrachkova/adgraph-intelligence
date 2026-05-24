"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Strategy Hub",
      href: "/analytics/war-room",
    },
    {
      label: "Galaxy Map",
      href: "/relationships",
    },
    {
      label: "Strategy Intelligence",
      href: "/strategy-intelligence",
    },
    {
      label: "Monitoring",
      href: "/monitoring",
    },
    {
      label: "Galaxy Search",
      href: "/entity-search",
    },
    {
      label: "CSV Import",
      href: "/csv-import",
    },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#020617]/80 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1800px] items-center justify-between px-8 py-4">
        <Link href="/" className="group flex items-center gap-4">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-fuchsia-300/30 bg-fuchsia-500/10 shadow-[0_0_35px_rgba(217,70,239,0.25)]">
            <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.25),transparent_30%)]" />

            <span className="relative text-2xl">🌌</span>
          </div>

          <div>
            <div className="text-2xl font-black tracking-tight text-white group-hover:text-fuchsia-200 transition">
              Brand Galaxy
            </div>

            <div className="text-xs uppercase tracking-[0.3em] text-fuchsia-200">
              AI Intelligence Platform
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3 flex-wrap justify-end">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-2xl border px-5 py-3 text-sm font-medium transition-all duration-300 ${
                  active
                    ? "border-fuchsia-300/40 bg-fuchsia-500/20 text-white shadow-[0_0_25px_rgba(217,70,239,0.18)]"
                    : "border-white/10 bg-white/[0.04] text-gray-300 hover:border-fuchsia-300/30 hover:bg-fuchsia-500/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}