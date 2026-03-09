"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useRealtimeCollection } from "@/lib/hooks";
import { createDocument, serverTimestamp, where, orderBy } from "@/lib/firebase-service";
import { useToast } from "@/components/ui/Toast";
import { Send, Search } from "lucide-react";

export default function PortalMessagesPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const userId = profile?.uid || "";
  const { data: users } = useRealtimeCollection("users");
  const [selectedUser, setSelectedUser] = useState("");
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const chatId = [userId, selectedUser].sort().join("_");
  const { data: messages } = useRealtimeCollection(
    "messages",
    selectedUser ? [where("chatId", "==", chatId), orderBy("createdAt", "asc")] : undefined
  );

  // Show only staff/attorneys (non-clients) as contacts for the client
  const contacts = users.filter((u: any) => u.id !== userId && u.role !== "client");
  const filteredContacts = contacts.filter((u: any) => !search || u.displayName?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function handleSend() {
    if (!text.trim() || !selectedUser) return;
    try {
      await createDocument("messages", {
        chatId, senderId: userId, receiverId: selectedUser,
        text: text.trim(), createdAt: serverTimestamp(),
        senderName: profile?.displayName || profile?.email,
      });
      setText("");
    } catch { toast("error", "Failed to send"); }
  }

  function handleKeyDown(e: React.KeyboardEvent) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }
  const getInitials = (name: string) => name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  const selectedProfile = contacts.find((u: any) => u.id === selectedUser) as Record<string, any> | undefined;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Messages</h1><p className="text-muted text-sm">Secure communication with your legal team</p></div>

      <div className="bg-white rounded-xl border border-border overflow-hidden flex flex-col lg:flex-row" style={{ minHeight: "600px" }}>
        <div className="lg:w-80 border-b lg:border-b-0 lg:border-r border-border flex flex-col shrink-0">
          <div className="p-3 border-b border-border"><div className="relative"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border text-sm outline-none" /></div></div>
          <div className="flex-1 overflow-y-auto">
            {filteredContacts.map((u: any) => (
              <button key={u.id} onClick={() => setSelectedUser(u.id)} className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-muted-light/50 transition-colors ${selectedUser === u.id ? "bg-primary/5 border-r-2 border-primary" : ""}`}>
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">{getInitials(u.displayName || u.email)}</div>
                <div className="min-w-0"><div className="text-sm font-medium text-foreground truncate">{u.displayName || u.email}</div><div className="text-xs text-muted capitalize">{u.role || "staff"}</div></div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {!selectedUser ? (
            <div className="flex-1 flex items-center justify-center text-muted text-sm">Select a conversation to start messaging</div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-border flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{getInitials(selectedProfile?.displayName || "")}</div>
                <div><div className="text-sm font-semibold text-foreground">{selectedProfile?.displayName || selectedProfile?.email}</div><div className="text-xs text-muted capitalize">{selectedProfile?.role}</div></div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && <p className="text-center text-muted text-sm">No messages yet. Start the conversation!</p>}
                {messages.map((m: any) => {
                  const isMine = m.senderId === userId;
                  return (
                    <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] px-3 py-2 rounded-xl text-sm ${isMine ? "bg-primary text-white rounded-br-sm" : "bg-muted-light text-foreground rounded-bl-sm"}`}>
                        {m.text}
                        <div className={`text-[10px] mt-1 ${isMine ? "text-white/60" : "text-muted"}`}>
                          {m.createdAt?.toDate ? new Date(m.createdAt.toDate()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <div className="p-3 border-t border-border">
                <div className="flex gap-2">
                  <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type a message..." className="flex-1 px-3 py-2 rounded-lg border border-border text-sm outline-none" />
                  <button onClick={handleSend} disabled={!text.trim()} className="p-2 bg-primary text-white rounded-lg hover:bg-primary-light disabled:opacity-50"><Send size={18} /></button>
                </div>
                <p className="text-xs text-muted mt-2">All messages are encrypted and stored securely.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
