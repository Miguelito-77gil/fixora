function RepairProjectCard({ project }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 transition duration-300 hover:-translate-y-1 hover:border-white/20">

      {/* PROJECT IMAGE PLACEHOLDER */}
      <div className="flex h-52 items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
        <div className="text-center">

          <div className="text-4xl">
            🔧
          </div>

          <p className="mt-2 text-xs text-slate-600">
            Repair project photo
          </p>

        </div>
      </div>

      {/* PROJECT CONTENT */}
      <div className="p-5">

        <div className="flex items-start justify-between gap-4">

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              {project.category}
            </p>

            <h3 className="mt-2 text-lg font-bold text-white">
              {project.title}
            </h3>
          </div>

          <span className="shrink-0 text-xs text-slate-600">
            {project.date}
          </span>

        </div>

        <div className="mt-5 space-y-4">

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Problem
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-400">
              {project.problem}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Solution
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-400">
              {project.solution}
            </p>
          </div>

        </div>

      </div>

    </article>
  );
}

export default RepairProjectCard;