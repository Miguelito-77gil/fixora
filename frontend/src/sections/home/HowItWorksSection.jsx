function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Describe the problem",
      description: "Tell us what needs to be repaired.",
    },
    {
      number: "02",
      title: "Find a repairer",
      description: "Compare skilled repairers and their previous work.",
    },
    {
      number: "03",
      title: "Get it fixed",
      description: "Contact the repairer and request their service.",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-12">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
          How it works
        </p>

        <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
          Simple from problem to solution.
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((step) => (
          <div
            key={step.number}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
          >
            <span className="text-sm font-bold text-slate-500">
              {step.number}
            </span>

            <h3 className="mt-6 text-xl font-semibold text-white">
              {step.title}
            </h3>

            <p className="mt-3 leading-7 text-slate-400">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorksSection;
