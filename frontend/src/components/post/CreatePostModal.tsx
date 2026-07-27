import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImagePlus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { usePostStore } from '@/store/postStore'
import { useAuthStore } from '@/store/authStore'
import { postService } from '@/services/postService'
import { uploadService } from '@/services/uploadService'
import { compressImage, createObjectUrl, revokeObjectUrl } from '@/utils/image'
import { APP_CONFIG } from '@/config/api'
import { queryKeys } from '@/constants/queryKeys'
import { cn } from '@/lib/cn'

const schema = z.object({
  title: z.string().min(4, 'Title needs at least 4 characters').max(APP_CONFIG.titleMaxLength),
  content: z.string().min(20, 'Write at least 20 characters').max(APP_CONFIG.captionMaxLength),
  category: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function CreatePostModal() {
  const open = usePostStore((s) => s.isCreateOpen)
  const setOpen = usePostStore((s) => s.setCreateOpen)
  const prependOptimistic = usePostStore((s) => s.prependOptimistic)
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()

  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', content: '', category: 'General' },
  })

  const content = watch('content')

  const onDrop = useCallback(async (accepted: File[]) => {
    const raw = accepted[0]
    if (!raw) return
    const compressed = await compressImage(raw)
    revokeObjectUrl(preview)
    setFile(compressed)
    setPreview(createObjectUrl(compressed))
  }, [preview])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    multiple: false,
  })

  const close = () => {
    setOpen(false)
    setProgress(0)
    setUploading(false)
    revokeObjectUrl(preview)
    setPreview(null)
    setFile(null)
    reset()
  }

  const onSubmit = handleSubmit(async (values) => {
    if (!user) {
      toast.error('Sign in to publish')
      return
    }
    try {
      let coverImage = ''
      if (file) {
        setUploading(true)
        coverImage = await uploadService.uploadImage(file, setProgress)
      }
      const saved = await postService.createPost({
        title: values.title,
        content: values.content,
        category: values.category || 'General',
        coverImage,
      })
      prependOptimistic(saved)
      await qc.invalidateQueries({ queryKey: queryKeys.posts.all })
      toast.success('Published')
      close()
    } catch (err) {
      const message = (err as { message?: string })?.message || 'Failed to publish'
      toast.error(message)
    } finally {
      setUploading(false)
    }
  })

  return (
    <Modal open={open} onClose={close} title="Create story" size="lg">
      <form onSubmit={onSubmit} className="space-y-4">
        <div
          {...getRootProps()}
          className={cn(
            'relative flex min-h-44 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-border bg-surface-2/60 transition',
            isDragActive && 'border-accent bg-accent-soft',
          )}
        >
          <input {...getInputProps()} />
          {preview ? (
            <>
              <img src={preview} alt="Preview" className="absolute inset-0 h-full w-full object-cover" />
              <button
                type="button"
                className="absolute top-3 right-3 rounded-full bg-black/60 p-2 text-white"
                onClick={(e) => {
                  e.stopPropagation()
                  revokeObjectUrl(preview)
                  setPreview(null)
                  setFile(null)
                }}
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 px-4 text-center text-muted">
              <ImagePlus className="h-8 w-8 text-accent" />
              <p className="text-sm font-medium text-ink">Drag & drop a cover image</p>
              <p className="text-xs">or click to browse — auto-compressed</p>
            </div>
          )}
        </div>

        <Input label="Title" error={errors.title?.message} {...register('title')} />
        <Textarea
          label="Caption"
          error={errors.content?.message}
          maxCount={APP_CONFIG.captionMaxLength}
          {...register('content')}
          value={content ?? ''}
        />
        <Input label="Category" hint="Optional" {...register('category')} />

        {(uploading || progress > 0) && progress < 100 ? (
          <div className="space-y-2">
            <p className="text-xs text-muted">Uploading image… {progress}%</p>
            <Progress value={progress} label="Upload progress" />
          </div>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting || uploading}>
            Publish
          </Button>
        </div>
      </form>
    </Modal>
  )
}
