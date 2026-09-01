function ReviewCard({ review }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

      <div className="flex items-start justify-between gap-4">

        <div>
          <p className="font-semibold text-white">
            {review.customer}
          </p>

          <div className="mt-1 text-sm tracking-wide text-yellow-400">
            {"★".repeat(review.rating)}
            <span className="text-slate-700">
              {"★".repeat(5 - review.rating)}
            </span>
          </div>
        </div>

        <span className="text-xs text-slate-600">
          {review.date}
        </span>

      </div>

      <p className="mt-4 text-sm leading-7 text-slate-400">
        "{review.comment}"
      </p>

    </article>
  );
}

export default ReviewCard;