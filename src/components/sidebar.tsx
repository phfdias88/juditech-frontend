"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getHealth } from "@/lib/api";
import {
  LayoutDashboard,
  Upload,
  Calculator,
  Scale,
  Cpu,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/processos", label: "Processos", icon: Scale },
  { href: "/upload", label: "Upload & IA", icon: Upload },
  { href: "/financeiro", label: "Calculadora", icon: Calculator },
];

export function Sidebar() {
  const pathname = usePathname();
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [apiVersion, setApiVersion] = useState("");

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await getHealth();
        setApiOnline(res.data.status === "ok");
        setApiVersion(res.data.version);
      } catch {
        setApiOnline(false);
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-950">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
          <Cpu className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-100">Juditech</h1>
          <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
            Legal Intelligence
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer — Dynamic Status */}
      <div className="border-t border-slate-800 px-6 py-4">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              apiOnline === null
                ? "bg-slate-500 animate-pulse"
                : apiOnline
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-red-500"
            )}
          />
          <span className="text-xs text-slate-500">
            {apiOnline === null
              ? "Verificando..."
              : apiOnline
                ? `API Online${apiVersion ? ` v${apiVersion}` : ""}`
                : "API Offline"}
          </span>
        </div>
      </div>
    </aside>
  );
}
