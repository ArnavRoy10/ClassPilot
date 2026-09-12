import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    q: 'Is my center’s data kept separate from other centers?',
    a: 'Yes. ClassPilot is multi-tenant by design — each coaching center gets its own isolated workspace, and staff can only ever see data that belongs to their center.',
  },
  {
    q: 'Can I add multiple teachers and staff?',
    a: 'Absolutely. You can invite teachers and office staff to your center, and role-based access keeps everyone focused on what they need.',
  },
  {
    q: 'Do you support fee collection and invoicing?',
    a: 'You can generate invoices, record full or partial payments, and instantly see outstanding dues across every batch.',
  },
  {
    q: 'What happens after the free trial?',
    a: 'Your data stays safe. Pick a plan that fits your center to keep going — nothing is deleted, and you can upgrade or downgrade anytime.',
  },
  {
    q: 'Can parents and students see their information?',
    a: 'Student and parent portals are on our roadmap. Today, your staff manages everything from the admin dashboard.',
  },
]

export function Faq() {
  return (
    <section id="faq" className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">FAQ</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl">
            Questions, answered
          </h2>
        </div>

        <Accordion className="mt-10 w-full">
          {faqs.map((faq) => (
            <AccordionItem key={faq.q} value={faq.q}>
              <AccordionTrigger className="text-left font-medium">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
