import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(new Date(date));
}

export function timeUntil(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diff = target.getTime() - now.getTime();

  if (diff < 0) return "Started";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function getBatchYear(batch: number): string {
  return `Batch of ${batch}`;
}

export function getStarColor(stars: string): string {
  const map: Record<string, string> = {
    "1★": "text-gray-400",
    "2★": "text-green-400",
    "3★": "text-blue-400",
    "4★": "text-violet-400",
    "5★": "text-yellow-400",
    "6★": "text-orange-400",
    "7★": "text-red-400",
  };
  return map[stars] || "text-gray-400";
}

export function getCFRankColor(rank: string): string {
  const map: Record<string, string> = {
    newbie: "text-gray-400",
    pupil: "text-green-400",
    specialist: "text-cyan-400",
    expert: "text-blue-500",
    "candidate master": "text-violet-500",
    master: "text-orange-400",
    "international master": "text-orange-400",
    grandmaster: "text-red-500",
    "international grandmaster": "text-red-500",
    "legendary grandmaster": "text-red-600",
  };
  return map[rank?.toLowerCase()] || "text-gray-400";
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}
