import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { applyAsRepairer } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";

const CATEGORIES = [
  "Electronics",
  "Appliances",
  "Plumbing",
  "Electrical",
  "Automotive",
  "Furniture",
  "Other",
];

function BecomeRepairer() {
  const { user, setUser } = useAuth();
  const [category, setCategory] = useState("");
  const [bio, setBio] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <section className="fixora-container flex min-h-[500px] items-center justify-center py-16">
        <div className="w-full max-w-md rounded-2xl border border-[#e4ded7] bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-extrabold text-[#17202a]">
            Login required
          </h1>

          <p className="mt-3 text-sm text-[#777f86]">
            You need an account before applying to become a repairer.
          </p>

          <Button to="/login" className="mt-6 w-full">
            Go to Login
          </Button>
        </div>
      </section>
    );
  }

  if (user.role === "repairer" || user.role === "admin") {
    return (
      <section className="fixora-container flex min-h-[500px] items-center justify-center py-16">
        <div className="w-full max-w-md rounded-2xl border border-[#e4ded7] bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-extrabold text-[#17202a]">
            Application already submitted
          </h1>

          <p className="mt-3 text-sm text-[#777f86]">
            Your current status is{" "}
            <span className="font-semibold text-[#b9825f]">
              {user.verification_status}
            </span>
            .
          </p>
        </div>
      </section>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await applyAsRepairer({
        category,
        bio,
        years_experience: yearsExperience ? Number(yearsExperience) : null,
        location,
        price: price ? Number(price) : null,
        phone,
      });

      setUser({
        ...user,
        role: "repairer",
        verification_status: "pending",
      });

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <section className="fixora-container flex min-h-[500px] items-center justify-center py-16">
        <div className="w-full max-w-md rounded-2xl border border-[#e4ded7] bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-extrabold text-[#17202a]">
            Application submitted
          </h1>

          <p className="mt-3 text-sm text-[#777f86]">
            Your application is now pending review. We'll notify you once
            it's verified.
          </p>

          <Button to="/" className="mt-6 w-full">
            Back to Home
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="fixora-container flex min-h-[680px] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-2xl border border-[#e4ded7] bg-white p-8 shadow-sm">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b9825f]">
            Offer your services
          </p>

          <h1 className="mt-3 text-3xl font-extrabold text-[#17202a]">
            Become a Repairer
          </h1>

          <p className="mt-3 text-sm text-[#777f86]">
            Tell us about your skills. Your application will be reviewed
            before you're listed publicly.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#26313b]">
              Category
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full rounded-lg border border-[#ddd7d0] bg-white px-4 py-2.5 text-sm text-[#26313b] focus:border-[#b9825f] focus:outline-none"
            >
              <option value="" disabled>
                Select a category
              </option>

              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#26313b]">
              Bio
            </label>

            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Describe your experience and the type of repairs you handle"
              className="w-full rounded-lg border border-[#ddd7d0] bg-white px-4 py-2.5 text-sm text-[#26313b] focus:border-[#b9825f] focus:outline-none"
            />
          </div>

          <Input
            label="Years of experience"
            type="number"
            min="0"
            placeholder="e.g. 3"
            value={yearsExperience}
            onChange={(e) => setYearsExperience(e.target.value)}
          />

          <Input
            label="Location"
            type="text"
            placeholder="e.g. Cebu City, Cebu"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />

          <Input
            label="Starting price (â‚±)"
            type="number"
            min="0"
            placeholder="e.g. 500"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </div>
    </section>
  );
}

export default BecomeRepairer;