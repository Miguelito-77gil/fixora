import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import RepairerCard from "@/components/features/RepairerCard";
import { fetchRepairers } from "@/services/repairerService";

function HomeSection() {
  const [repairers, setRepairers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRepairers() {
      try {
        const data = await fetchRepairers();
        setRepairers(
          data
            .filter((repairer) => repairer.verified)
            .slice(0, 3)
        );
      } catch (error) {
        console.error("Failed to load featured repairers:", error);
      } finally {
        setLoading(false);
      }
    }

    loadRepairers();
  }, []);

  const featuredRepairers = repairers;

  return (
    <>
      <section className="border-b border-[#e5dfd8] bg-[#f7f7f5]">
        <div className="fixora-container grid min-h-[540px] items-center gap-8 px-2 py-14 sm:gap-10 sm:px-4 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-6 lg:py-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#b9825f]">
              Trusted repair services
            </p>

            <h1 className="mt-5 max-w-3xl text-5xl font-extrabold leading-[1.02] tracking-tight text-[#17202a] sm:text-6xl lg:text-7xl">
              Find the right hands.
              <span className="block text-[#b9825f]">
                Fix the problem.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-[#68727c]">
              Find experienced repairers, explore their previous
              work, and choose someone you can trust.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/repairers">
                Find a Repairer
              </Button>

              <Button to="/become-repairer" variant="outline">
                Become a Repairer
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4 text-sm text-[#777f86]">
              <span>
                <strong className="text-[#26313b]">500+</strong>{" "}
                repairers
              </span>

              <span>
                <strong className="text-[#26313b]">1,000+</strong>{" "}
                completed repairs
              </span>

              <span>
                <strong className="text-[#26313b]">Verified</strong>{" "}
                profiles
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-[#e0d9d2] bg-white p-6 shadow-xl shadow-black/5">
              <div className="flex items-center justify-between border-b border-[#eee9e3] pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#b9825f]">
                    Featured
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-[#17202a]">
                    Trusted repairers
                  </h2>
                </div>

                <span className="text-sm text-[#8a9298]">
                  Cebu
                </span>
              </div>

              <div className="divide-y divide-[#eee9e3]">
                {loading ? (
                  <p className="py-8 text-center text-sm text-[#80878d]">
                    Loading repairers...
                  </p>
                ) : featuredRepairers.length > 0 ? (
                  featuredRepairers.map((repairer) => (
                    <div
                      key={repairer.id}
                      className="flex items-center gap-4 py-5"
                    >
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#eee7df] font-bold text-[#9b806a]">
                        {repairer.initials}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold text-[#26313b]">
                          {repairer.name}
                        </h3>

                        <p className="mt-1 text-sm text-[#80878d]">
                          {repairer.category}
                        </p>

                        <p className="mt-1 text-sm">
                          <span className="font-semibold text-[#26313b]">
                            &#9733; {repairer.rating || 0}
                          </span>

                          <span className="ml-2 text-[#92989d]">
                            {repairer.repairs || 0} repairs
                          </span>
                        </p>
                      </div>

                      <span className="hidden text-xs font-semibold text-[#28734a] sm:block">
                        Verified
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-center text-sm text-[#80878d]">
                    No verified repairers available.
                  </p>
                )}
              </div>

              <Button
                to="/repairers"
                variant="secondary"
                className="mt-2 w-full"
              >
                Browse all repairers
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="fixora-container px-2 py-14 sm:px-4 sm:py-16 lg:px-6 lg:py-20">
        <SectionHeading
          eyebrow="How Fixora works"
          title="Find someone who can actually solve the problem."
          description="Instead of choosing a repairer blindly, compare experience, ratings, services, location, and previous work before contacting them."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            {
              number: "1.",
              title: "Describe the problem",
              text: "Search for the type of repair or service you need.",
            },
            {
              number: "2.",
              title: "Compare repairers",
              text: "Review their experience, ratings, verification, and previous work.",
            },
            {
              number: "3.",
              title: "Contact the right person",
              text: "Choose a repairer and request their service directly.",
            },
          ].map((item) => (
            <div
              key={item.number}
              className="rounded-2xl border border-[#e4ded7] bg-white p-6"
            >
              <span className="text-sm font-bold text-[#b9825f]">
                {item.number}
              </span>

              <h3 className="mt-5 text-xl font-bold text-[#17202a]">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#777f86]">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="fixora-container px-2 sm:px-4 lg:px-6">
          <SectionHeading
            eyebrow="Featured repairers"
            title="People with real experience."
            description="Explore repairers and see the kind of work they have completed before making a decision."
          />

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <p className="text-sm text-[#777f86]">
                Loading repairers...
              </p>
            ) : featuredRepairers.length > 0 ? (
              featuredRepairers.map((repairer) => (
                <RepairerCard
                  key={repairer.id}
                  repairer={repairer}
                />
              ))
            ) : (
              <p className="text-sm text-[#777f86]">
                No verified repairers available.
              </p>
            )}
          </div>

          <div className="mt-8 text-center">
            <Button to="/repairers" variant="outline">
              See all repairers
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomeSection;
