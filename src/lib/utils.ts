import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function riskColor(risk: string): string {
  switch (risk) {
    case "BAIXO":
      return "text-emerald-400";
    case "MEDIO":
      return "text-amber-400";
    case "ALTO":
      return "text-red-400";
    default:
      return "text-slate-400";
  }
}

export function riskBg(risk: string): string {
  switch (risk) {
    case "BAIXO":
      return "bg-emerald-500/10 border-emerald-500/20";
    case "MEDIO":
      return "bg-amber-500/10 border-amber-500/20";
    case "ALTO":
      return "bg-red-500/10 border-red-500/20";
    default:
      return "bg-slate-500/10 border-slate-500/20";
  }
}
