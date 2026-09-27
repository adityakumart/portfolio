/**
 * Compresses an image in the browser using HTML Canvas before uploading to cloud storage.
 * Keeps aspect ratio, caps dimensions to max 1280px, and produces a lightweight Blob.
 */
export async function compressImage(
  file: File,
  maxDimension = 1280,
  quality = 0.8,
): Promise<{ blob: Blob; mimeType: string }> {
  return new Promise((resolve, reject) => {
    // If SVG or GIF, preserve original without re-compressing
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      resolve({ blob: file, mimeType: file.type });
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image element'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ blob: file, mimeType: file.type });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const targetMime = 'image/jpeg';
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, mimeType: targetMime });
            } else {
              resolve({ blob: file, mimeType: file.type });
            }
          },
          targetMime,
          quality,
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
