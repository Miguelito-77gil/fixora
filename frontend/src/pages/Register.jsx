import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { registerUser } from "@/services/authService";

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerUser({ name, email, password });
      navigate("/login");
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
            Join Fixora
          </p>

          <h1 className="mt-3 text-3xl font-extrabold text-[#17202a]">
            Create your account
          </h1>

          <p className="mt-3 text-sm text-[#777f86]">
            Create an account to find repairers or offer your repair services.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <Input
            label="Full name"
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[#777f86]">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-[#b9825f] hover:text-[#8f5d40]">
            Login
          </Link>
        </p>
      </div>
    </section>
  );
}

export default Register;