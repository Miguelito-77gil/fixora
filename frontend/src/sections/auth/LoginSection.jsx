import { Link } from "react-router-dom";

function LoginSection() {
  return (
    <section className="flex min-h-[750px] items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-indigo-300">
            Welcome back
          </p>

          <h1 className="mt-3 text-4xl font-black">
            Sign in to Fixora
          </h1>

          <p className="mt-3 text-slate-500">
            Manage your repair requests and profile.
          </p>
        </div>

        <form
          onSubmit={(event) => event.preventDefault()}
          className="rounded-3xl border border-white/10 bg-white/[0.04] p-7"
        >
          <label className="text-sm font-semibold text-slate-300">
            Email
          </label>

          <input
            type="email"
            placeholder="you@example.com"
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3.5 text-white outline-none placeholder:text-slate-600 focus:border-indigo-400/50"
          />

          <label className="mt-5 block text-sm font-semibold text-slate-300">
            Password
          </label>

          <input
            type="password"
            placeholder="••••••••"
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3.5 text-white outline-none placeholder:text-slate-600 focus:border-indigo-400/50"
          />

          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-white py-3.5 font-bold text-slate-950 transition hover:bg-indigo-100"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Want to offer repair services?
          </p>

          <Link
            to="/"
            className="mt-2 inline-block font-semibold text-indigo-300 hover:text-indigo-200"
          >
            Become a repairer →
          </Link>
        </div>
      </div>
    </section>
  );
}

export default LoginSection;