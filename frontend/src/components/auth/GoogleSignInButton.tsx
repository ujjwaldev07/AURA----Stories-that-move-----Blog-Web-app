import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { env } from '@/config/env'
import { getErrorMessage } from '@/utils/errors'

interface GoogleCredentialResponse {
  credential?: string
}

interface GoogleSignInButtonProps {
  onCredential: (credential: string) => Promise<void>
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void
          renderButton: (element: HTMLElement, options: Record<string, string | number>) => void
        }
      }
    }
  }
}

const GOOGLE_SCRIPT_URL = 'https://accounts.google.com/gsi/client'

export function GoogleSignInButton({ onCredential }: GoogleSignInButtonProps) {
  const container = useRef<HTMLDivElement>(null)
  const onCredentialRef = useRef(onCredential)
  const inFlight = useRef(false)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const clientId = env.googleClientId
  const hasScriptLoaded = useRef(false)

  useEffect(() => {
    onCredentialRef.current = onCredential
  }, [onCredential])

  useEffect(() => {
    if (!clientId || !container.current) return

    const render = () => {
      if (!window.google || !container.current) return
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          if (!response.credential || inFlight.current) return
          inFlight.current = true
          setLoading(true)
          try {
            await onCredentialRef.current(response.credential)
          } catch (error) {
            toast.error(getErrorMessage(error, 'Google sign-in failed'))
          } finally {
            inFlight.current = false
            setLoading(false)
          }
        },
      })
      container.current.replaceChildren()
      window.google.accounts.id.renderButton(container.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        width: 320,
      })
    }

    // Check if script already loaded
    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${GOOGLE_SCRIPT_URL}"]`)
    if (existingScript) {
      existingScript.addEventListener('load', render)
      render()
      return () => existingScript.removeEventListener('load', render)
    }

    // Prevent duplicate script insertion
    if (!hasScriptLoaded.current) {
      const nextScript = document.createElement('script')
      nextScript.src = GOOGLE_SCRIPT_URL
      nextScript.async = true
      nextScript.onload = render
      nextScript.onerror = () => {
        setLoadError('Google sign-in could not be loaded. Please refresh and try again.')
        toast.error('Google sign-in could not be loaded.')
      }
      document.head.appendChild(nextScript)
      hasScriptLoaded.current = true
    }

    return () => {
      // Cleanup: remove event listener if script was added by us
      const nextScript = document.querySelector<HTMLScriptElement>(`script[src="${GOOGLE_SCRIPT_URL}"]`)
      if (nextScript) {
        nextScript.onload = null
        document.head.removeChild(nextScript)
      }
    }
  }, [clientId])

  if (!clientId) return null
  return (
    <div className="mt-5 border-t border-border pt-5">
      <p className="mb-3 text-center text-xs text-muted">or continue with</p>
      <div className={`google-signin-container ${loading ? 'pointer-events-none opacity-60' : ''}`} ref={container} />
      {loadError ? <p className="mt-2 text-center text-xs text-danger" role="alert">{loadError}</p> : null}
    </div>
  )
}