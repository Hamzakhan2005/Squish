# Squish

Convert, compress, and edit JPGs and PDFs — entirely in your browser.
Nothing is ever uploaded to a server.

## Tools included

- JPG to PDF
- PDF to JPG
- Compress Image
- Compress PDF
- Convert Image (JPG/PNG/WEBP)
- Merge PDF
- Split PDF
- Rotate (PDF or image)
- Resize Image
- Crop Image

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploy

Push this to a GitHub repo and import it on vercel.com — no configuration
needed, no environment variables, no backend. It's a static/client-side
Next.js app.

## A note on the type

`app/globals.css` defines a `--font-display` variable that currently falls
back to a plain condensed system font, since this sandbox couldn't fetch a
webfont. For a closer match to the reference look, swap in a heavy
condensed grotesk (Archivo Black, Anton, or similar) via `next/font/google`
in `app/layout.tsx` once you have it running with network access.
