import { useState } from "react";

const initialForm = {
  itemName: "",
  category: "",
  problem: "",
  location: "",
  schedule: "",
  notes: "",
};

function RepairRequestForm({
  repairer,
  onSubmit,
  onCancel,
  submitting = false,
  locked = false,
}) {
  const [form, setForm] = useState(initialForm);
  const [photoName, setPhotoName] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];

    if (file) {
      setPhotoName(file.name);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (locked) {
      return;
    }

    if (
      !form.itemName.trim() ||
      !form.category ||
      !form.problem.trim() ||
      !form.location.trim() ||
      !form.schedule
    ) {
      return;
    }

    onSubmit({
      ...form,
      itemName: form.itemName.trim(),
      problem: form.problem.trim(),
      location: form.location.trim(),
      notes: form.notes.trim(),
      photoName,
    });
  }

  return (
    <div className="mx-auto max-w-3xl">

      {/* HEADER */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b9825f]">
          Repair Request
        </p>

        <h1 className="mt-3 text-3xl font-black tracking-tight text-[#2f241e] sm:text-4xl">
          Request a repair
        </h1>

        <p className="mt-3 leading-7 text-[#777f86]">
          Tell the repairer what needs to be fixed and provide
          enough information to help them understand the problem.
        </p>
      </div>

      {/* SELECTED REPAIRER */}
      <div className="mb-6 rounded-2xl border border-[#e4ded7] bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#777f86]">
          Repairer
        </p>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#b9825f]/10 font-bold text-[#b9825f] ring-1 ring-[#b9825f]/20">
            {repairer.name
              .split(" ")
              .map((word) => word[0])
              .join("")
              .slice(0, 2)}
          </div>

          <div>
            <p className="font-bold text-[#17202a]">
              {repairer.name}
            </p>

            <p className="mt-1 text-sm text-[#777f86]">
              {repairer.specialty}
            </p>
          </div>

          {repairer.verified && (
            <span className="ml-auto rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700 ring-1 ring-green-200">
              Verified
            </span>
          )}
        </div>
      </div>

      {/* REQUEST FORM */}
      <form
        onSubmit={handleSubmit}
        className={`rounded-3xl border border-[#e4ded7] bg-white p-6 sm:p-8 ${
          locked ? "opacity-75" : ""
        }`}
      >

        {locked && (
          <div className="mb-6 rounded-2xl border border-[#e4ded7] bg-[#faf8f5] px-5 py-4">
            <p className="text-sm font-bold text-[#2f241e]">
              Login required
            </p>

            <p className="mt-1 text-sm leading-6 text-[#777f86]">
              Please log in using the form above to unlock this request form.
            </p>
          </div>
        )}

        <fieldset disabled={locked || submitting}>

          {/* ITEM */}
          <div>
            <label
              htmlFor="itemName"
              className="text-sm font-semibold text-[#17202a]"
            >
              What needs to be repaired?
            </label>

            <input
              id="itemName"
              name="itemName"
              value={form.itemName}
              onChange={handleChange}
              placeholder="Example: Samsung 55-inch TV"
              className="mt-2 w-full rounded-xl border border-[#e4ded7] bg-[#faf8f5] px-4 py-3 text-[#17202a] outline-none transition placeholder:text-[#a6aaa8] focus:border-[#b9825f]/50 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* CATEGORY */}
          <div className="mt-6">
            <label
              htmlFor="category"
              className="text-sm font-semibold text-[#17202a]"
            >
              Repair category
            </label>

            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-[#e4ded7] bg-[#faf8f5] px-4 py-3 text-[#17202a] outline-none transition focus:border-[#b9825f]/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">Select a category</option>
              <option value="Electronics">Electronics</option>
              <option value="Appliance">Appliance</option>
              <option value="Computer">Computer</option>
              <option value="Mobile Phone">Mobile Phone</option>
              <option value="Motorcycle">Motorcycle</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* PROBLEM */}
          <div className="mt-6">
            <label
              htmlFor="problem"
              className="text-sm font-semibold text-[#17202a]"
            >
              Describe the problem
            </label>

            <textarea
              id="problem"
              name="problem"
              value={form.problem}
              onChange={handleChange}
              rows="6"
              placeholder="Explain what happened, what the item is doing, or what stopped working..."
              className="mt-2 w-full resize-none rounded-xl border border-[#e4ded7] bg-[#faf8f5] px-4 py-3 leading-7 text-[#17202a] outline-none transition placeholder:text-[#a6aaa8] focus:border-[#b9825f]/50 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* PHOTO */}
          <div className="mt-6">
            <label className="text-sm font-semibold text-[#17202a]">
              Photos of the problem
            </label>

            <label
              className={`mt-2 flex min-h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-[#e4ded7] bg-[#faf8f5] px-6 text-center transition ${
                locked
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer hover:border-[#b9825f]/40 hover:bg-[#f5f1ec]"
              }`}
            >
              <span className="text-sm font-semibold text-[#17202a]">
                {photoName ? photoName : "Choose a photo"}
              </span>

              <span className="mt-2 text-xs text-[#777f86]">
                JPG or PNG up to 5MB
              </span>

              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={handlePhotoChange}
                disabled={locked}
                className="hidden"
              />
            </label>
          </div>

          {/* LOCATION */}
          <div className="mt-6">
            <label
              htmlFor="location"
              className="text-sm font-semibold text-[#17202a]"
            >
              Repair location
            </label>

            <input
              id="location"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Example: Lapu-Lapu City, Cebu"
              className="mt-2 w-full rounded-xl border border-[#e4ded7] bg-[#faf8f5] px-4 py-3 text-[#17202a] outline-none transition placeholder:text-[#a6aaa8] focus:border-[#b9825f]/50 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <p className="mt-2 text-xs text-[#777f86]">
              Provide the general area only. Exact contact details can be shared after the repairer accepts.
            </p>
          </div>

          {/* SCHEDULE */}
          <div className="mt-6">
            <label
              htmlFor="schedule"
              className="text-sm font-semibold text-[#17202a]"
            >
              Preferred schedule
            </label>

            <input
              id="schedule"
              name="schedule"
              type="datetime-local"
              value={form.schedule}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-[#e4ded7] bg-[#faf8f5] px-4 py-3 text-[#17202a] outline-none transition focus:border-[#b9825f]/50 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* NOTES */}
          <div className="mt-6">
            <label
              htmlFor="notes"
              className="text-sm font-semibold text-[#17202a]"
            >
              Additional notes
              <span className="ml-2 font-normal text-[#777f86]">
                Optional
              </span>
            </label>

            <textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows="4"
              placeholder="Anything else the repairer should know?"
              className="mt-2 w-full resize-none rounded-xl border border-[#e4ded7] bg-[#faf8f5] px-4 py-3 leading-7 text-[#17202a] outline-none transition placeholder:text-[#a6aaa8] focus:border-[#b9825f]/50 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

        </fieldset>

        {/* ACTIONS */}
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#e4ded7] pt-6 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[#e4ded7] px-6 py-3 text-sm font-bold text-slate-500 transition hover:bg-[#faf8f5] hover:text-[#17202a]"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting || locked}
            className="rounded-xl bg-[#b9825f] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#a9704f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {locked
              ? "Login Required"
              : submitting
                ? "Submitting..."
                : "Continue"}
          </button>

        </div>

      </form>
    </div>
  );
}

export default RepairRequestForm;

