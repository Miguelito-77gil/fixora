import { useEffect, useState } from "react";

const emptyForm = {
  title: "",
  category: "",
  problem: "",
  solution: "",
  date: "",
};

function RepairProjectForm({
  project,
  onSave,
  onCancel,
}) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (project) {
      setForm({
        title: project.title || "",
        category: project.category || "",
        problem: project.problem || "",
        solution: project.solution || "",
        date: project.date || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [project]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (
      !form.title.trim() ||
      !form.category.trim() ||
      !form.problem.trim() ||
      !form.solution.trim()
    ) {
      return;
    }

    onSave({
      ...form,
      title: form.title.trim(),
      category: form.category.trim(),
      problem: form.problem.trim(),
      solution: form.solution.trim(),
    });

    setForm(emptyForm);
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 sm:p-8">

      <div className="flex items-start justify-between gap-6">

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
            {project ? "Edit project" : "New project"}
          </p>

          <h2 className="mt-2 text-2xl font-black">
            {project
              ? "Update repair project"
              : "Add a repair project"}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Show customers the type of work you have completed.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-3 py-2 text-slate-500 transition hover:bg-white/5 hover:text-white"
        >
          âœ•
        </button>

      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-6"
      >

        {/* IMAGE */}
        <div>

          <label className="text-sm font-semibold text-slate-300">
            Project photo
          </label>

          <label className="mt-3 flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-950 px-6 text-center transition hover:border-blue-400/40 hover:bg-white/[0.02]">

            <span className="text-4xl">
              ðŸ“·
            </span>

            <span className="mt-3 font-semibold text-slate-300">
              Upload repair photo
            </span>

            <span className="mt-1 text-xs text-slate-600">
              JPG, PNG up to 5MB
            </span>

            <input
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
            />

          </label>

        </div>

        {/* TITLE */}
        <div>

          <label
            htmlFor="title"
            className="text-sm font-semibold text-slate-300"
          >
            Project title
          </label>

          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Example: Samsung TV Repair"
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-700 focus:border-blue-400/50"
          />

        </div>

        {/* CATEGORY */}
        <div>

          <label
            htmlFor="category"
            className="text-sm font-semibold text-slate-300"
          >
            Category
          </label>

          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-400/50"
          >

            <option value="">
              Select a category
            </option>

            <option value="Electronics">
              Electronics
            </option>

            <option value="Appliance">
              Appliance
            </option>

            <option value="Computer">
              Computer
            </option>

            <option value="Mobile Phone">
              Mobile Phone
            </option>

            <option value="Motorcycle">
              Motorcycle
            </option>

            <option value="Plumbing">
              Plumbing
            </option>

            <option value="Electrical">
              Electrical
            </option>

            <option value="Other">
              Other
            </option>

          </select>

        </div>

        {/* PROBLEM */}
        <div>

          <label
            htmlFor="problem"
            className="text-sm font-semibold text-slate-300"
          >
            What was the problem?
          </label>

          <textarea
            id="problem"
            name="problem"
            value={form.problem}
            onChange={handleChange}
            rows="4"
            placeholder="Describe the problem before the repair..."
            className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-700 focus:border-blue-400/50"
          />

        </div>

        {/* SOLUTION */}
        <div>

          <label
            htmlFor="solution"
            className="text-sm font-semibold text-slate-300"
          >
            How did you fix it?
          </label>

          <textarea
            id="solution"
            name="solution"
            value={form.solution}
            onChange={handleChange}
            rows="4"
            placeholder="Explain what you repaired or replaced..."
            className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-700 focus:border-blue-400/50"
          />

        </div>

        {/* DATE */}
        <div>

          <label
            htmlFor="date"
            className="text-sm font-semibold text-slate-300"
          >
            Completion date
          </label>

          <input
            id="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            placeholder="Example: September 2026"
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-700 focus:border-blue-400/50"
          />

        </div>

        {/* ACTIONS */}
        <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
          >
            {project
              ? "Save Changes"
              : "Add Project"}
          </button>

        </div>

      </form>

    </div>
  );
}

export default RepairProjectForm;
