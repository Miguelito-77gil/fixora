import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import RepairerCard from "@/components/features/RepairerCard";
import { fetchRepairers } from "@/services/repairerService";

import applianceImage from "@/assets/repair-work/appliance.jpg";
import electricalImage from "@/assets/repair-work/electrical.jpg";
import computerImage from "@/assets/repair-work/computer.jpg";
import plumbingImage from "@/assets/repair-work/plumbing.jpg";
import motorcycleImage from "@/assets/repair-work/motorcycle.jpg";

const slides = [
  {
    image: applianceImage,
    title: "Appliance Repair",
    description:
      "Get your appliances checked and repaired by trusted local repairers.",
  },
  {
    image: electricalImage,
    title: "Electrical Repair",
    description:
      "Find reliable repairers for electrical problems and installations.",
  },
  {
    image: computerImage,
    title: "Computer Repair",
    description:
      "Get help with computer troubleshooting, upgrades, and repairs.",
  },
  {
    image: plumbingImage,
    title: "Plumbing Repair",
    description:
      "Connect with repairers who can handle leaks, pipes, and plumbing issues.",
  },
  {
    image: motorcycleImage,
    title: "Motorcycle Repair",
    description:
      "Find experienced repairers for motorcycle maintenance and repairs.",
  },
];

function HomeSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [featuredRepairers, setFeaturedRepairers] = useState([]);
  const [loadingRepairers, setLoadingRepairers] = useState(true);

  const currentSlide = slides[currentIndex];

  useEffect(() => {
    loadFeaturedRepairers();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  async function loadFeaturedRepairers() {
    try {
      const data = await fetchRepairers();

      const verified = data
        .filter((repairer) => repairer.verified)
        .sort((a, b) => {
          if (b.rating !== a.rating) {
            return b.rating - a.rating;
          }

          return (b.repairs || 0) - (a.repairs || 0);
        })
        .slice(0, 3);

      setFeaturedRepairers(verified);
    } catch (error) {
      console.error("Failed to load featured repairers:", error);
      setFeaturedRepairers([]);
    } finally {
      setLoadingRepairers(false);
    }
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const previousSlide = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + slides.length) % slides.length
    );
  };

  return (
    <>
      {/* HERO */}
      <section className="border-b border-[#e5dfd8] bg-[#f7f7f5]">
        <div className="fixora-container px-2 py-6 sm:px-4 lg:px-6 lg:py-8">
          <div className="relative min-h-[600px] overflow-hidden rounded-[2rem] border border-[#ded7cf] bg-black shadow-xl">
            <div className="absolute inset-0">
              {slides.map((slide, index) => (
                <img
                  key={slide.title}
                  src={slide.image}
                  alt={slide.title}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                    index === currentIndex
                      ? "opacity-100"
                      : "opacity-0"
                  }`}
                />
              ))}

              <div className="absolute inset-0 bg-black/45" />

              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/20" />
            </div>

            <div className="relative z-10 flex min-h-[600px] items-center px-6 py-16 sm:px-10 lg:px-16">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#d6a07c]">
                  Trusted repair services
                </p>

                <h1 className="mt-5 text-5xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
                  Find the right hands.
                  <span className="block text-[#d6a07c]">
                    Fix the problem.
                  </span>
                </h1>

                <p className="mt-6 max-w-xl text-lg leading-8 text-white/75">
                  Find experienced repairers, explore their previous
                  work, and choose someone you can trust.
                </p>

                <div className="mt-8">
                  <Button
                    to="/repairers"
                    className="!bg-[#d6a07c] !text-[#17202a] hover:!bg-[#e5b18f]"
                  >
                    Find a Repairer
                  </Button>
                </div>

                <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4 text-sm text-white/65">
                  <span>
                    <strong className="text-white">500+</strong>{" "}
                    repairers
                  </span>

                  <span>
                    <strong className="text-white">1,000+</strong>{" "}
                    completed repairs
                  </span>

                  <span>
                    <strong className="text-white">Verified</strong>{" "}
                    profiles
                  </span>
                </div>
              </div>

              <div className="absolute bottom-20 right-10 hidden w-[330px] rounded-2xl border border-white/20 bg-black/35 p-5 text-right backdrop-blur-md lg:block">
                <p className="text-xs font-bold uppercase tracking-widest text-white/50">
                  Featured service
                </p>

                <h2 className="mt-2 text-2xl font-bold text-white">
                  {currentSlide.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/65">
                  {currentSlide.description}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={previousSlide}
              aria-label="Previous slide"
              className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-3xl text-white backdrop-blur-md transition hover:bg-black/60"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next slide"
              className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-3xl text-white backdrop-blur-md transition hover:bg-black/60"
            >
              ›
            </button>

            <div className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.title}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to ${slide.title}`}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-8 bg-white"
                      : "w-2.5 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

     {/* HOW FIXORA WORKS */}
<section className="fixora-container px-2 py-14 sm:px-4 sm:py-16 lg:px-6 lg:py-20">
  <SectionHeading
    eyebrow="How Fixora works"
    title="Find someone who can actually solve the problem."
    description="Instead of choosing a repairer blindly, compare experience, ratings, services, location, and previous work before contacting them."
  />

  <div className="mt-10 grid gap-5 md:grid-cols-3">
    {[
      {
        title: "Describe the problem",
        text: "Search for the type of repair or service you need.",
      },
      {
        title: "Compare repairers",
        text: "Review their experience, ratings, verification, and previous work.",
      },
      {
        title: "Contact the right person",
        text: "Choose a repairer and request their service directly.",
      },
    ].map((item, index) => (
      <div
        key={item.title}
        className="group rounded-2xl border border-[#e4ded7] bg-[#f7f7f5] p-6 transition duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-md"
      >
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b9825f]">
          Step {index + 1}
        </p>

        <h3 className="mt-4 text-lg font-bold tracking-tight text-[#17202a]">
          {item.title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-[#777f86]">
          {item.text}
        </p>
      </div>
    ))}
  </div>
</section>

      {/* FEATURED REPAIRERS */}
      <section className="bg-white py-16">
        <div className="fixora-container px-2 sm:px-4 lg:px-6">
          <SectionHeading
            eyebrow="Featured repairers"
            title="People with real experience."
            description="Explore repairers and see the kind of work they have completed before making a decision."
          />

          {loadingRepairers ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-[300px] animate-pulse rounded-2xl border border-[#e4ded7] bg-[#f7f7f5]"
                />
              ))}
            </div>
          ) : featuredRepairers.length > 0 ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredRepairers.map((repairer) => (
                <RepairerCard
                  key={repairer.id}
                  repairer={{
                    ...repairer,
                    completedRepairs: repairer.repairs,
                    startingPrice: repairer.price,
                    slug: repairer.id,
                    specialties: repairer.services || [],
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-[#d8d0c8] bg-[#f7f7f5] p-8 text-center">
              <h3 className="text-lg font-bold text-[#26313b]">
                No featured repairers yet
              </h3>

              <p className="mt-2 text-sm text-[#777f86]">
                Verified repairers will appear here.
              </p>
            </div>
          )}

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







