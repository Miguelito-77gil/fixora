import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "@/assets/luh.png";
import profileImage from "@/assets/akoni.jpg";
import { useAuth } from "@/context/AuthContext";

function Account() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(profileImage);
  const [message, setMessage] = useState("");

  const navClass = ({ isActive }) =>
    `flex items-center rounded-xl px-4 py-3 text-sm font-medium transition ${
      isActive
        ? "border border-[#d8c8bc] bg-[#f3eee9] text-[#2f241e]"
        : "text-[#5f5148] hover:bg-[#f8f5f2]"
    }`;

  function handleLogout() {
    logout();
    navigate("/");
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image must be smaller than 5MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setPhotoPreview(reader.result);
      setMessage("Profile photo selected. Click Save Profile Changes to apply it.");
    };

    reader.readAsDataURL(file);
  }
  function handleSaveProfile(event) {
    event.preventDefault();
    setMessage("Profile changes saved.");
  }

  function handleChangePassword(event) {
    event.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("Please complete all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("New password and confirmation do not match.");
      return;
    }

    setMessage("Password change is ready for backend integration.");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="min-h-screen bg-[#f8f5f2] text-[#2f241e]">

      {/* MOBILE HEADER */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[#e8dfd8] bg-white/95 px-5 py-4 backdrop-blur lg:hidden">
        <img
          src={logo}
          alt="Fixora"
          className="h-9 w-auto object-contain"
        />

        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="rounded-xl border border-[#d8c8bc] bg-white px-4 py-2 text-sm font-medium text-[#5f5148]"
        >
          Menu
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#e8dfd8] bg-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >

        {/* LOGO */}
        <div className="flex items-center justify-between border-b border-[#eee7e2] px-6 py-6">
          <img
            src={logo}
            alt="Fixora"
            className="h-10 w-auto object-contain"
          />

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg px-2 py-1 text-sm text-[#8a7a70] hover:bg-[#f3eee9] lg:hidden"
          >
            Close
          </button>
        </div>

        {/* MENU */}
        <nav className="flex-1 space-y-2 px-4 py-6">

          <NavLink
            to="/customer/dashboard"
            onClick={() => setSidebarOpen(false)}
            className={navClass}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/"
            onClick={() => setSidebarOpen(false)}
            className={navClass}
          >
            Home
          </NavLink>

          <NavLink
            to="/repairers"
            onClick={() => setSidebarOpen(false)}
            className={navClass}
          >
            Find a Repairer
          </NavLink>

          <NavLink
            to="/customer/account"
            onClick={() => setSidebarOpen(false)}
            className={navClass}
          >
            My Account
          </NavLink>

        </nav>

        {/* LOGOUT */}
        <div className="border-t border-[#eee7e2] p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm font-medium text-[#5f5148] transition hover:bg-[#f3eee9]"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="lg:pl-64">
        <section className="mx-auto max-w-5xl px-6 py-10 sm:py-14">

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#9a6541]">
              Account Settings
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#2f241e] sm:text-4xl">
              My Account
            </h1>

            <p className="mt-3 text-[#75675f]">
              Manage your profile information and account security.
            </p>
          </div>

          {message && (
            <div className="mt-6 rounded-xl border border-[#d8c8bc] bg-white px-5 py-4 text-sm text-[#6f5747]">
              {message}
            </div>
          )}

          {/* PROFILE */}
          <div className="mt-10 rounded-3xl border border-[#e1d8d1] bg-white p-6 shadow-sm sm:p-8">

            <div className="flex items-center gap-5 border-b border-[#eee7e2] pb-6">

              <div className="flex flex-col items-center">
                <img
                  src={photoPreview}
                  alt="Profile"
                  className="h-20 w-20 rounded-full border-2 border-[#d8c8bc] object-cover"
                />

                <label
                  htmlFor="profile-photo"
                  className="mt-2 cursor-pointer text-xs font-semibold text-[#8b5e3c] hover:text-[#754b2f]"
                >
                  Change Photo
                </label>

                <input
                  id="profile-photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-[#2f241e]">
                  Profile
                </h2>

                <p className="mt-1 text-sm text-[#75675f]">
                  Update your personal information.
                </p>
              </div>

            </div>

            <form
              onSubmit={handleSaveProfile}
              className="mt-8 space-y-6"
            >

              <div>
                <label className="block text-sm font-medium text-[#4f433c]">
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#d8c8bc] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#9a6541] focus:ring-2 focus:ring-[#9a6541]/10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4f433c]">
                  Mobile Number
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="09XXXXXXXXX"
                  className="mt-2 w-full rounded-xl border border-[#d8c8bc] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#9a6541] focus:ring-2 focus:ring-[#9a6541]/10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4f433c]">
                  Email
                </label>

                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="mt-2 w-full cursor-not-allowed rounded-xl border border-[#e5ddd7] bg-[#f7f5f3] px-4 py-3 text-sm text-[#8a7a70]"
                />

                <p className="mt-2 text-xs text-[#8a7a70]">
                  Email address cannot be changed here.
                </p>
              </div>

              <button
                type="submit"
                className="rounded-xl bg-[#8b5e3c] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#754b2f]"
              >
                Save Profile Changes
              </button>

            </form>
          </div>

          {/* SECURITY */}
          <div className="mt-6 rounded-3xl border border-[#e1d8d1] bg-white p-6 shadow-sm sm:p-8">

            <div className="border-b border-[#eee7e2] pb-6">
              <h2 className="text-xl font-semibold text-[#2f241e]">
                Security
              </h2>

              <p className="mt-1 text-sm text-[#75675f]">
                Change your account password.
              </p>
            </div>

            <form
              onSubmit={handleChangePassword}
              className="mt-8 space-y-6"
            >

              <div>
                <label className="block text-sm font-medium text-[#4f433c]">
                  Current Password
                </label>

                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) =>
                    setCurrentPassword(event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-[#d8c8bc] px-4 py-3 text-sm outline-none focus:border-[#9a6541]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4f433c]">
                  New Password
                </label>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-[#d8c8bc] px-4 py-3 text-sm outline-none focus:border-[#9a6541]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4f433c]">
                  Confirm New Password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-[#d8c8bc] px-4 py-3 text-sm outline-none focus:border-[#9a6541]"
                />
              </div>

              <button
                type="submit"
                className="rounded-xl border border-[#cdb5a2] bg-transparent px-5 py-3 text-sm font-medium text-[#8b5e3c] transition hover:bg-[#f3e5da]"
              >
                Change Password
              </button>

            </form>
          </div>

        </section>
      </main>
    </div>
  );
}

export default Account;



