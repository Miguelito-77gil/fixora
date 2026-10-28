import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getToken } from "@/services/authService";
import { fetchRepairerServices } from "@/services/marketplaceService";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://fixora-backend-kw9p.onrender.com";

function RepairerServices() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    starting_price: "",
  });

  async function loadServices() {
    try {
      setLoading(true);
      setError("");

      if (!user?.id) {
        throw new Error("Your account could not be identified. Please log in again.");
      }

      const data = await fetchRepairerServices(user.id);

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.services)
            ? data.services
            : [];

      setServices(list);
    } catch (err) {
      console.error("Failed to load services:", err);
      setError(err.message || "Failed to load services.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.id) {
      loadServices();
    }
  }, [user?.id]);

  function resetForm() {
    setForm({
      name: "",
      description: "",
      starting_price: "",
    });

    setEditingId(null);
  }

  function openAddForm() {
    setError("");
    setSuccess("");
    resetForm();
    setFormOpen(true);
  }

  function openEditForm(service) {
    setError("");
    setSuccess("");

    setEditingId(service.id);

    setForm({
      name: service.name || service.service_name || "",
      description: service.description || "",
      starting_price:
        service.starting_price ??
        service.price ??
        "",
    });

    setFormOpen(true);
  }

  function closeForm() {
    if (saving) return;

    setFormOpen(false);
    resetForm();
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = getToken();

      if (!token) {
        throw new Error("Authentication token is missing.");
      }

      if (!form.name.trim()) {
        throw new Error("Service name is required.");
      }

      if (!form.description.trim()) {
        throw new Error("Description is required.");
      }

      if (
        form.starting_price !== "" &&
        Number(form.starting_price) < 0
      ) {
        throw new Error("Please enter a valid starting price.");
      }

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        starting_price:
          form.starting_price === ""
            ? null
            : Number(form.starting_price),
      };

      const isEditing = Boolean(editingId);

      const response = await fetch(
        isEditing
          ? `${API_URL}/api/marketplace/repairer-services/${editingId}`
          : `${API_URL}/api/marketplace/repairer-services`,
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const validationMessage =
          data?.errors &&
          Object.values(data.errors).flat().join(" ");

        throw new Error(
          validationMessage ||
            data?.message ||
            data?.error ||
            `Failed to ${isEditing ? "update" : "add"} service (${response.status})`
        );
      }

      setFormOpen(false);
      resetForm();

      setSuccess(
        isEditing
          ? "Service updated successfully."
          : "Service added successfully."
      );

      await loadServices();

      window.setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error("Failed to save service:", err);
      setError(err.message || "Failed to save service.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this service?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      const token = getToken();

      if (!token) {
        throw new Error("Authentication token is missing.");
      }

      const response = await fetch(
        `${API_URL}/api/marketplace/repairer-services/${id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Failed to delete service (${response.status})`
        );
      }

      setSuccess("Service deleted successfully.");

      await loadServices();

      window.setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error("Failed to delete service:", err);
      setError(err.message || "Failed to delete service.");
    } finally {
      setDeletingId(null);
    }
  }

  function getServicePrice(service) {
    const value =
      service.starting_price ??
      service.price ??
      null;

    if (value === null || value === "") {
      return "Price available on request";
    }

    return `PHP ${Number(value).toLocaleString()}`;
  }

  return (
    <div className="min-h-screen bg-[#f7f3ef] text-[#2f241e]">
      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b9825f]">
              Repairer Workspace
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-[#2f241e]">
              My Services
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#75675f]">
              Manage the repair services customers can see on your profile.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddForm}
            className="rounded-xl bg-[#b9825f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#a9704e]"
          >
            Add Service
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm leading-6 text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
            <p className="text-sm leading-6 text-emerald-700">
              {success}
            </p>
          </div>
        )}

        {formOpen && (
          <section className="mt-8 rounded-3xl border border-[#e4d9d0] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b9825f]">
                  {editingId ? "Edit Service" : "New Service"}
                </p>

                <h2 className="mt-2 text-2xl font-bold text-[#2f241e]">
                  {editingId
                    ? "Update your service"
                    : "Add a service you offer"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg px-3 py-2 text-sm text-[#75675f] transition hover:bg-[#f7eee8] disabled:opacity-50"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label
                  htmlFor="service-name"
                  className="text-sm font-semibold text-[#4f443d]"
                >
                  Service Name
                </label>

                <input
                  id="service-name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Example: TV Repair"
                  className="mt-2 w-full rounded-xl border border-[#dcd0c7] bg-white px-4 py-3 text-sm text-[#2f241e] outline-none transition focus:border-[#b9825f] focus:ring-2 focus:ring-[#b9825f]/15"
                />
              </div>

              <div>
                <label
                  htmlFor="service-description"
                  className="text-sm font-semibold text-[#4f443d]"
                >
                  Description
                </label>

                <textarea
                  id="service-description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe what is included in this service."
                  className="mt-2 w-full resize-none rounded-xl border border-[#dcd0c7] bg-white px-4 py-3 text-sm leading-6 text-[#2f241e] outline-none transition focus:border-[#b9825f] focus:ring-2 focus:ring-[#b9825f]/15"
                />
              </div>

              <div className="max-w-xs">
                <label
                  htmlFor="service-price"
                  className="text-sm font-semibold text-[#4f443d]"
                >
                  Starting Price
                </label>

                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#8b776b]">
                    PHP
                  </span>

                  <input
                    id="service-price"
                    name="starting_price"
                    type="number"
                    min="0"
                    step="1"
                    value={form.starting_price}
                    onChange={handleChange}
                    placeholder="500"
                    className="w-full rounded-xl border border-[#dcd0c7] bg-white py-3 pl-14 pr-4 text-sm text-[#2f241e] outline-none transition focus:border-[#b9825f] focus:ring-2 focus:ring-[#b9825f]/15"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-[#eee5df] pt-5 sm:flex-row">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#b9825f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#a9704e] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Service"
                      : "Save Service"}
                </button>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-[#d8c8bc] bg-white px-5 py-3 text-sm font-semibold text-[#8b5e3c] transition hover:bg-[#f7eee8] disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="mt-10">
          {loading ? (
            <div className="rounded-3xl border border-[#e4d9d0] bg-white px-6 py-20 text-center shadow-sm">
              <p className="text-sm text-[#75675f]">
                Loading your services...
              </p>
            </div>
          ) : services.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#d8c8bc] bg-white px-6 py-24 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5e9e0] text-[#9a6541]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-7 w-7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 7.5h15M6.75 4.5h10.5A2.25 2.25 0 0 1 19.5 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 17.25V6.75A2.25 2.25 0 0 1 6.75 4.5Z"
                  />
                  <path
                    strokeLinecap="round"
                    d="M8 11.5h8M8 15h5"
                  />
                </svg>
              </div>

              <h2 className="mt-4 text-xl font-bold text-[#2f241e]">
                No services yet
              </h2>

              <p className="mx-auto mt-3  text-sm leading-7 text-[#75675f]">
                Add your first service so customers know exactly what you
                can repair.
              </p>

              <button
                type="button"
                onClick={openAddForm}
                className="mt-6 rounded-xl bg-[#b9825f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#a9704e]"
              >
                Add Your First Service
              </button>
            </div>
          ) : (
            <div
  className={
    services.length === 1
      ? "grid grid-cols-1 gap-5"
      : "grid grid-cols-1 gap-5 md:grid-cols-2"
  }
>
              {services.map((service) => (
                <article
                  key={service.id}
                  className="w-full rounded-2xl border border-[#e4d9d0] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-7"
                >
                  <div className="flex items-start justify-between gap-5">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#b9825f]">
                        Repair Service
                      </p>

                      <h3 className="mt-2 text-xl font-bold text-[#2f241e]">
                        {service.name ||
                          service.service_name ||
                          "Unnamed Service"}
                      </h3>
                    </div>

                    <p className="shrink-0 text-right text-sm font-bold text-[#8b5e3c]">
                      {getServicePrice(service)}
                    </p>
                  </div>

                  <p className="mt-4 max-w-3xl text-sm leading-7 text-[#75675f]">
                    {service.description ||
                      "No service description provided."}
                  </p>

                  <div className="mt-6 flex gap-3 border-t border-[#eee5df] pt-5">
                    <button
                      type="button"
                      onClick={() => openEditForm(service)}
                      className="rounded-xl border border-[#d8c8bc] bg-white px-4 py-2.5 text-sm font-semibold text-[#8b5e3c] transition hover:bg-[#f7eee8]"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      disabled={deletingId === service.id}
                      onClick={() => handleDelete(service.id)}
                      className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === service.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <button
          type="button"
          onClick={() => navigate("/repairer/dashboard")}
          className="mt-8 text-sm font-medium text-[#8b5e3c] transition hover:text-[#6f452e]"
        >
          Back to Dashboard
        </button>
      </main>
    </div>
  );
}

export default RepairerServices;
