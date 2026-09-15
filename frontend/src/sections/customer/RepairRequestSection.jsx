import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import RepairRequestForm from "@/components/features/RepairRequestForm";
import { fetchRepairerById } from "@/services/repairerService";
import { createRepairRequest } from "@/services/repairService";
import { loginUser } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";

function RepairRequestSection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [repairer, setRepairer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    async function loadRepairer() {
      try {
        setLoading(true);
        setError("");

        const data = await fetchRepairerById(id);

        if (!data) {
          throw new Error("Repairer not found");
        }

        setRepairer(data);
      } catch (err) {
        console.error("Failed to load repairer:", err);
        setError(err.message || "Failed to load repairer");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadRepairer();
    } else {
      setLoading(false);
      setError("No repairer was selected");
    }
  }, [id]);

  async function handleLogin(event) {
    event.preventDefault();

    setLoginError("");
    setLoggingIn(true);

    try {
      const loggedInUser = await loginUser({
        email: email.trim(),
        password,
      });

      setUser(loggedInUser);
      setPassword("");
    } catch (err) {
      console.error("Login failed:", err);
      setLoginError(err.message || "Invalid email or password.");
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleSubmit(requestData) {
    if (!repairer) {
      setError("Repairer information is not available");
      return;
    }

    if (!user) {
      setLoginError("Please log in first before submitting a repair request.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const description = [
        `Item: ${requestData.itemName}`,
        `Category: ${requestData.category}`,
        `Problem: ${requestData.problem}`,
        `Location: ${requestData.location}`,
        `Preferred schedule: ${requestData.schedule}`,
        requestData.notes
          ? `Additional notes: ${requestData.notes}`
          : null,
        requestData.photoName
          ? `Photo: ${requestData.photoName}`
          : null,
      ]
        .filter(Boolean)
        .join("\n");

      await createRepairRequest({
        repairerId: repairer.id,
        service:
          requestData.category ||
          repairer.category ||
          repairer.specialty ||
          "Repair Service",
        description,
      });

      navigate("/customer/dashboard");
    } catch (err) {
      console.error("Failed to create repair request:", err);

      setError(
        err.message ||
          "We couldn't submit your repair request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <section className="min-h-screen px-6 py-12 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-gray-700 dark:text-gray-300">
            Loading repairer...
          </p>
        </div>
      </section>
    );
  }

  if (error && !repairer) {
    return (
      <section className="min-h-screen px-6 py-12 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
            {error}
          </div>

          <button
            type="button"
            onClick={() => navigate("/repairers")}
            className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Back to Repairers
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen px-6 py-12 sm:py-20">
      <div className="mx-auto max-w-3xl">

        {error && (
          <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {!user ? (
          <div className="mx-auto w-full max-w-md rounded-3xl border border-[#e4ded7] bg-white p-6 shadow-sm sm:p-7">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b9825f]">
                Login Required
              </p>

              <h1 className="mt-3 text-3xl font-black tracking-tight text-[#2f241e] sm:text-4xl">
                Login to request a repair
              </h1>

              <p className="mt-3 leading-7 text-[#777f86]">
                Please log in to continue with your repair request.
              </p>
            </div>

            {loginError && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-6 space-y-5">

              <div>
                <label
                  htmlFor="requestLoginEmail"
                  className="text-sm font-semibold text-[#17202a]"
                >
                  Email
                </label>

                <input
                  id="requestLoginEmail"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  className="mt-2 w-full rounded-xl border border-[#e4ded7] bg-[#faf8f5] px-4 py-3 text-[#17202a] outline-none transition placeholder:text-[#a6aaa8] focus:border-[#b9825f]/50"
                />
              </div>

              <div>
                <label
                  htmlFor="requestLoginPassword"
                  className="text-sm font-semibold text-[#17202a]"
                >
                  Password
                </label>

                <input
                  id="requestLoginPassword"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                  className="mt-2 w-full rounded-xl border border-[#e4ded7] bg-[#faf8f5] px-4 py-3 text-[#17202a] outline-none transition placeholder:text-[#a6aaa8] focus:border-[#b9825f]/50"
                />
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full rounded-xl bg-[#b9825f] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#a9704f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loggingIn ? "Logging in..." : "Login"}
              </button>

            </form>
          </div>
        ) : (
          <RepairRequestForm
            repairer={repairer}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/repairer/${repairer.id}`)}
            submitting={submitting}
          />
        )}

      </div>
    </section>
  );
}

export default RepairRequestSection;

