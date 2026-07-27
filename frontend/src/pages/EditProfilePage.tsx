import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { useAuthStore } from '@/store/authStore'
import { userService } from '@/services/userService'
import { ROUTES } from '@/constants/routes'

const schema = z.object({
  username: z.string().min(2).max(32).optional(),
  bio: z.string().max(240).optional(),
  avatar: z.string().optional(),
  coverImage: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function EditProfilePage() {
  const { user, setSession } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        bio: user.bio || '',
        avatar: user.avatar || '',
        coverImage: user.coverImage || '',
      })
    }
  }, [user, reset])

  const onSubmit = handleSubmit(async (values) => {
    if (!user) return
    setLoading(true)
    try {
      const updated = await userService.update(user.id, {
        username: values.username,
        bio: values.bio,
        avatar: values.avatar,
        coverImage: values.coverImage,
      })
      setSession(
        {
          ...user,
          username: updated.username || values.username || user.username,
          bio: updated.bio ?? values.bio,
          avatar: updated.avatar || values.avatar || user.avatar,
          coverImage: updated.coverImage || values.coverImage || user.coverImage,
        },
      )
      toast.success('Profile updated')
      navigate(ROUTES.profile(user.id))
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  })

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-5 font-display text-3xl font-bold">Edit profile</h1>
      <GlassCard className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="Username" error={errors.username?.message} {...register('username')} />
          <Textarea label="Bio" error={errors.bio?.message} {...register('bio')} />
          <Input
            label="Avatar URL"
            hint="Optional — leave blank for generated avatar"
            {...register('avatar')}
          />
          <Input
            label="Cover image URL"
            hint="Optional cover photo URL"
            {...register('coverImage')}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Save changes
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  )
}
