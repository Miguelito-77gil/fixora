import { useEffect, useState } from "react";
import {
  fetchFavorites,
  toggleFavorite,
} from "@/services/marketplaceService";

function FavoriteButton({ repairerId }) {
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFavorites()
      .then((ids) => setFavorite(ids.includes(repairerId)))
      .catch(() => {});
  }, [repairerId]);

  async function handleToggle() {
    setLoading(true);

    try {
      const result = await toggleFavorite(repairerId);
      setFavorite(result.favorited);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd7d0] bg-white text-lg transition hover:border-[#b9825f] hover:bg-[#f7f3ef]"
    >
      {favorite ? "♥" : "♡"}
    </button>
  );
}

export default FavoriteButton;

