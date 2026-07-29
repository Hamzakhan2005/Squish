"use client";

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function toCanvas(img: HTMLImageElement, w = img.width, h = img.height) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas;
}

function toBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      type,
      quality
    );
  });
}

/** Re-encode an image at a lower quality to shrink its file size. */
export async function compressImage(
  file: File,
  quality: number
): Promise<{ blob: Blob; name: string }> {
  const img = await loadImage(file);
  const canvas = toCanvas(img);
  URL.revokeObjectURL(img.src);
  // PNG has no lossy quality knob in the Canvas API, so we compress PNGs
  // by re-encoding as JPEG-quality WEBP instead, which keeps things small
  // while staying a widely supported format.
  const type =
    file.type === "image/png" ? "image/webp" : file.type || "image/jpeg";
  const blob = await toBlob(canvas, type, quality);
  const ext = type.split("/")[1];
  const name = file.name.replace(/\.[^.]+$/, `.${ext}`);
  return { blob, name };
}

/**
 * Strip EXIF metadata (GPS location, camera model, timestamps, etc.) by
 * re-drawing the image onto a canvas and re-encoding it — the canvas
 * pipeline never carries EXIF through, so this is a clean, honest wipe.
 * Side effect: any embedded color profile is dropped too, which can very
 * slightly shift color on color-managed images.
 */
export async function stripImageMetadata(
  file: File
): Promise<{ blob: Blob; name: string }> {
  const img = await loadImage(file);
  const canvas = toCanvas(img);
  URL.revokeObjectURL(img.src);
  const type = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await toBlob(
    canvas,
    type,
    type === "image/jpeg" ? 0.95 : undefined
  );
  return { blob, name: file.name };
}

export type ImageFormat = "image/jpeg" | "image/png" | "image/webp";

export async function convertImageFormat(
  file: File,
  target: ImageFormat
): Promise<{ blob: Blob; name: string }> {
  const img = await loadImage(file);
  const canvas = toCanvas(img);
  URL.revokeObjectURL(img.src);
  const blob = await toBlob(
    canvas,
    target,
    target === "image/png" ? undefined : 0.92
  );
  const ext = target.split("/")[1];
  const name = file.name.replace(/\.[^.]+$/, `.${ext}`);
  return { blob, name };
}

export async function resizeImage(
  file: File,
  width: number,
  height: number
): Promise<{ blob: Blob; name: string }> {
  const img = await loadImage(file);
  const canvas = toCanvas(img, width, height);
  URL.revokeObjectURL(img.src);
  const type = file.type || "image/jpeg";
  const blob = await toBlob(canvas, type, 0.92);
  return { blob, name: file.name };
}

export async function rotateImage(
  file: File,
  degrees: 90 | 180 | 270
): Promise<{ blob: Blob; name: string }> {
  const img = await loadImage(file);
  const swap = degrees === 90 || degrees === 270;
  const canvas = document.createElement("canvas");
  canvas.width = swap ? img.height : img.width;
  canvas.height = swap ? img.width : img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((degrees * Math.PI) / 180);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  URL.revokeObjectURL(img.src);
  const type = file.type || "image/jpeg";
  const blob = await toBlob(canvas, type, 0.92);
  return { blob, name: file.name };
}

/** Crop using normalized pixel coordinates from react-easy-crop. */
export async function cropImage(
  file: File,
  crop: { x: number; y: number; width: number; height: number }
): Promise<{ blob: Blob; name: string }> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    img,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );
  URL.revokeObjectURL(img.src);
  const type = file.type || "image/jpeg";
  const blob = await toBlob(canvas, type, 0.92);
  return { blob, name: file.name };
}
