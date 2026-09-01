function RepairRequestCard({ request }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div>

          <p className="text-xs font-bold uppercase tracking-wider text-blue-400">
            {request.category}
          </p>

          <h3 className="mt-2 text-lg font-bold text-white">
            {request.itemName}
          </h3>

          <p className="mt-1 text-sm text-slate-600">
            Repairer: {request.repairerName}
          </p>

        </div>

        <span className="w-fit rounded-full bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-300 ring-1 ring-amber-400/20">
          {request.status}
        </span>

      </div>

      <div className="mt-5 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-2">

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Location
          </p>

          <p className="mt-1 text-sm text-slate-400">
            {request.location}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Preferred schedule
          </p>

          <p className="mt-1 text-sm text-slate-400">
            {request.schedule
              ? new Date(request.schedule).toLocaleString()
              : "Not specified"}
          </p>
        </div>

      </div>

      <div className="mt-5">

        <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
          Problem
        </p>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {request.problem}
        </p>

      </div>

    </article>
  );
}

export default RepairRequestCard;