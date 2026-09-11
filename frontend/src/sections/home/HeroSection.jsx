function HeroSection() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-7xl items-center px-6 py-20">
      <div className="max-w-3xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
          Trusted Repair Services
        </p>

        <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">
          Find the right hands.
          <span className="block text-slate-400">
            Fix the problem.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
          Find experienced repairers, explore their previous work, and choose
          someone you can trust.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <button className="rounded-lg bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-200">
            Find a Repairer
          </button>

          <button className="rounded-lg border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10">
            Become a Repairer
          </button>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;

