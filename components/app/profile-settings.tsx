'use client'

import { useState } from 'react'
import { AlertTriangle, Building2, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { UserContext } from '@/lib/supabase/user-context'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ProfileSettings({ userContext }: { userContext: UserContext }) {
  const [fullName, setFullName] = useState(userContext.fullName)
  const [organizationName, setOrganizationName] = useState(userContext.organization.name)
  const [organizationType, setOrganizationType] = useState(userContext.organization.type)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmation, setConfirmation] = useState('')

  async function saveSettings() {
    const nextName = fullName.trim()
    const nextOrganizationName = organizationName.trim()
    if (nextName.length < 2) {
      toast.error('Enter a name with at least two characters.')
      return
    }
    if (nextOrganizationName.length < 2) {
      toast.error('Enter an organization name with at least two characters.')
      return
    }

    setSaving(true)
    const client = createClient()
    const { error: profileError } = await client
      .from('profiles')
      .update({ full_name: nextName })
      .eq('id', userContext.userId)

    if (profileError) {
      setSaving(false)
      toast.error('Unable to save your profile. Please try again.')
      return
    }

    const { error: organizationError } = await client.rpc('update_organization', {
      organization_id_input: userContext.organization.id,
      organization_name: nextOrganizationName,
      organization_type: organizationType,
    })

    setSaving(false)
    if (organizationError) {
      toast.error('Unable to save organization settings. Please try again.')
      return
    }

    toast.success('Settings updated')
    window.location.reload()
  }

  async function deleteOrganization() {
    if (confirmation !== userContext.organization.name) {
      toast.error('Type the organization name exactly to confirm deletion.')
      return
    }

    const confirmed = window.confirm(
      `Delete ${userContext.organization.name}? This permanently removes the organization and all memberships.`,
    )
    if (!confirmed) return

    setDeleting(true)
    const { error } = await createClient().rpc('delete_organization', {
      organization_id_input: userContext.organization.id,
      organization_name_confirmation: confirmation,
    })

    if (error) {
      setDeleting(false)
      toast.error('Unable to delete the organization. Please try again.')
      return
    }

    await createClient().auth.signOut()
    window.location.assign('/login')
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account details are synced from Supabase.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="full-name">Full name</Label>
            <Input id="full-name" value={fullName} onChange={(event) => setFullName(event.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-email">Email</Label>
            <Input id="profile-email" value={userContext.email} readOnly />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-role">Role</Label>
            <Input id="profile-role" value={userContext.role} readOnly />
          </div>
          <div className="sm:col-span-2">
            <Button onClick={saveSettings} disabled={saving}>
              <Save data-icon="inline-start" />
              {saving ? 'Saving...' : 'Save profile'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building2 className="size-5" /> Organization</CardTitle>
          <CardDescription>Update the workspace details shown to your team.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="organization-name">Organization name</Label>
            <Input id="organization-name" value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} maxLength={160} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="organization-type">Organization type</Label>
            <select id="organization-type" value={organizationType} onChange={(event) => setOrganizationType(event.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="solo_tutor">Solo tutor</option>
              <option value="coaching_center">Coaching center</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="organization-plan">Subscription plan</Label>
            <Input id="organization-plan" value={userContext.organization.plan} readOnly />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2 text-sm text-muted-foreground">
            <span>{userContext.organization.maxTeachers >= 2147483647 ? 'Unlimited' : userContext.organization.maxTeachers} teacher seats</span>
            <span>{userContext.organization.maxStudents} student seats</span>
          </div>
          <div className="sm:col-span-2">
            <Button onClick={saveSettings} disabled={saving} variant="outline">
              <Save data-icon="inline-start" />
              {saving ? 'Saving...' : 'Save organization'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="size-5" /> Danger zone</CardTitle>
          <CardDescription>Permanently delete this organization, its memberships, and associated workspace access.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="delete-confirmation">Type {userContext.organization.name} to confirm</Label>
            <Input id="delete-confirmation" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder={userContext.organization.name} autoComplete="off" />
          </div>
          <Button variant="destructive" onClick={deleteOrganization} disabled={deleting || confirmation !== userContext.organization.name}>
            <Trash2 data-icon="inline-start" />
            {deleting ? 'Deleting...' : 'Delete organization'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
