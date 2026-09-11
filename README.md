# Squish

**Convert, compress, and edit your files — entirely in your browser.**

Squish is a file-utility web app built with Next.js, TypeScript, and Tailwind CSS. It bundles 18 small, focused tools for working with PDFs and images — merging, compressing, converting, cropping, watermarking, and more — and every single one of them runs as JavaScript in the visitor's own browser tab.

There is no backend. No file is ever uploaded anywhere. Nothing is stored, logged, or sent to a server. When a tool says "processing," that's your own device's CPU doing the work — which is also why the app can be hosted for free on a static platform like Vercel with zero server costs, and why it keeps working exactly the same whether you're online or not (once the page has loaded).

---

## Table of contents

- [Why it's built this way](#why-its-built-this-way)
- [Tech stack](#tech-stack)
- [The 18 tools](#the-18-tools)
- [Design system](#design-system)
- [Project structure](#project-structure)
- [How a tool page actually works](#how-a-tool-page-actually-works)
- [Getting started](#getting-started)
- [Deploying](#deploying)
- [Adding a new tool](#adding-a-new-tool)
- [Known limitations](#known-limitations--things-left-out-on-purpose)
- [Roadmap ideas](#roadmap-ideas)

---

## Why it's built this way

Most "convert your PDF" sites on the internet work by uploading your file to a server, doing the conversion there, and sending it back. That means your file — which might be a passport photo, a contract, a scan of an ID — passes through a company's servers, gets logged, and sits in a temp folder somewhere until (hopefully) it's cleaned up.

Squish avoids that category of problem entirely by never having a server in the loop. Every tool is a client-side JavaScript library doing real, local computation:

- **PDFs** are parsed, rendered, and rebuilt using `pdf.js` and `pdf-lib`.
- **Images** are manipulated using the browser's native `<canvas>` API.
- **Word documents** are read and written using `mammoth` and `docx`.
- **New PDFs** are assembled using `jsPDF`.

The trade-off is real and worth stating plainly: a browser has less raw horsepower than a beefy server, and some categories of tool (OCR, background removal, video conversion) need a large ML model or heavy native binary to do well — those are either left out or clearly limited here, on purpose, so the app stays fast on modest hardware. See [Known limitations](#known-limitations--things-left-out-on-purpose) for the full reasoning.

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js** (App Router) | Each tool is its own route (`/compress-pdf`, `/merge-pdf`, etc.), which means clean URLs and automatic code-splitting — a visitor loading the "Compress Image" page never downloads the PDF-parsing library, and vice versa. |
| Language | **TypeScript** | Every tool's metadata (name, accepted file types, fonts, colors) is described by one shared `ToolMeta` type, so a typo or missing field is caught at build time instead of showing up as a blank card in production. |
| Styling | **Tailwind CSS v4** | Utility classes plus a small set of custom design tokens (see below) for the site's black/red editorial look. |
| Motion | **Framer Motion** | Card hover states, the press-in effect, and the full-screen loading animation. |
| Fonts | **`next/font/google`** | Self-hosted at build time (no runtime request to Google), with a different display face assigned to *every single tool card* — see [Design system](#design-system). |

### Libraries doing the actual file work

| Library | Used for |
|---|---|
| `pdf.js` (`pdfjs-dist`) | Reading PDFs: rendering pages to canvas, extracting text, counting pages. |
| `pdf-lib` | Writing/editing PDFs: merging, splitting, rotating, watermarking, reordering pages. |
| `jsPDF` | Building new PDFs from images or HTML (JPG→PDF, Text→PDF, Word→PDF, and rebuilding compressed PDFs). |
| `mammoth` | Converting `.docx` → HTML (used by Word→PDF). |
| `docx` | Building a `.docx` from extracted text (used by PDF→Word). |
| `html2canvas` | Rasterizing HTML for jsPDF's `.html()` renderer (Word→PDF). |
| `jszip` | Bundling multi-file outputs (e.g. PDF→JPG on a multi-page PDF, or Split PDF) into a single `.zip` download. |
| `file-saver` | Triggering the actual browser download once a result is ready. |
| `qrcode` | Generating QR codes on the QR Code tool — small, pure JS, no network call. |

None of these talk to a server. They're all standard JS/WASM libraries that ship to the browser and run there, the same way a chart library or a date picker would.

---

## The 18 tools

Organized the way the homepage filters them — **Convert**, **Compress**, and **Edit**.

### Convert

| Tool | What it does | The honest limit |
|---|---|---|
| **JPG to PDF** | Stacks one or more images into a single PDF, one image per page, in the order you drop them. | Very large or many high-res images take longer since your device (not a server) is doing the encoding. |
| **PDF to JPG** | Exports every page of a PDF as a full-resolution JPG. | Multi-page PDFs download as a `.zip`. Password-protected PDFs aren't supported. |
| **Convert Image** | Swaps between JPG, PNG, and WEBP. | A straight format swap — no resizing or quality changes beyond what the target format itself requires. |
| **PDF to Word** | Extracts PDF text in reading order into an editable `.docx`. | This is a **text** tool, not a **layout** tool. Tables, multi-column layouts, and images from the original PDF aren't reconstructed. Scanned/photographed PDFs have no real text to extract at all — that needs OCR, which isn't built in. Desktop apps like Word and WPS use much heavier layout-recognition engines and preserve formatting noticeably better than any browser-only tool can. |
| **Word to PDF** | Converts a `.docx` to PDF via HTML, using jsPDF's layout renderer. | Handles headings, paragraphs, lists, bold/italic, and simple images well. Complex tables or exact original page breaks may reflow slightly — it's re-laying out the content, not replaying Word's own layout engine. |
| **QR Code** | Turns typed text or a URL into a downloadable QR code PNG. | Generated fully offline. Encodes exactly what you type — it doesn't shorten links or track scans. |
| **Text to PDF** | Lays plain typed/pasted text onto clean A4 pages. | Plain text only — no rich formatting, images, or styling. |
| **PDF to Text** | Extracts readable text from a PDF into a `.txt` file. | Same no-OCR limitation as PDF to Word — scanned/image-only PDFs yield nothing. |

### Compress

| Tool | What it does | The honest limit |
|---|---|---|
| **Compress Image** | Re-encodes an image at a lower quality to shrink file size. | Works best on photos. Re-encoding flat graphics or text-heavy images can look worse than the original. PNGs are converted to WEBP to actually shrink, since PNG has no lossy quality knob. |
| **Compress PDF** | Re-renders each page as a compressed JPEG and rebuilds the PDF around it. Ships with three presets — **Extreme**, **Recommended**, **High quality** — because the "right" compression level is really about how much visual quality you're willing to trade. | This is a real fix for oversized scans and image-heavy PDFs (a 90MB scanned PDF can genuinely come down to a few MB on the Extreme preset). It does **not** help PDFs that are already mostly text — there's very little image weight to squeeze out of those. The output also loses any selectable/searchable text, since every page becomes an image. |

### Edit

| Tool | What it does | The honest limit |
|---|---|---|
| **Merge PDF** | Combines multiple PDFs into one, in whatever order you arrange them (reorder with ↑/↓ before merging). | PDFs only — won't pull in Word docs or images directly. |
| **Split PDF** | Turns every page of a PDF into its own single-page PDF, bundled as one `.zip`. | — |
| **Rotate** | Rotates a whole PDF or image by 90°/180°/270°. | Rotates the whole file uniformly — no per-page rotation (yet). |
| **Resize Image** | Sets an exact pixel width and height, with one-click **passport photo presets** (US/India 2×2in → 600×600px, UK/EU 35×45mm → 413×531px). | Stretches to the exact dimensions you set rather than auto-locking aspect ratio — check your numbers. Passport presets are common defaults, not a guarantee; some countries and photo booths have their own exact rules. |
| **Crop Image** | A genuinely freeform crop tool: drag any of the 4 edges to resize from that side, drag any corner to resize both dimensions, drag inside the box to move it. Includes 90°-step rotate before cropping. | No continuous free-angle rotation (e.g. straightening a tilted horizon by a few degrees) — only 90° steps. |
| **Organize PDF** | Reorder or delete pages from a PDF, shown as a lightweight numbered list (not page thumbnails, so it stays fast even on a 100-page PDF). | Reorders and removes pages only — doesn't rotate or edit page content. Works on non-password-protected PDFs. |
| **Watermark PDF** | Tiles a diagonal text watermark across every page. | Text only — no image/logo watermarks yet. |
| **Strip Metadata** | Removes EXIF data (GPS location, camera model, timestamp) from an image by re-encoding it through canvas. | Also drops any embedded color profile, which can very slightly shift color on color-managed images. |

---

## Design system

The whole visual identity takes its cue from film-title type-specimen sites: black background, one loud accent color, and huge condensed display type.

### Colors

```css
--ink:        #0D0D0D   /* page background */
--ink-raised: #161616   /* cards, inputs */
--ink-line:   #272727   /* hairline borders */
--paper:      #F2EFE9   /* primary text (warm off-white, not pure white) */
--paper-dim:  #8A8781   /* secondary text */
--squish:     #E72A00   /* the brand accent — buttons, links, the loader */
```

### Every tool card has its own identity

This is the signature design idea of the site: **no two tool cards look alike.** Each of the 18 tools in `lib/registry.ts` carries its own:

- `cardFont` — a distinct Google Font (Anton, Bebas Neue, Bungee, Playfair Display italic, Special Elite, Caveat, Permanent Marker, Audiowide, Luckiest Guy, Nosifer, and others — 18 different faces in total)
- `hoverBg` — the card's background color on hover (a curated palette: blues, teals, purples, an off-white, a navy, a lime, a gold, a pale pink, and more)
- `hoverText` — a contrasting text color for that background

When you hover a card on the homepage:
1. The background animates in to `hoverBg`.
2. The tool's name switches to its own `cardFont`.
3. The text **presses back** — scales down slightly and settles, like it's being pushed into the surface.
4. A small tag follows your cursor reading `Font: [name]` — the actual cursor stays visible, the tag just rides alongside it.
5. A category label and an "Input → Output" badge fade in.

Clicking through to a tool's own page carries the same color and font into that page's hero section — so "Merge PDF" opens on a paper-white hero in Playfair Display italic, "Watermark PDF" opens on white in a bold cartoon face, and so on. The persistent header logo deliberately stays a neutral off-white in its own dark pill, rather than trying to match every page's color — that was a specific fix for a real bug (a light hero color made the logo unreadable) rather than a stylistic choice.

### The loading sequence

A full-screen intro plays once per page load, styled like a scratched film countdown leader:

**LOADING** (red, on black) → a 3-2-1 countdown inside a crosshair circle graphic, with a conic-gradient wipe sweeping black-to-red clockwise like a clock hand, and the corner "M / 35" marks flickering briefly into view like a film artifact → a full red frame with **SQUISH** stamped in black → fade into the site.

It's built with `framer-motion`'s imperative `animate()` function driving a canvas-free conic-gradient directly via a ref (no external animation library needed for the wipe itself).

### Every tool page explains its own limits

Instead of a wall of disclaimers, `lib/registry.ts` gives each tool an optional `notes: string[]` array, and `ToolPageShell` renders it automatically as a small "Good to know" callout right above the tool. This is why, for example, the PDF to Word page is upfront that it only extracts text and can't handle scanned documents — the goal is that nobody is surprised by what a browser-only tool can and can't do.

---

## Project structure

```
squish/
├── app/                       # One folder per route (Next.js App Router)
│   ├── layout.tsx             # Root layout — loads fonts, mounts the intro loader
│   ├── page.tsx                # Homepage — hero + searchable/filterable tool grid
│   ├── jpg-to-pdf/page.tsx
│   ├── pdf-to-jpg/page.tsx
│   ├── compress-image/page.tsx
│   ├── compress-pdf/page.tsx
│   ├── convert-image/page.tsx
│   ├── merge-pdf/page.tsx
│   ├── split-pdf/page.tsx
│   ├── rotate/page.tsx
│   ├── resize-image/page.tsx
│   ├── crop-image/page.tsx
│   ├── pdf-to-word/page.tsx
│   ├── word-to-pdf/page.tsx
│   ├── organize-pdf/page.tsx
│   ├── watermark-pdf/page.tsx
│   ├── qr-code/page.tsx
│   ├── strip-image-metadata/page.tsx
│   ├── text-to-pdf/page.tsx
│   └── pdf-to-text/page.tsx
│
├── components/
│   ├── Header.tsx              # Fixed floating logo pill (top-left) + device badge (top-right)
│   ├── Loader.tsx              # The film-countdown intro animation
│   ├── HomeContent.tsx         # Homepage hero, search box, filter chips, tool grid
│   ├── ToolCard.tsx            # One homepage grid card — font/color/press/cursor-tag logic lives here
│   ├── ToolPageShell.tsx       # Shared chrome every tool page uses: tinted hero + meta panel
│   ├── ToolNotes.tsx           # Renders a tool's registry.notes as a "Good to know" callout
│   ├── MetaList.tsx            # The label:value panel (Input/Output/Processing/Upload)
│   ├── FileDropzone.tsx        # Drag-and-drop + click-to-browse file input
│   ├── QueueList.tsx           # Per-file progress/result list for batch tools
│   ├── CropBox.tsx             # Freeform draggable/resizable crop rectangle (Pointer Events)
│   ├── QualitySlider.tsx       # The quality slider used by compression tools
│   └── PrimaryButton.tsx       # The red pill action button
│
├── lib/
│   ├── types.ts                 # ToolMeta, QueueItem — the shared shapes for the whole app
│   ├── registry.ts               # ⭐ The single source of truth for all 18 tools
│   ├── fonts.ts                  # Every next/font/google import, one per card + the site's own Anton
│   ├── useQueue.ts               # Hook: manages a batch file queue's add/process/progress/result lifecycle
│   ├── utils.ts                   # formatBytes, downloadBlob, uid
│   └── engines/                   # The actual conversion logic — all pure functions, all client-side
│       ├── pdfjs.ts                # Shared pdf.js setup (worker, page rendering, page counting)
│       ├── pdfOps.ts                # compress/merge/split/rotate/organize/watermark a PDF
│       ├── imageOps.ts              # compress/convert/resize/rotate/crop an image, strip metadata
│       ├── docOps.ts                # PDF↔text extraction, PDF→Word, Word→PDF
│       ├── jpgToPdf.ts               # Images → one combined PDF
│       ├── pdfToJpg.ts                # PDF pages → JPGs (zipped if multi-page)
│       ├── textToPdf.ts                # Plain text → PDF
│       └── qrCode.ts                    # Text/URL → QR code PNG
│
└── app/globals.css               # Design tokens (colors, fonts) as CSS variables + Tailwind v4 theme
```

**The one file to understand first is `lib/registry.ts`.** Every tool — its name, tagline, accepted file types, whether it's single/batch/merge, its card font, its hover colors, and its limitation notes — is one object in that file. The homepage grid, every tool page's hero, and the "Good to know" callouts are all generated *from* that data rather than hand-written per page.

---

## How a tool page actually works

Most tools follow the same shape, so understanding one explains most of the app:

1. **`ToolPageShell`** wraps the page: it reads the tool's entry from the registry and renders the tinted hero (using that tool's own font and colors), the "Good to know" notes, and the Input/Output meta panel — the page itself only needs to supply its middle section.
2. **`FileDropzone`** collects one or more `File` objects from a drag-drop or a click-to-browse `<input type="file">`.
3. For tools that process files one-by-one (most of them), **`useToolQueue`** takes a `process(file, onProgress)` function and manages the rest: adding files to a queue, running them through `process` one at a time, tracking per-file progress and errors, and exposing the finished `Blob` for download via **`QueueList`**.
4. The actual `process` function is one of the pure functions in `lib/engines/` — e.g. `compressPdf(file, quality, onProgress)` — which does the real work with `pdf.js`/`pdf-lib`/canvas and returns `{ blob, name }`.
5. **`file-saver`**'s `saveAs()` triggers the browser's normal download when the person clicks "Download."

A few tools don't fit that exact shape and manage their own state instead — **Merge PDF** and **Organize PDF** need a page-list/reorder UI rather than a simple queue, **QR Code** and **Text to PDF** have no file input at all (just a text field), and **Crop Image** needs the custom `CropBox` component for its freeform crop rectangle. Those pages are still built from the same shared pieces (`ToolPageShell`, `FileDropzone`, `PrimaryButton`), just wired up by hand instead of through `useToolQueue`.

---

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. That's the whole setup — no environment variables, no API keys, no database.

```bash
npm run build   # production build
npm run start   # run the production build locally
```

---

## Deploying

Push the repo to GitHub and import it on [vercel.com](https://vercel.com) — no configuration needed. It's a static/client-rendered Next.js app with zero backend, so Vercel's free tier is genuinely enough; there's nothing here that needs a paid server tier, a database, or serverless functions.

The only thing that needs real internet access during the *build* (not for visitors — just for whoever runs `npm run build`) is fetching the Google Fonts via `next/font/google`. Vercel's build servers have that by default, so this is a non-issue when deploying normally.

---

## Adding a new tool

Because of how centralized `lib/registry.ts` is, adding a new tool to the homepage grid is mostly data entry:

1. **Write the conversion function** in `lib/engines/` (or add to an existing file if it's related). It should be a pure `async function(file, ...options) => { blob: Blob, name: string }`.
2. **Add an entry to `lib/registry.ts`**: slug, name, tagline, accepted file types, whether it's single-file/batch/merge, a `cardFont` + `cardFontLabel` (pick an unused Google Font), `hoverBg` + `hoverText`, and a `notes` array describing what it can/can't do.
3. **Import the new font** in `lib/fonts.ts` if it's not already there, and add its `.variable` to the `fontVariables` export.
4. **Create the route**: `app/your-tool-slug/page.tsx`. For a standard batch tool, this is usually ~30 lines — copy an existing simple tool like `compress-image/page.tsx` as a template, swap in your engine function.

The homepage card, the tinted hero on the tool's own page, the cursor tag, and the "Good to know" panel all appear automatically — none of that needs touching per-tool.

---

## Known limitations — things left out on purpose

These aren't oversights; they were deliberately scoped out to keep the app fast on low-end devices and to avoid quietly overselling what a browser-only tool can do:

- **No OCR.** Turning a scanned/photographed document into searchable text needs a real OCR engine (like Tesseract), which means shipping a multi-megabyte model to the browser and a slow first run. PDF to Word and PDF to Text are honest that they only work on PDFs that already contain real text.
- **No background removal.** Same issue — this needs a small ML model running client-side (e.g. via TensorFlow.js), which is a meaningfully heavier download than every other tool in the app.
- **No audio/video conversion.** Technically possible via `ffmpeg.wasm`, but it's a large download and CPU-intensive even on decent hardware — a poor fit for "runs smoothly on a low-end device."
- **No password protection / encryption for PDFs.** `pdf-lib` (the PDF library this app already uses) doesn't support PDF encryption, and pulling in a second, heavier library just for this one feature wasn't worth the trade-off.
- **No continuous free-angle rotation in Crop.** Only 90° steps. Combining an arbitrary rotation angle with a freely resizable crop box is a real coordinate-math problem — solvable, just not yet built.

---

## Roadmap ideas

Lightweight things that would fit the existing "no backend, runs fast" philosophy if you want to keep extending it:

- Add page numbers / headers / footers to a PDF (same `pdf-lib` toolkit as Watermark PDF)
- Image watermarking (logo overlay, not just text)
- SVG → PNG/JPG
- Favicon set generator (resize one image into the standard icon sizes, zip them)
- Base64 / data-URI encoder for images
- Batch rename by pattern
- Dominant color palette extractor from an image

---

*Built with Next.js, TypeScript, Tailwind CSS, and Framer Motion. No servers were involved in the making of this README, or anything else in this app.*
