import { useNavigate } from "react-router-dom";

const services = [
  "Appliance Repair",
  "Electrical Repair",
  "Computer Repair",
  "Plumbing Repair",
  "Motorcycle Repair",
];

function PopularServices() {
  const navigate = useNavigate();

  return (
    <section className="fixora-container px-4 py-16 sm:px-6 lg:py-20">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b9825f]">
          Popular services
        </p>

        <h2 className="mt-3 text-3xl font-black tracking-tight text-[#17202a] sm:text-4xl">
          What needs fixing?
        </h2>

        <p className="mt-3 max-w-2xl text-[#777f86]">
          Start with a service category and find repairers who specialize in it.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {services.map((service) => (
          <button
            key={service}
            type="button"
            onClick={() =>
              navigate(`/repairers?search=${encodeURIComponent(service)}`)
            }
            className="group rounded-2xl border border-[#e4ded7] bg-white p-5 text-left transition hover:-translate-y-1 hover:border-[#b9825f] hover:shadow-lg"
          >
            <p className="text-sm font-bold text-[#26313b]">
              {service}
            </p>

            <p className="mt-4 text-xs font-semibold text-[#b9825f] transition group-hover:translate-x-1">
              Find repairers →
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}

export default PopularServices;
