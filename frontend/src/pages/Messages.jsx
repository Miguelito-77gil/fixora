import { useParams } from "react-router-dom";
import ChatPanel from "@/features/chat/ChatPanel";

function Messages() {
  const { userId } = useParams();

  return (
    <section className="min-h-full bg-[#f8f5f2] text-[#17202a]">
      <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8 sm:py-12 lg:px-10">

        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b9825f]">
            Messaging
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-[#17202a] sm:text-4xl">
            Your Messages
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#777f86]">
            Chat directly with customers and repairers.
          </p>
        </div>

        <ChatPanel initialUserId={userId} />

      </div>
    </section>
  );
}

export default Messages;