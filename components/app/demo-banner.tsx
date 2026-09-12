import { Info } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

/**
 * Gives new workspaces a clear product-state reminder without implying that
 * account, billing, or organization data is shared across tenants.
 */
export function DemoBanner() {
  return (
    <Alert>
      <Info />
      <AlertTitle>Your workspace is ready to configure</AlertTitle>
      <AlertDescription>
        Start by adding your teachers, batches and students. Dashboard summaries will become more useful as your center grows.
      </AlertDescription>
    </Alert>
  )
}
