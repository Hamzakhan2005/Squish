import { saveAs } from "file-saver";

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / Math.pow(1024, i);
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[i]}`;
}

export function downloadBlob(blob: Blob, name: string) {
  saveAs(blob, name);
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}
