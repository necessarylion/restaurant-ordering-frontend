/**
 * File upload utilities
 * Handles image uploads with validation and progress tracking
 */

import axios from "axios";
import { getToken } from "./client";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

/**
 * Validate file before upload
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Only JPG, PNG, and WebP are allowed.",
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
    };
  }

  return { valid: true };
};

/**
 * Upload progress callback
 */
export type UploadProgressCallback = (progress: number) => void;

/**
 * Upload single image
 * @param file - Image file to upload
 * @param endpoint - API endpoint for upload
 * @param onProgress - Optional progress callback (0-100)
 * @returns Promise with image URL
 */
export const uploadImage = async (
  file: File,
  endpoint: string,
  onProgress?: UploadProgressCallback
): Promise<string> => {
  // Validate file
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Create FormData
  const formData = new FormData();
  formData.append("image", file);

  // Upload
  const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const token = getToken();

  const response = await axios.post(endpoint, formData, {
    baseURL,
    headers: {
      "Content-Type": "multipart/form-data",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });

  // Extract image URL from response
  return response.data.image || response.data.url;
};

/**
 * Upload multiple images
 * @param files - Array of image files
 * @param endpoint - API endpoint for upload
 * @param onProgress - Optional progress callback for overall progress
 * @returns Promise with array of image URLs
 */
export const uploadImages = async (
  files: File[],
  endpoint: string,
  onProgress?: UploadProgressCallback
): Promise<string[]> => {
  // Validate all files first
  for (const file of files) {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(`${file.name}: ${validation.error}`);
    }
  }

  const urls: string[] = [];
  let completed = 0;

  // Upload files sequentially (to avoid overwhelming server)
  for (const file of files) {
    const url = await uploadImage(file, endpoint, (fileProgress) => {
      // Calculate overall progress
      if (onProgress) {
        const overallProgress = Math.round(
          ((completed + fileProgress / 100) / files.length) * 100
        );
        onProgress(overallProgress);
      }
    });

    urls.push(url);
    completed++;

    // Update overall progress
    if (onProgress) {
      onProgress(Math.round((completed / files.length) * 100));
    }
  }

  return urls;
};

/**
 * Convert File to base64 for preview
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Create object URL for file preview
 */
export const createPreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Revoke object URL to free memory
 */
export const revokePreviewUrl = (url: string): void => {
  URL.revokeObjectURL(url);
};
