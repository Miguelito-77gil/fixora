import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://fixora-backend-kw9p.onrender.com";

function ResetPassword() {
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }

    if (!token || !email) {
      setError("Invalid or incomplete password reset link.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          token,
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.errors?.password?.[0] ||
            "Unable to reset password."
        );
      }

      setPassword("");
      setPasswordConfirmation("");
      setMessage(
        data?.message || "Password reset successfully."
      );
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="fixora-container flex min-h-[680px] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-2xl border border-[#e4ded7] bg-white p-8 shadow-sm">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b9825f]">
            Account Recovery
          </p>

          <h1 className="mt-3 text-3xl font-extrabold text-[#17202a]">
            Reset Password
          </h1>

          <p className="mt-3 text-sm text-[#777f86]">
            Create a new password for your Fixora account.
          </p>
        </div>

        {message && (
          <div className="mt-6 rounded-lg border border-[#d8c5b8] bg-[#f5e9e0] px-4 py-3 text-sm text-[#4f4038]">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!message && (
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <Input
              label="New Password"
              type="password"
              placeholder="Enter your new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Confirm your new password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        )}

        {message && (
          <div className="mt-6">
            <Link
              to="/login"
              className="block text-center text-sm font-semibold text-[#b9825f] hover:text-[#8f5d40]"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default ResetPassword;