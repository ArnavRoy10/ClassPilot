const steps = [
  {
    step: '01',
    title: 'Create your center',
    description:
      'Sign up and set up your coaching center profile. Each center is fully isolated — your data is yours alone.',
  },
  {
    step: '02',
    title: 'Add batches & people',
    description:
      'Bring in your batches, enroll students, and add teachers with their subjects. Import or add them one by one.',
  },
  {
    step: '03',
    title: 'Run the day-to-day',
    description:
      'Mark attendance, collect fees, schedule tests, and publish results — all from one dashboard your team shares.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">
            How it works
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl">
            Up and running in an afternoon
          </h2>
        </div>

        <ol className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <li key={step.step} className="relative flex flex-col gap-3">
              <span className="font-display text-5xl font-bold text-primary/25">
                {step.step}
              </span>
              <h3 className="font-display text-xl font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="leading-relaxed text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
