import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

function Button({
  children,
  to,
  variant = "primary",
  className,
  type = "button",
  ...props
}) {
  const styles = cn(
    "inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition",
    "focus:outline-none focus:ring-2 focus:ring-[#b9825f]/30",
    {
      "bg-[#b9825f] text-white hover:bg-[#a9704e]":
        variant === "primary",
      "border border-[#ddd7d0] bg-white text-[#26313b] hover:bg-[#f5f2ee]":
        variant === "secondary",
      "border border-[#ddd7d0] bg-transparent text-[#26313b] hover:bg-white":
        variant === "outline",
      "text-[#7a5138] hover:text-[#523624]":
        variant === "ghost",
    },
    className
  );

  if (to) {
    return (
      <Link to={to} className={styles} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={styles} {...props}>
      {children}
    </button>
  );
}

export default Button;