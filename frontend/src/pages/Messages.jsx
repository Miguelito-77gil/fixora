import { useParams, Link, useLocation } from "react-router-dom";
import ChatPanel from "@/features/chat/ChatPanel";

function Messages() {
  const { userId } = useParams();
  const location = useLocation();

  const backTo =
    location.state?.from === "repairer-dashboard"
      ? "/repairer/dashboard"
      : "/repairers";

  const backLabel =
    location.state?.from === "repairer-dashboard"
      ? "Back to dashboard"
      : "Back to repairers";

  return (
    <section className="fixora-container py-8 sm:py-12">
      <div className="mx-auto max-w-6xl">

        <div className="mb-5">
          <Link
  to={backTo}
  aria-label={backLabel}
  title={backLabel}
  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d8c8bc] bg-white text-[#8b5e3c] transition hover:bg-[#f7eee8]"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 18l-6-6 6-6"
    />
  </svg>
</Link>

          <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-[#b9825f]">
            Messaging
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#17202a] sm:text-4xl">
            Your Messages
          </h1>

          <p className="mt-2 text-sm text-[#777f86]">
            Chat directly with customers and repairers.
          </p>
        </div>

        <ChatPanel initialUserId={userId} />

      </div>
    </section>
  );
}

export default Messages;



