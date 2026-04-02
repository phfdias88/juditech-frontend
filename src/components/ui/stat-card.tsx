"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm transition-all hover:border-slate-700 hover:bg-slate-900/80",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-slate-50">
            {value}
          </p>
          {subtitle && (
            <p
              className={cn(
                "text-sm",
                trend === "up" && "text-emerald-400",
                trend === "down" && "text-red-400",
                !trend && "text-slate-500"
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
        <div className="rounded-lg bg-slate-800/50 p-3 text-slate-400 group-hover:text-blue-400 transition-colors">
          {icon}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
