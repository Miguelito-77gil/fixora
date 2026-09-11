import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyProfile } from "@/services/authService";

function MyProfileSection() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyProfile()
      .then(setUser)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="fixora-container py-20 text-center">
        <p className="text-sm text-[#777f86]">Loading...</p>
      </section>
    );
  }

  if (error || !user) {
    return (
      <section className="fixora-container py-20 text-center">
        <div className="mx-auto max-w-2xl rounded-3xl border border-[#e4ded7] bg-white p-10 shadow-sm">
          <h1 className="text-3xl font-bold text-[#17202a]">
            Profile not found
          </h1>
          <p className="mt-3 text-[#777f86]">
            {error || "We couldn't load your profile."}
          </p>
        </div>
      </section>
    );
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <section className="fixora-container py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-5xl">

        <div className="overflow-hidden rounded-3xl border border-[#e4ded7] bg-white shadow-[0_12px_40px_rgba(47,36,30,0.07)]">

          <div className="p-7 sm:p-9 lg:p-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#f2e7de] text-xl font-bold text-[#9b806a] ring-4 ring-[#faf5f1] sm:h-24 sm:w-24 sm:text-2xl">
                  {initials}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-black tracking-tight text-[#17202a] sm:text-3xl">
                      {user.name}
                    </h1>

                    {user.role && (
                      <span className="rounded-full border border-[#eadfd6] bg-[#faf7f4] px-3 py-1 text-xs font-semibold capitalize text-[#8b5e3c]">
                        {user.role}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-[#75675f]">
                    {user.email}
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={() => navigate("/edit-profile")}
                className="self-start rounded-xl border border-[#b9825f] bg-white px-5 py-2.5 text-sm font-semibold text-[#8b5e3c] transition hover:bg-[#b9825f] hover:text-white sm:self-auto"
              >
                Edit Profile
              </button>

            </div>
          </div>

          <div className="grid border-t border-[#eee9e3] sm:grid-cols-2">

            <div className="p-7 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9a8375]">
                Full Name
              </p>
              <p className="mt-2 text-base font-semibold text-[#17202a]">
                {user.name}
              </p>
            </div>

            <div className="border-t border-[#eee9e3] p-6 sm:border-l sm:border-t-0">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9a8375]">
                Email
              </p>
              <p className="mt-2 text-base font-semibold text-[#17202a]">
                {user.email}
              </p>
            </div>

            <div className="border-t border-[#eee9e3] p-6">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9a8375]">
                Mobile Number
              </p>
              <p className="mt-2 text-base font-semibold text-[#17202a]">
                {user.phone || "Not specified"}
              </p>
            </div>

            <div className="border-t border-[#eee9e3] p-6 sm:border-l">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9a8375]">
                Account Type
              </p>
              <p className="mt-2 text-base font-semibold capitalize text-[#17202a]">
                {user.role || "Customer"}
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default MyProfileSection;

