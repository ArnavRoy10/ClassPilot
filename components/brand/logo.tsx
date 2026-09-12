import { cn } from '@/lib/utils'

/**
 * ClassPilot wordmark. The mark is a simple compass/pilot glyph built from
 * currentColor so it adapts to light and dark surfaces.
 */
export function Logo({
  className,
  showText = true,
}: {
  className?: string
  showText?: boolean
}) {
  return (
    <span className={cn('flex items-center gap-2', className)}>
      <span
        className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="size-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 3l7 4v5c0 4-3 6.5-7 9-4-2.5-7-5-7-9V7l7-4z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M9.5 12.5l2 2 3.5-4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {showText && (
        <span className="font-display text-lg font-bold tracking-tight text-foreground">
          ClassPilot
        </span>
      )}
    </span>
  )
}
