function ManageProjectCard({
  project,
  onEdit,
  onDelete,
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70">

      {/* IMAGE */}
      <div className="flex h-40 items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
        <span className="text-4xl">
          🔧
        </span>
      </div>

      <div className="p-5">

        <div className="flex items-start justify-between gap-4">

          <div>

            <p className="text-xs font-bold uppercase tracking-wider text-blue-400">
              {project.category}
            </p>

            <h3 className="mt-2 font-bold text-white">
              {project.title}
            </h3>

          </div>

          <span className="text-xs text-slate-600">
            {project.date}
          </span>

        </div>

        <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
          {project.problem}
        </p>

        <div className="mt-5 flex gap-2">

          <button
            type="button"
            onClick={() => onEdit(project)}
            className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete(project)}
            className="flex-1 rounded-xl border border-red-400/10 bg-red-400/5 px-4 py-2.5 text-sm font-bold text-red-300 transition hover:bg-red-400/10"
          >
            Delete
          </button>

        </div>

      </div>

    </article>
  );
}

export default ManageProjectCard;