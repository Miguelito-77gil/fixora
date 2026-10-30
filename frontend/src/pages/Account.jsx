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

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] =
    useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

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

  async function handleChangePassword(event) {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (!currentPassword || !newPassword || !newPasswordConfirmation) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 4) {
      setPasswordError("New password must be at least 4 characters.");
      return;
    }

    if (newPassword !== newPasswordConfirmation) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      setChangingPassword(true);

      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("fixora_token")}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: newPasswordConfirmation,
        }),
      });

      const text = await response.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Failed to change password.");
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            data?.errors?.current_password?.[0] ||
            data?.errors?.new_password?.[0] ||
            `Server returned ${response.status}`
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirmation("");

      setPasswordMessage(
        data?.message || "Password changed successfully."
      );
    } catch (err) {
      setPasswordError(
        err.message || "Failed to change password."
      );
    } finally {
      setChangingPassword(false);
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
          <div className="border-b border-[#eee9e5] pb-6">
            <h2 className="text-xl font-semibold text-[#17202a]">
              Account Security
            </h2>

            <p className="mt-1 text-sm text-[#75675f]">
              Manage your account password securely.
            </p>
          </div>

          <form
            onSubmit={handleChangePassword}
            className="mt-8 space-y-5"
          >
            {passwordMessage && (
              <div className="fixed right-4 top-4 z-[9999] w-[calc(100%-2rem)] max-w-sm">
                <div className="rounded-2xl border border-[#d8c5b8] bg-[#f5e9e0] px-5 py-4 text-[#4f4038] shadow-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">✓</span>

                    <div>
                      <p className="text-sm font-medium">Success</p>
                      <p className="mt-1 text-sm text-[#75675f]">
                        {passwordMessage}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {passwordError && (
              <div className="rounded-2xl border border-[#e7e0da] bg-[#faf9f7] px-4 py-3 text-sm text-[#75675f]">
                {passwordError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#4f4843]">
                Current Password
              </label>

              <input
                type="password"
                value={currentPassword}
                onChange={(event) =>
                  setCurrentPassword(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-[#e1d9d2] bg-white px-4 py-3 text-sm text-[#17202a] outline-none transition focus:border-[#cfc2b7] focus:ring-2 focus:ring-[#f5e9e0]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4f4843]">
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-[#e1d9d2] bg-white px-4 py-3 text-sm text-[#17202a] outline-none transition focus:border-[#cfc2b7] focus:ring-2 focus:ring-[#f5e9e0]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4f4843]">
                Confirm New Password
              </label>

              <input
                type="password"
                value={newPasswordConfirmation}
                onChange={(event) =>
                  setNewPasswordConfirmation(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-[#e1d9d2] bg-white px-4 py-3 text-sm text-[#17202a] outline-none transition focus:border-[#cfc2b7] focus:ring-2 focus:ring-[#f5e9e0]"
              />
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="w-full rounded-xl border border-[#e1d8d0] bg-[#f5e9e0] px-5 py-3 text-sm font-semibold text-[#17202a] transition hover:bg-[#f7f2ee] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {changingPassword
                ? "Changing Password..."
                : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Account;