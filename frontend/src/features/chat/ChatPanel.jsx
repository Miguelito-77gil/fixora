const API_URL = import.meta.env.VITE_API_URL || "https://fixora-backend-kw9p.onrender.com";

import { useEffect, useState } from "react";
import {
  fetchChatUsers,
  fetchMessages,
  sendMessage,
} from "@/services/marketplaceService";
import { fetchRepairerById } from "@/services/repairerService";

function mediaUrl(path) {
  if (!path) return "";

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_URL}${path}`;
}

function getInitials(name) {
  return String(name || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function ChatPanel({ initialUserId = null }) {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  async function loadUsers() {
    try {
      const data = await fetchChatUsers();

      const list =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.users)
              ? data.users
              : Array.isArray(data?.conversations)
                ? data.conversations
                : [];

      // Do not wipe the existing conversation list if a polling request
      // temporarily returns an empty response.
      setUsers((current) => {
        if (list.length === 0 && current.length > 0) {
          return current;
        }

        const merged = [...list];

        current.forEach((oldUser) => {
          if (
            oldUser?.id &&
            !merged.some(
              (user) => String(user.id) === String(oldUser.id)
            )
          ) {
            merged.push(oldUser);
          }
        });

        return merged;
      });

      if (initialUserId) {
        const existing = list.find(
          (user) => String(user.id) === String(initialUserId)
        );

        if (existing) {
          setSelected(existing);
        } else {
          try {
            const repairer = await fetchRepairerById(initialUserId);

            if (repairer) {
              setSelected({
                id: repairer.id,
                name: repairer.name,
                role: repairer.role || "repairer",
                photo_url: repairer.photo_url || null,
              });
            }
          } catch {
            // Target may not be a repairer.
          }
        }
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(userId) {
    if (!userId) return;

    try {
      const data = await fetchMessages(userId);
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load messages:", error);
      setMessages([]);
    }
  }

  useEffect(() => {
    loadUsers();
  }, [initialUserId]);

  useEffect(() => {
    if (!selected?.id) return;

    loadMessages(selected.id);

    const interval = setInterval(() => {
      loadMessages(selected.id);
      loadUsers();
    }, 3000);

    return () => clearInterval(interval);
  }, [selected?.id]);

  async function handleSend(event) {
    event.preventDefault();

    if (!selected?.id || !text.trim() || sending) {
      return;
    }

    const message = text.trim();

    setSending(true);
    setText("");

    try {
      await sendMessage(selected.id, message);

      await loadMessages(selected.id);
      await loadUsers();
    } catch (error) {
      console.error("Failed to send message:", error);
      setText(message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid min-h-[620px] overflow-hidden rounded-3xl border border-[#e4ded7] bg-white shadow-sm md:grid-cols-[280px_1fr]">

      {/* CONVERSATIONS */}
      <aside className="border-b border-[#e4ded7] md:border-b-0 md:border-r">

        <div className="border-b border-[#e4ded7] px-5 py-4">
          <h2 className="font-bold text-[#17202a]">
            Conversations
          </h2>

          <p className="mt-1 text-xs text-[#90979d]">
            Your recent messages
          </p>
        </div>

        <div className="max-h-[540px] overflow-y-auto">

          {loading ? (
            <p className="p-5 text-sm text-[#75675f]">
              Loading conversations...
            </p>
          ) : users.length === 0 && !selected ? (
            <div className="p-5">
              <p className="text-sm font-semibold text-[#26313b]">
                No conversations yet.
              </p>

              <p className="mt-2 text-xs leading-5 text-[#90979d]">
                Open a repairer profile and send your first message.
              </p>
            </div>
          ) : (
            <>
              {selected &&
                !users.some(
                  (user) => String(user.id) === String(selected.id)
                ) && (
                  <button
                    type="button"
                    onClick={() => setSelected(selected)}
                    className="w-full border-b border-[#eee9e4] bg-[#f7f3ef] px-5 py-4 text-left"
                  >
                    <p className="font-semibold text-[#26313b]">
                      {selected.name}
                    </p>

                    <p className="mt-1 text-xs capitalize text-[#90979d]">
                      {selected.role || "repairer"}
                    </p>
                  </button>
                )}

              {users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => setSelected(user)}
                  className={`w-full border-b border-[#eee9e4] px-5 py-4 text-left transition ${
                    String(selected?.id) === String(user.id)
                      ? "bg-[#f7f3ef]"
                      : "hover:bg-[#faf9f7]"
                  }`}
                >
                  <p className="font-semibold text-[#26313b]">
                    {user.name}
                  </p>

                  <p className="mt-1 text-xs capitalize text-[#90979d]">
                    {user.role || "user"}
                  </p>
                </button>
              ))}
            </>
          )}

        </div>
      </aside>

      {/* CHAT */}
      <section className="flex min-h-[620px] flex-col">

        {!selected ? (
          <div className="flex flex-1 items-center justify-center p-8 text-center">
            <div className="max-w-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f3ebe4] text-2xl text-[#b9825f]">
                &#9993;
              </div>

              <h3 className="mt-5 text-xl font-bold text-[#26313b]">
                Select a conversation
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#75675f]">
                Choose someone from your conversations to start chatting.
              </p>

            </div>
          </div>
        ) : (
          <>

            {/* CHAT HEADER */}
            <div className="flex items-center gap-3 border-b border-[#e4ded7] bg-white px-5 py-4">

              {selected.photo_url ? (
                <img
                  src={mediaUrl(selected.photo_url)}
                  alt={selected.name || "User"}
                  className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-[#f3ebe4]"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eee7df] font-bold text-[#9b806a]">
                  {getInitials(selected.name)}
                </div>
              )}

              <div>
                <p className="font-bold text-[#17202a]">
                  {selected.name}
                </p>

                <p className="text-xs capitalize text-[#90979d]">
                  {selected.role || "user"}
                </p>
              </div>

            </div>

            {/* MESSAGES */}
            <div className="flex-1 space-y-3 overflow-y-auto bg-[#faf9f7] p-5">

              {messages.length === 0 ? (
                <div className="flex h-full min-h-[430px] items-center justify-center text-center">

                  <div>
                    <p className="font-semibold text-[#26313b]">
                      Start the conversation
                    </p>

                    <p className="mt-2 text-sm text-[#90979d]">
                      Send a message to {selected.name}.
                    </p>
                  </div>

                </div>
              ) : (
                messages.map((message) => {
                  const mine =
                    String(message.sender_id) !==
                    String(selected.id);

                  return (
                    <div
                      key={message.id}
                      className={`flex ${
                        mine ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                          mine
                            ? "rounded-br-md bg-[#b9825f] text-white shadow-sm hover:bg-[#a9714f]"
                            : "rounded-bl-md border border-[#e5ddd5] bg-white text-[#26313b] shadow-sm"
                        }`}
                      >
                        {message.message}

                        {message.created_at && (
                          <p
                            className={`mt-1 text-[10px] ${
                              mine
                                ? "text-white/70"
                                : "text-[#a09a94]"
                            }`}
                          >
                            {new Date(
                              message.created_at
                            ).toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

            </div>

            {/* INPUT */}
            <form
              onSubmit={handleSend}
              className="border-t border-[#e4ded7] bg-white p-4"
            >
              <div className="flex gap-2">

                <input
                  value={text}
                  onChange={(event) =>
                    setText(event.target.value)
                  }
                  placeholder={`Message ${selected.name}...`}
                  disabled={sending}
                  className="min-w-0 flex-1 rounded-xl border border-[#ddd7d0] bg-[#faf9f7] px-4 py-3 text-sm text-[#26313b] outline-none transition placeholder:text-[#a29b94] focus:border-[#b9825f] focus:bg-white disabled:opacity-60"
                />

                <button
                  type="submit"
                  disabled={sending || !text.trim()}
                  className="rounded-xl bg-[#b9825f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#a66f4f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending ? "Sending..." : "Send"}
                </button>

              </div>
            </form>

          </>
        )}

      </section>

    </div>
  );
}

export default ChatPanel;


