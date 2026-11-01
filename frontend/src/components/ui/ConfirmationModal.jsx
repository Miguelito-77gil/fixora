function ConfirmationModal({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Keep",
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#3f342d]/40 px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#d8c8bc] bg-[#fffaf5] p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-[#3f342d]">
          {title}
        </h2>

        <p className="mt-3 text-sm leading-6 text-[#75675f]">
          {message}
        </p>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="w-full rounded-xl border border-[#d8c8bc] bg-[#f7f2ee] px-5 py-3 text-sm font-medium text-[#6b584b] transition hover:bg-[#eee4dc] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="w-full rounded-xl border border-[#b9825f] bg-[#b9825f] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#a9704e] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {loading ? "Cancelling..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;