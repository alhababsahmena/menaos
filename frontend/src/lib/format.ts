import type { Currency } from "@/types";

const FORMATTERS: Record<Currency, Intl.NumberFormat> = {
  USD: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
  JOD: new Intl.NumberFormat("en-JO", { style: "currency", currency: "JOD", minimumFractionDigits: 2 }),
};

export function formatMoney(amount: number, currency: Currency) {
  return FORMATTERS[currency].format(amount);
}

export function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

export function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", ...opts }).format(new Date(iso));
}

export function formatRelative(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86_400) return `${Math.floor(diff / 3600)}h ago`;
  const days = Math.floor(diff / 86_400);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

export function daysBetween(a: string, b = new Date().toISOString()) {
  return Math.max(0, Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000));
}

export function fullName<T extends { first_name: string; last_name: string }>(u: T) {
  return `${u.first_name} ${u.last_name}`.trim();
}
