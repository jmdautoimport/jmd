/**
 * Upload a single image file to the server
 * @param file - The image file to upload
 * @returns Promise resolving to the image URL
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const adminSecret = import.meta.env.VITE_ADMIN_API_SECRET;
  const headers: Record<string, string> = {};
  if (adminSecret) {
    headers["x-admin-secret"] = adminSecret;
  }

  const response = await fetch("/api/upload/image", {
    method: "POST",
    body: formData,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    let errorMessage = `Upload failed: ${response.status} ${response.statusText}`;

    if (contentType && contentType.includes("application/json")) {
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        console.error("Failed to parse error JSON:", e);
      }
    } else if (contentType && contentType.includes("text/html")) {
      try {
        const text = await response.text();
        console.error("Server returned HTML instead of JSON:", text.substring(0, 500));
        errorMessage = `Server Error: Received HTML instead of JSON. (Status: ${response.status})`;
      } catch (e) {
        console.error("Failed to read error text:", e);
      }
    } else {
      try {
        const text = await response.text();
        console.error("Server returned non-JSON response:", text.substring(0, 500));
        errorMessage = text || errorMessage;
      } catch (e) {
        console.error("Failed to read error body:", e);
      }
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.url;
}

/**
 * Validate if a file is an image
 * @param file - The file to validate
 * @returns boolean indicating if the file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

/**
 * Validate file size (max 5MB by default)
 * @param file - The file to validate
 * @param maxSizeMB - Maximum size in MB (default: 5)
 * @returns boolean indicating if the file is within size limit
 */
export function isValidFileSize(file: File, maxSizeMB: number = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Create a preview URL for an image file (for display before upload)
 * @param file - The image file
 * @returns Object URL that should be revoked after use
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke an object URL to free memory
 * @param url - The object URL to revoke
 */
export function revokeImagePreview(url: string): void {
  URL.revokeObjectURL(url);
}

