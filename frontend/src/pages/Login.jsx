import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { loginUser } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await loginUser({ email, password });
      setUser(user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="fixora-container flex min-h-[680px] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-2xl border border-[#e4ded7] bg-white p-8 shadow-sm">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b9825f]">
            Welcome back
          </p>

          <h1 className="mt-3 text-3xl font-extrabold text-[#17202a]">
            Login to Fixora
          </h1>

          <p className="mt-3 text-sm text-[#777f86]">
            Access your account and manage your repair requests.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
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

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-[#b9825f] hover:text-[#8f5d40]"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[#777f86]">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-[#b9825f] hover:text-[#8f5d40]">
            Create one
          </Link>
        </p>
      </div>
    </section>
  );
}

export default Login;
