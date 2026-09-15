export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

/** Tolak file gambar yang melebihi batas sebelum diproses. */
export function assertImageWithinLimit(file: File): void {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Ukuran gambar maksimal 2 MB. Pilih file yang lebih kecil.");
  }
}

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: "image/jpeg" | "image/webp";
  /** Target ukuran hasil kompresi (byte). Default 900 KB. */
  maxBytes?: number;
}

export interface CompressedImage {
  blob: Blob;
  width: number;
  height: number;
  ext: string;
}

function toBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, mimeType, quality));
}

/**
 * Kompresi wajib di sisi client sebelum upload (lihat PRD §7 Storage & Biaya).
 * Hasilnya diupayakan di bawah `maxBytes` dengan menurunkan kualitas, lalu
 * memperkecil dimensi bila masih terlalu besar.
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {},
): Promise<CompressedImage> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.75,
    mimeType = "image/jpeg",
    maxBytes = 900 * 1024,
  } = options;

  assertImageWithinLimit(file);

  const bitmap = await loadImage(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    if ("close" in bitmap) bitmap.close();
    throw new Error("Canvas tidak didukung browser ini.");
  }

  const draw = (scale: number) => {
    const ratio = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height) * scale;
    const width = Math.max(1, Math.round(bitmap.width * ratio));
    const height = Math.max(1, Math.round(bitmap.height * ratio));
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
  };

  const compress = async (scale: number): Promise<Blob> => {
    draw(scale);
    let currentQuality = quality;
    let blob = await toBlob(canvas, mimeType, currentQuality);
    while (blob && blob.size > maxBytes && currentQuality > 0.45) {
      currentQuality = Math.max(0.45, currentQuality - 0.1);
      blob = await toBlob(canvas, mimeType, currentQuality);
    }
    if (!blob) throw new Error("Gagal mengompres gambar.");
    return blob;
  };

  let blob = await compress(1);
  if (blob.size > maxBytes) {
    blob = await compress(0.75);
  }

  if ("close" in bitmap) bitmap.close();

  return {
    blob,
    width: canvas.width,
    height: canvas.height,
    ext: mimeType === "image/webp" ? "webp" : "jpg",
  };
}

async function loadImage(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file);
    } catch {
      /* fallback ke <img> */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("File gambar tidak valid."));
      image.src = url;
    });
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}
