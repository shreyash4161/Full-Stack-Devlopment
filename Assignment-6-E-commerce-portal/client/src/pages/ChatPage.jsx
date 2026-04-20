import { SendHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";
import { api, getErrorMessage } from "../lib/api";
import { timeAgo } from "../lib/utils";

const socket = io("/", { autoConnect: false });

export default function ChatPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!user) return;

    socket.connect();
    socket.on("chat:message", (message) => {
      setMessages((current) => [...current, message]);
    });

    return () => {
      socket.off("chat:message");
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const fetchInbox = async () => {
      try {
        const { data } = await api.get("/api/chat/inbox");
        setConversations(data.conversations || []);
      } catch (error) {
        toast.error(getErrorMessage(error, "Unable to load your messages."));
      }
    };

    fetchInbox();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const listingId = searchParams.get("listingId");
    if (!listingId) return;

    void loadRoom(listingId, {
      seller: searchParams.get("seller"),
      buyer: searchParams.get("buyer")
    });
  }, [searchParams, user]);

  const loadRoom = async (listingId, params = {}) => {
    try {
      const { data } = await api.get(`/api/chat/room/${listingId}`, { params });
      setActiveRoom(data.activeRoom);
      setMessages(data.roomMessages || []);
      if (data.activeRoom?.roomId) {
        socket.emit("chat:join", data.activeRoom.roomId);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to open chat room."));
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!activeRoom?.roomId || !draft.trim()) return;

    try {
      const { data } = await api.post("/api/chat/message", {
        roomId: activeRoom.roomId,
        listingId: activeRoom.listing._id,
        receiverId: activeRoom.partner?._id,
        content: draft
      });
      setMessages((current) => [...current, data.data]);
      setDraft("");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to send message."));
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <aside className="rounded-[36px] border border-white/60 bg-white/72 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-600">Inbox</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">Chats with buyers and sellers</h1>
        <div className="mt-6 space-y-3">
          {conversations.map((conversation) => (
            <button
              key={conversation._id}
              type="button"
              onClick={() =>
                void loadRoom(conversation.listing?._id, {
                  seller: conversation.sellerId,
                  buyer: conversation.buyerId
                })
              }
              className="w-full rounded-[24px] border border-white/70 bg-white/85 p-4 text-left dark:border-white/10 dark:bg-slate-900/70"
            >
              <p className="font-semibold text-slate-900 dark:text-white">{conversation.partnerName}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{conversation.listing?.title}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.24em] text-slate-400">{timeAgo(conversation.createdAt)}</p>
            </button>
          ))}
        </div>
      </aside>

      <section className="flex min-h-[680px] flex-col rounded-[36px] border border-white/60 bg-white/72 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60">
        <div className="border-b border-white/60 pb-4 dark:border-white/10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Active conversation</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
            {activeRoom?.listing?.title || "Choose a conversation"}
          </h2>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto py-5">
          {messages.map((message) => {
            const isMine = String(message.sender?._id || message.sender) === String(user?._id);
            return (
              <div
                key={message._id}
                className={`max-w-[78%] rounded-[26px] px-5 py-4 ${
                  isMine
                    ? "ml-auto bg-gradient-to-r from-teal-500 to-sky-500 text-white"
                    : "border border-white/70 bg-white/85 text-slate-900 dark:border-white/10 dark:bg-slate-900/70 dark:text-white"
                }`}
              >
                <p className="text-sm font-semibold">{message.sender?.name || (isMine ? "You" : "User")}</p>
                <p className="mt-2 text-sm leading-6">{message.content}</p>
              </div>
            );
          })}
        </div>

        <form onSubmit={sendMessage} className="mt-4 flex items-center gap-3 rounded-full border border-white/60 bg-white/85 px-4 py-3 dark:border-white/10 dark:bg-slate-900/70">
          <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write your message..." className="w-full bg-transparent text-sm outline-none" />
          <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white">
            <SendHorizontal className="size-4" />
            Send
          </button>
        </form>
      </section>
    </div>
  );
}
