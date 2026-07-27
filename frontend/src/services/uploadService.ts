import api from '@/lib/axios'
import { API_ENDPOINTS } from '@/config/api'
export const uploadService = {
  async uploadImage(file: File, onProgress?: (pct: number) => void) {
    const form = new FormData()
    form.append('file', file)

    const { data } = await api.post<{ file?: { path?: string } }>(API_ENDPOINTS.upload, form, {
      onUploadProgress: (evt) => {
        if (!onProgress || !evt.total) return
        onProgress(Math.round((evt.loaded * 100) / evt.total))
      },
    })

    if (!data.file?.path) throw new Error('The server did not return an image path.')
    return data.file.path
  },
}
