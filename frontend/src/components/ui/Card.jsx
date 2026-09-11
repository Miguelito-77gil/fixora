import { cn } from "@/lib/utils";

function Card({ children, className }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#e5e0da] bg-white",
        className
      )}
    >
      {children}
    </div>
  );
}

export default Card;
