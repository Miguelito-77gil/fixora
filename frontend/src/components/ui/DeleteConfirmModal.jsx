function DeleteConfirmModal({
  project,
  onConfirm,
  onCancel,
}) {
  if (!project) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-7 shadow-2xl">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-400/10 text-xl">
          âš ï¸
        </div>

        <h2 className="mt-5 text-2xl font-black">
          Delete this project?
        </h2>

        <p className="mt-3 text-sm leading-7 text-slate-500">
          You're about to remove{" "}
          <span className="font-semibold text-slate-300">
            {project.title}
          </span>
          . This action cannot be undone.
        </p>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-red-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-red-300"
          >
            Delete Project
          </button>

        </div>

      </div>

    </div>
  );
}

export default DeleteConfirmModal;
