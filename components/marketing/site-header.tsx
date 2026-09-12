'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Logo } from '@/components/brand/logo'

const links = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'FAQ', href: '/#faq' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="ClassPilot home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Button key={link.href} variant="ghost" size="sm" render={<Link href={link.href} />}>
              {link.label}
            </Button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" render={<Link href="/login" />}>
            Log in
          </Button>
          <Button size="sm" render={<Link href="/signup" />}>
            Start free
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon" className="md:hidden" aria-label="Open menu" />
            }
          >
            <Menu />
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle className="text-left">
                <Logo />
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1 px-4">
              {links.map((link) => (
                <Button
                  key={link.href}
                  variant="ghost"
                  className="justify-start"
                  render={<Link href={link.href} onClick={() => setOpen(false)} />}
                >
                  {link.label}
                </Button>
              ))}
            </div>
            <div className="mt-auto flex flex-col gap-2 p-4">
              <Button variant="outline" render={<Link href="/login" onClick={() => setOpen(false)} />}>
                Log in
              </Button>
              <Button render={<Link href="/signup" onClick={() => setOpen(false)} />}>
                Start free
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
