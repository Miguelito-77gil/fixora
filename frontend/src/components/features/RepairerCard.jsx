import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import VerificationBadge from "@/components/features/VerificationBadge";
import Rating from "@/components/features/Rating";
import {
  toggleFavorite,
  fetchFavorites,
} from "@/services/marketplaceService";

const API_URL = import.meta.env.VITE_API_URL || "https://fixora-backend-kw9p.onrender.com";

function RepairerCard({ repairer }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadFavorite() {
      try {
        const favorites = await fetchFavorites();

        const exists = favorites.some(
          (item) =>
            String(item.repairer_id ?? item.repairer?.id) ===
            String(repairer.id)
        );

        if (mounted) {
          setIsFavorite(exists);
        }
      } catch {
        // User may not be logged in.
      }
    }

    loadFavorite();

    return () => {
      mounted = false;
    };
  }, [repairer.id]);

  async function handleFavorite() {
    if (favoriteLoading) return;

    setFavoriteLoading(true);

    try {
      const result = await toggleFavorite(repairer.id);

      if (result?.favorited !== undefined) {
        setIsFavorite(Boolean(result.favorited));
      } else {
        setIsFavorite((current) => !current);
      }
    } catch (error) {
      console.error("Favorite error:", error);
    } finally {
      setFavoriteLoading(false);
    }
  }

  function getPhotoUrl() {
    const photo =
      repairer?.repairer_profile?.photo_url ||
      repairer?.repairer_profile?.photo ||
      repairer?.photo_url ||
      repairer?.profile_photo ||
      repairer?.photo;

    if (!photo) {
      return null;
    }

    const value = String(photo).trim();

    if (!value) {
      return null;
    }

    if (
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("data:")
    ) {
      return value;
    }

    if (value.startsWith("/storage/")) {
      return `${API_URL}${value}`;
    }

    if (value.startsWith("storage/")) {
      return `${API_URL}/${value}`;
    }

    if (value.startsWith("/")) {
      return `${API_URL}${value}`;
    }

    return `${API_URL}/storage/${value}`;
  }

  const photoUrl = getPhotoUrl();

  return (
    <Card className="overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5">
      <div className="h-40 bg-[#eee9e3]">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={`${repairer.name} profile`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#efe7df] to-[#dcd5cd]">
            <span className="text-5xl font-bold text-[#9b806a]">
              {repairer.initials}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-[#17202a]">
                {repairer.name}
              </h3>

              <VerificationBadge verified={repairer.verified} />
            </div>

            <p className="mt-1 text-sm text-[#777f86]">
              {repairer.category}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {repairer.available && (
              <span className="whitespace-nowrap text-xs font-medium text-[#2b8052]">
                Available
              </span>
            )}

            <button
              type="button"
              onClick={handleFavorite}
              disabled={favoriteLoading}
              aria-label={
                isFavorite
                  ? "Remove from favorites"
                  : "Add to favorites"
              }
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ddd6ce] bg-white text-xl text-[#9b806a] transition hover:bg-[#f5f1ed] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isFavorite ? "\u2665" : "\u2661"}
            </button>
          </div>
        </div>

        <div className="mt-3">
          <Rating
            rating={repairer.rating}
            reviews={repairer.reviews}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-[#777f86]">
            {repairer.repairs} repairs
          </span>

          <span className="font-medium text-[#26313b]">
            From P{repairer.price}
          </span>
        </div>

        <p className="mt-2 text-sm text-[#777f86]">
          {repairer.location}
        </p>

        <Button
          to={`/repairers/${repairer.id}`}
          variant="secondary"
          className="mt-3 w-full"
        >
          View profile
        </Button>
      </div>
    </Card>
  );
}

export default RepairerCard;


