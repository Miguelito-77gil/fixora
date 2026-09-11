function SectionHeading({ eyebrow, title, description, align = "left" }) {
  return (
    <div
      className={
        align === "center"
          ? "mx-auto max-w-2xl text-center"
          : "max-w-2xl"
      }
    >
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b9825f]">
          {eyebrow}
        </p>
      )}

      <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#17202a] sm:text-4xl">
        {title}
      </h2>

      {description && (
        <p className="mt-4 text-base leading-7 text-[#68727c]">
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeading;
