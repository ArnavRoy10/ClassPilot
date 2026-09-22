export function getDaysRemaining(subscription: {
  status: string
  current_period_end: string | null
  trial_end: string | null
  cancel_at_period_end: boolean
} | null): { days: number; label: string; isTrial: boolean } {
  if (!subscription) {
    return { days: 0, label: 'No active subscription', isTrial: false }
  }

  const now = new Date()

  if (subscription.status === 'trialing' && subscription.trial_end) {
    const trialEnd = new Date(subscription.trial_end)
    const diffDays = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    return {
      days: Math.max(0, diffDays),
      label: diffDays > 0 ? `${diffDays} day${diffDays !== 1 ? 's' : ''} left in free trial` : 'Trial expired',
      isTrial: true,
    }
  }

  if (subscription.current_period_end) {
    const periodEnd = new Date(subscription.current_period_end)
    const diffDays = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const label = subscription.cancel_at_period_end
      ? `Cancels in ${diffDays} day${diffDays !== 1 ? 's' : ''}`
      : `${diffDays} day${diffDays !== 1 ? 's' : ''} until next billing`

    return { days: Math.max(0, diffDays), label, isTrial: false }
  }

  return { days: 0, label: 'No active subscription', isTrial: false }
}
