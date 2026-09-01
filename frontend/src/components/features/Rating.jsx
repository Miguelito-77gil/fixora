function Rating({ rating, reviews }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-semibold text-[#26313b]">
        <span className="text-[#c98b27]" aria-hidden="true">
          &#9733;
        </span>{" "}
        {rating}
      </span>

      {reviews !== undefined && (
        <span className="text-[#90979d]">
          ({reviews} reviews)
        </span>
      )}
    </div>
  );
}

export default Rating;
