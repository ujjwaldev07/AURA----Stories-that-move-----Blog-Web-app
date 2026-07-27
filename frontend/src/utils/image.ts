import imageCompression from 'browser-image-compression'
import { APP_CONFIG } from '@/config/api'

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: APP_CONFIG.imageMaxSizeMB,
    maxWidthOrHeight: APP_CONFIG.imageMaxDimension,
    useWebWorker: true,
    fileType: file.type.includes('png') ? 'image/png' : 'image/jpeg',
  }
  try {
    return await imageCompression(file, options)
  } catch {
    return file
  }
}

export function createObjectUrl(file: File): string {
  return URL.createObjectURL(file)
}

export function revokeObjectUrl(url?: string | null) {
  if (url?.startsWith('blob:')) URL.revokeObjectURL(url)
}

