"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Send, Search, User } from "lucide-react";
import { useMessages, useUsers } from "@/lib/hooks";
import { createDocument, serverTimestamp, orderBy } from "@/lib/firebase-service";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/Toast";

export default function MessagesPage() {
  const { profile } = useAuth();
  const { data: messages } = useMessages();
  const { data: users } = useUsers();
  const { toast } = useToast();

  const [selectedUser, setSelectedUser] = useState<string>("");
  const [newMsg, setNewMsg] = useState("");
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Get unique conversation partners
  const conversations = useMemo(() => {
    const map = new Map<string, Record<string, unknown>>();
    messages.forEach((m: Record<string, unknown>) => {
      const partnerId = m.senderId === profile?.uid ? m.receiverId : m.senderId;
      if (!map.has(partnerId as string)) {
        const user = users.find((u) => u.id === partnerId) as Record<string, unknown> | undefined;
        map.set(partnerId as string, {
          userId: partnerId,
          name: user ? String(user.displayName || "Unknown") : (m.senderName as string) || "Unknown",
          lastMessage: m.content,
          role: (user?.role as string) || "staff",
        });
      }
    });
    // Add all users who aren't in conversations yet
    users.filter((u) => u.id !== profile?.uid && !map.has(u.id))
      .forEach((u) => {
        const r = u as Record<string, unknown>;
        map.set(u.id, { userId: u.id, name: String(r.displayName || "Unknown"), lastMessage: "", role: r.role });
      });
    return Array.from(map.values());
  }, [messages, users, profile]);

  const filteredConversations = useMemo(() => {
    if (!search) return conversations;
    return conversations.filter((c) => (c.name as string).toLowerCase().includes(search.toLowerCase()));
  }, [conversations, search]);

  const activeMessages = useMemo(() => {
    if (!selectedUser) return [];
    return messages.filter((m: Record<string, unknown>) =>
      (m.senderId === profile?.uid && m.receiverId === selectedUser) ||
      (m.receiverId === profile?.uid && m.senderId === selectedUser)
    );
  }, [messages, selectedUser, profile]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  async function handleSend() {
    if (!newMsg.trim() || !selectedUser) return;
    try {
      await createDocument("messages", {
        senderId: profile?.uid || "",
        senderName: profile?.displayName || "",
        receiverId: selectedUser,
        content: newMsg.trim(),
        read: false,
        createdAt: serverTimestamp(),
      });
      setNewMsg("");
    } catch {
      toast("error", "Failed to send message");
    }
  }

  const selectedConvo = conversations.find((c) => c.userId === selectedUser);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Messages</h1><p className="text-muted text-sm">Internal messaging</p></div>

      <div className="bg-white rounded-xl border border-border flex h-[600px] overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 border-r border-border flex flex-col">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border text-xs outline-none" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((c) => (
              <button key={c.userId as string} onClick={() => setSelectedUser(c.userId as string)}
                className={`w-full text-left px-3 py-3 border-b border-border transition-colors ${selectedUser === c.userId ? "bg-primary/5" : "hover:bg-muted-light/50"}`}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                    {((c.name as string)?.[0] || "U").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{c.name as string}</div>
                    <div className="text-xs text-muted truncate">{(c.lastMessage as string) || "No messages"}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              <div className="px-4 py-3 border-b border-border">
                <div className="font-medium text-foreground">{selectedConvo?.name as string}</div>
                <div className="text-xs text-muted capitalize">{selectedConvo?.role as string}</div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeMessages.length === 0 && <p className="text-sm text-muted text-center py-8">No messages yet. Start the conversation!</p>}
                {activeMessages.map((m: Record<string, unknown>) => {
                  const isMine = m.senderId === profile?.uid;
                  return (
                    <div key={m.id as string} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-xl px-3 py-2 text-sm ${isMine ? "bg-primary text-white" : "bg-muted-light text-foreground"}`}>
                        {m.content as string}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <div className="px-4 py-3 border-t border-border">
                <div className="flex gap-2">
                  <input value={newMsg} onChange={(e) => setNewMsg(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type a message..." className="flex-1 px-3 py-2 rounded-lg border border-border text-sm outline-none" />
                  <button onClick={handleSend} disabled={!newMsg.trim()} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted">Select a conversation to start messaging</div>
          )}
        </div>
      </div>
    </div>
  );
}
