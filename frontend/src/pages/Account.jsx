import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://fixora-backend-kw9p.onrender.com";

function Account() {
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/users/me`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("fixora_token")}`,
          },
        });

        const text = await response.text();

        let data;

        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Failed to load account information.");
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              `Server returned ${response.status}`
          );
        }

        const profile = data?.user || data?.data || data;

        setName(profile?.name || user?.name || "");
        setPhone(profile?.phone || user?.phone || "");
        setEmail(profile?.email || user?.email || "");
      } catch (err) {
        setError(err.message || "Failed to load account information.");
        setName(user?.name || "");
        setPhone(user?.phone || "");
        setEmail(user?.email || "");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  async function handleSaveProfile(event) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Full name is required.");
      setMessage("");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("fixora_token")}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
        }),
      });

      const text = await response.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Failed to update profile.");
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Server returned ${response.status}`
        );
      }

      const updatedUser = data?.user || data?.data || data;

      if (updatedUser?.name) {
        setName(updatedUser.name);
      }

      if (updatedUser?.phone) {
        setPhone(updatedUser.phone);
      }

      setMessage("Profile changes saved successfully.");
    } catch (err) {
      setError(err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="min-h-full bg-[#f7f7f5] text-[#17202a]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div>
          <p className="text-sm font-medium text-[#8a817b]">
            Account Settings
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#17202a]">
            My Account
          </h1>

          <p className="mt-2 text-sm text-[#75675f]">
            Manage your profile information and account details.
          </p>
        </div>

        {message && (
          <div className="mt-6 rounded-2xl border border-[#e7e0da] bg-white px-5 py-4 text-sm text-[#75675f]">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-[#e7e0da] bg-white px-5 py-4 text-sm text-[#75675f]">
            {error}
          </div>
        )}

        <div className="mt-8 rounded-3xl border border-[#e7e0da] bg-white p-6 shadow-sm sm:p-8">
          <div className="border-b border-[#eee9e5] pb-6">
            <h2 className="text-xl font-semibold text-[#17202a]">
              Profile Information
            </h2>

            <p className="mt-1 text-sm text-[#75675f]">
              Update your personal information.
            </p>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm text-[#8a817b]">
              Loading account information...
            </div>
          ) : (
            <form
              onSubmit={handleSaveProfile}
              className="mt-8 space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-[#4f4843]">
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#e1d9d2] bg-white px-4 py-3 text-sm text-[#17202a] outline-none transition focus:border-[#cfc2b7] focus:ring-2 focus:ring-[#f5e9e0]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4f4843]">
                  Mobile Number
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="09XXXXXXXXX"
                  className="mt-2 w-full rounded-xl border border-[#e1d9d2] bg-white px-4 py-3 text-sm text-[#17202a] outline-none transition focus:border-[#cfc2b7] focus:ring-2 focus:ring-[#f5e9e0]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4f4843]">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  disabled
                  className="mt-2 w-full cursor-not-allowed rounded-xl border border-[#e7e0da] bg-[#f7f5f3] px-4 py-3 text-sm text-[#8a817b]"
                />

                <p className="mt-2 text-xs text-[#8a817b]">
                  Email address cannot be changed here.
                </p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl border border-[#e1d8d0] bg-[#f5e9e0] px-5 py-3 text-sm font-semibold text-[#17202a] transition hover:bg-[#f7f2ee] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Profile Changes"}
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 rounded-3xl border border-[#e7e0da] bg-white p-6 shadow-sm sm:p-8">
          <div>
            <h2 className="text-xl font-semibold text-[#17202a]">
              Account Security
            </h2>

            <p className="mt-1 text-sm text-[#75675f]">
              Your account security is managed through your Fixora login.
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-[#eee9e5] bg-[#faf9f7] p-5">
            <p className="text-sm font-medium text-[#17202a]">
              Password
            </p>

            <p className="mt-1 text-sm leading-6 text-[#75675f]">
              Your current account password is protected and cannot be
              changed from this page until a dedicated password-update
              endpoint is available.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Account;