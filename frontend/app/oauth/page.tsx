'use client'
import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDerivStore } from '@/state/derivStore'

function parseHash(hash: string) {
  const h = hash.startsWith('#') ? hash.slice(1) : hash
  const params = new URLSearchParams(h)
  const out: Record<string, string> = {}
  params.forEach((v, k) => { out[k] = v })
  return out
}

function OAuthLandingContent() {
  const router = useRouter()
  const sp = useSearchParams()
  const { setToken, authorize } = useDerivStore()
  useEffect(() => {
    let token: string | undefined
    if (typeof window !== 'undefined' && window.location.hash) {
      const ph = parseHash(window.location.hash)
      token = ph['access_token'] || ph['token'] || ph['token1'] || ph['auth_token']
    }
    token = token || sp.get('access_token') || sp.get('token') || sp.get('token1') || undefined
    if (token) { setToken(token); setTimeout(()=>authorize(),100); setTimeout(()=>router.replace('/'), 300) } else { router.replace('/') }
  }, [authorize, router, setToken, sp])
  return (<main className="container py-10"><div className="card text-center"><h2 className="text-xl font-semibold">Completing sign-in…</h2><p className="mt-2 text-sm opacity-70">If not redirected, <a className="underline" href="/">click here</a>.</p></div></main>)
}

export default function OAuthLanding() {
  return (
    <Suspense fallback={<main className="container py-10"><div className="card text-center"><h2 className="text-xl font-semibold">Loading…</h2></div></main>}>
      <OAuthLandingContent />
    </Suspense>
  )
}
