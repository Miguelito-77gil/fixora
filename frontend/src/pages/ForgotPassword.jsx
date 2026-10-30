import { useState } from "react";
import { Link } from "react-router-dom";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://fixora-backend-kw9p.onrender.com";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.errors?.email?.[0] ||
            "Unable to send password reset link."
        );
      }

      setMessage(
        data?.message || "Password reset link sent successfully."
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
            Forgot Password?
          </h1>

          <p className="mt-3 text-sm text-[#777f86]">
            Enter your email and we'll send you a link to reset your password.
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

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[#777f86]">
          Remember your password?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#b9825f] hover:text-[#8f5d40]"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </section>
  );
}

export default ForgotPassword;