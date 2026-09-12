'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, Check, Copy, Mail, MessageCircle, Play, Share2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const content = {
  reelIdeas: [
    ['Before / after', 'Show a messy spreadsheet, then the ClassPilot dashboard. Hook: “Still running your institute from five tabs?”'],
    ['Attendance rescue', 'Show how quickly a tutor can mark a batch and identify students slipping below target attendance.'],
    ['Fee follow-up', 'Turn a common fee reminder into a calm, professional message using the communication center.'],
    ['One-day walkthrough', 'Follow a real class day: attendance, test marks, announcements, and a quick dashboard check.'],
    ['Tutor setup', 'Show how an independent tutor can start with students, batches, and fees in one focused workspace.'],
  ],
  posts: [
    ['The spreadsheet problem', 'If attendance lives in a register, fees in a sheet, and parent updates in WhatsApp, your team is already doing three jobs.'],
    ['The visibility problem', 'You should know which batches are full, which students are falling behind, and which fees need attention without asking three people.'],
    ['The parent experience', 'Clear records and timely updates make parents feel informed before they need to ask.'],
    ['The tutor promise', 'Less admin after class. More time for lesson planning, feedback, and students.'],
    ['The practical start', 'Start with your students and batches. Add the rest as your center grows.'],
  ],
  statuses: [
    'Running a coaching center should not mean running five spreadsheets.',
    'Attendance, fees, tests, and results — one calm workspace.',
    'Tutors: get your admin out of the way and get back to teaching.',
    'A better way to stay on top of every batch.',
    'Try ClassPilot free for 14 days. No setup fee.',
  ],
}

function CopyRow({ title, text }: { title: string; text: string }) {
  const [copied, setCopied] = useState(false)

  async function copyText() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="flex items-start justify-between gap-4 border-t border-border/70 py-4 first:border-t-0">
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
      </div>
      <Button variant="ghost" size="icon" aria-label={`Copy ${title}`} title={copied ? 'Copied' : 'Copy text'} onClick={() => void copyText()}>
        {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
      </Button>
    </div>
  )
}

export default function MarketingKitPage() {
  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-16 sm:px-6 sm:pt-24">
        <div className="max-w-3xl">
          <Badge variant="secondary" className="gap-2 rounded-full px-3 py-1">
            <Share2 className="size-3.5" /> ClassPilot marketing kit
          </Badge>
          <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-balance sm:text-6xl">
            Useful words for finding your first customers.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground">
            Copy, adapt, and publish these ideas for tutors and coaching centers. Keep the message practical: fewer admin gaps, clearer visibility, and more time for teaching.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" render={<Link href="/signup" />}>
              Try ClassPilot free <ArrowRight data-icon="inline-end" />
            </Button>
            <Button size="lg" variant="outline" render={<a href="mailto:hello@classpilot.app?subject=ClassPilot%20demo" />}>
              Book a demo <Mail data-icon="inline-end" />
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-4 pb-20 sm:px-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display">The simple pitch</CardTitle>
            <CardDescription>Use this when someone asks what ClassPilot does.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 text-lg leading-relaxed text-foreground">
              ClassPilot helps tutors and coaching centers manage students, batches, attendance, fees, tests, results, and announcements from one reliable workspace.
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {['Less admin after class', 'Clearer batch visibility', 'A better parent experience'].map((item) => (
                <div key={item} className="flex gap-2 text-sm text-muted-foreground"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{item}</div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="font-display">The problem to name</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>Records are scattered across notebooks, spreadsheets, and message threads.</p>
            <p>Owners lack a quick view of attendance, fees, and results.</p>
            <p>Tutors lose time to follow-up work instead of teaching.</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="font-display">Five Reel concepts</CardTitle><CardDescription>Short, specific, and easy to record from the product.</CardDescription></CardHeader>
          <CardContent>{content.reelIdeas.map(([title, text]) => <CopyRow key={title} title={title} text={text} />)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="font-display">Video formula</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p className="flex gap-3"><Play className="size-4 shrink-0 text-primary" />Start with the admin problem in the first two seconds.</p>
            <p className="flex gap-3"><MessageCircle className="size-4 shrink-0 text-primary" />Show one workflow, not every feature.</p>
            <p className="flex gap-3"><ArrowRight className="size-4 shrink-0 text-primary" />End with “Try ClassPilot free.”</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-display">Five post starters</CardTitle></CardHeader>
          <CardContent>{content.posts.map(([title, text]) => <CopyRow key={title} title={title} text={text} />)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="font-display">Five WhatsApp Status lines</CardTitle></CardHeader>
          <CardContent>{content.statuses.map((text, index) => <CopyRow key={text} title={`Status ${index + 1}`} text={text} />)}</CardContent>
        </Card>
      </section>
    </main>
  )
}
