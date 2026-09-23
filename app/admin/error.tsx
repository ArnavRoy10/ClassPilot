'use client'

import { useEffect } from 'react'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[app route error]', error)
  }, [error])

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-3 py-16 text-center">
      <h1 className="text-xl font-semibold">This page failed to load</h1>
      <p className="text-sm text-muted-foreground">{error.message || 'Unknown server error.'}</p>
      {error.digest && (
        <p className="text-xs text-muted-foreground">Digest: {error.digest}</p>
      )}
      <button
        onClick={() => reset()}
        className="mx-auto mt-2 rounded-md border border-input px-4 py-2 text-sm hover:bg-accent"
      >
        Try again
      </button>
    </main>
  )
}
