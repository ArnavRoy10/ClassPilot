import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBillingContext } from '@/lib/billing'
import { BillingPanel } from '@/components/app/billing-panel'
import { ProfileSettings } from '@/components/app/profile-settings'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, CreditCard, Building2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Settings | ClassPilot',
  description: 'Manage your organization settings and billing',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const context = await getBillingContext()
  
  if (!context) {
    redirect('/onboarding')
  }

  const { organization, subscription, usage, profile } = context

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your organization settings, profile, and billing.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Organization</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Update your personal information and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileSettings user={user} profile={profile} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization Tab */}
        <TabsContent value="organization" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>
                Manage your organization details and limits.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Organization Name</label>
                  <p className="text-lg">{organization.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Current Plan</label>
                  <p className="text-lg capitalize">{organization.plan}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Max Students</label>
                  <p className="text-lg">{organization.max_students}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Max Teachers</label>
                  <p className="text-lg">{organization.max_teachers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab - THIS IS WHERE THE BILLING PANEL IS RENDERED */}
        <TabsContent value="billing" className="mt-6">
          <BillingPanel 
            organization={organization} 
            subscription={subscription} 
            usage={usage} 
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
