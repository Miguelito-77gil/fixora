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
    <section className="fixora-container py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">

        <div className="overflow-hidden rounded-3xl border border-[#e4ded7] bg-white shadow-sm">

          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#eee7df] text-xl font-semibold text-[#9b806a]">
                  {initials}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-semibold text-[#17202a] sm:text-2xl">
                      {user.name}
                    </h1>

                    {user.role && (
                      <span className="rounded-full bg-[#f3f0ec] px-2.5 py-1 text-xs font-medium capitalize text-[#777f86]">
                        {user.role}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-[#777f86]">
                    {user.email}
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={() => navigate("/edit-profile")}
                className="self-start rounded-lg border border-[#b9825f] px-4 py-2 text-sm font-medium text-[#b9825f] transition hover:bg-[#b9825f] hover:text-white sm:self-auto"
              >
                Edit Profile
              </button>

            </div>
          </div>

          <div className="grid border-t border-[#eee9e3] sm:grid-cols-2">

            <div className="p-6">
              <p className="text-sm font-medium text-[#777f86]">
                Full Name
              </p>
              <p className="mt-2 text-base font-medium text-[#17202a]">
                {user.name}
              </p>
            </div>

            <div className="border-t border-[#eee9e3] p-6 sm:border-l sm:border-t-0">
              <p className="text-sm font-medium text-[#777f86]">
                Email
              </p>
              <p className="mt-2 text-base font-medium text-[#17202a]">
                {user.email}
              </p>
            </div>

            <div className="border-t border-[#eee9e3] p-6">
              <p className="text-sm font-medium text-[#777f86]">
                Mobile Number
              </p>
              <p className="mt-2 text-base font-medium text-[#17202a]">
                {user.phone || "Not specified"}
              </p>
            </div>

            <div className="border-t border-[#eee9e3] p-6 sm:border-l">
              <p className="text-sm font-medium text-[#777f86]">
                Account Type
              </p>
              <p className="mt-2 text-base font-medium capitalize text-[#17202a]">
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
