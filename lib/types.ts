// Shared TypeScript types for the whole app.
// Since this is your first TypeScript project: a `type` is just a shape
// we promise our data will have. TypeScript checks that promise at build
// time, so a typo or a wrong field shows up as a red squiggle instead of
// a runtime crash.

export type ToolCategory = "convert" | "compress" | "edit";

export interface ToolMeta {
  slug: string; // used in the URL, e.g. /jpg-to-pdf
  name: string; // short display name, e.g. "JPG to PDF"
  verb: string; // action word shown on the button, e.g. "Convert"
  tagline: string; // one line shown on the card + tool page
  category: ToolCategory;
  accepts: string; // HTML `accept` attribute for the file input
  inputLabel: string; // e.g. "JPG, PNG, WEBP"
  outputLabel: string; // e.g. "PDF"
  multiFile: boolean; // can the user drop more than one file?
  mergesFiles: boolean; // does the tool combine files into ONE output (merge-pdf)?
  hasQuality: boolean; // show the quality slider?
  cardFont: string; // CSS var, e.g. "var(--font-bebas)" — this card's own typeface
  cardFontLabel: string; // human name shown in the cursor tag, e.g. "Bebas Neue"
  hoverBg: string; // hex — card background on hover
  hoverText: string; // hex — card text color on hover
  notes?: string[]; // plain-language "what this can/can't handle" bullets shown on the tool page
}

// Every file the user drops goes through this lifecycle.
export type QueueStatus = "queued" | "processing" | "done" | "error";

export interface QueueItem {
  id: string;
  file: File;
  status: QueueStatus;
  progress: number; // 0-100
  resultBlob?: Blob;
  resultName?: string;
  resultSize?: number;
  errorMessage?: string;
}
