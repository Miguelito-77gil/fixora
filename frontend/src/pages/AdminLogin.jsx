import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

function AdminLogin() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const user = await loginUser({
        email,
        password,
      });

      if (user?.role !== "admin") {
        localStorage.removeItem("fixora_user");
        localStorage.removeItem("fixora_token");

        throw new Error(
          "Access denied. This login is for administrators only."
        );
      }

      setUser(user);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(
        err?.message ||
          "Unable to sign in. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-screen bg-[#f8f5f2] px-6 py-16 text-[#2f241e]">
      <div className="mx-auto flex min-h-[650px] max-w-md items-center justify-center">
        <div className="w-full rounded-3xl border border-[#e4ded7] bg-white p-8 shadow-sm sm:p-10">

          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a6541]">
              Fixora Administration
            </p>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#2f241e]">
              Admin Login
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#777f86]">
              Sign in to manage Fixora users, repairers, and requests.
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            <Input
              label="Admin Email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
            />

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In as Admin"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm font-semibold text-[#9a6541] transition hover:text-[#7f5036]"
            >
              Back to regular login
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}

export default AdminLogin;
