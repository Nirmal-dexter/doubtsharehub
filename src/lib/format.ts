import type { Timestamp } from "firebase/firestore";

export function formatTime(ts: Timestamp | null | undefined): string {
  if (!ts || typeof ts.toDate !== "function") return "just now";
  const date = ts.toDate();
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}
