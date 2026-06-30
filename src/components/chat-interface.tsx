"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { api, API_URL } from "@/lib/api";
import { 
  ChatTeardropText, Plus, Trash, PaperPlaneRight, ShieldCheck, 
  Quotes, Sparkle, BookmarkSimple, X
} from "@phosphor-icons/react";
import ConfirmDialog from "@/components/confirm-dialog";
import CreateRoomDialog from "@/components/create-room-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  citations?: Citation[];
}

interface Citation {
  sender: string;
  content: string;
  groupName: string;
  date: string;
  category: string;
}

interface ChatRoom {
  id: string;
  name: string;
  messages: Message[];
}


export default function ChatInterface() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);

  // Dialog control states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [roomToDeleteId, setRoomToDeleteId] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load from Backend on mount
  useEffect(() => {
    async function initUser() {
      try {
        let storedUserId = localStorage.getItem("nephroaid_user_id");
        if (!storedUserId) {
          // In a real app, we'd redirect to login, but for now we just handle it
          console.error("No user ID found in local storage");
          setIsLoading(false);
          return;
        }
        setUserId(storedUserId);

        const sessions = await api.listSessions(storedUserId);
        if (sessions.length === 0) {
          // Create initial room
          const defaultSession = await api.createSession(storedUserId, "Panduan Diet & Makanan Kalium");
          await api.addMessage(defaultSession.id, "assistant", "Halo! Saya NephroAid, asisten virtual berbasis RAG komunitas. Saya siap membantu menjawab pertanyaan Anda seputar keseharian Gagal Ginjal Kronis (GGK). Silakan tanyakan hal-seperti pantangan makanan (Pisang, Air Kelapa), cara mengatasi kram hemodialisis, atau tips mengontrol asupan cairan.");
          
          const updatedSessions = await api.listSessions(storedUserId);
          const messages = await api.listMessages(updatedSessions[0].id);
          
          setRooms([{ id: updatedSessions[0].id, name: updatedSessions[0].name, messages: messages.map(m => ({ id: m.id, role: m.role as "user" | "assistant", content: m.content, timestamp: new Date(m.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) })) }]);
          setActiveRoomId(updatedSessions[0].id);
        } else {
          // load all rooms and their messages
          const roomsData: ChatRoom[] = await Promise.all(sessions.map(async (s) => {
            const msgs = await api.listMessages(s.id);
            return {
              id: s.id,
              name: s.name,
              messages: msgs.map(m => ({
                id: m.id,
                role: m.role as "user" | "assistant",
                content: m.content,
                timestamp: new Date(m.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
              }))
            };
          }));
          setRooms(roomsData);
          if (roomsData.length > 0) setActiveRoomId(roomsData[0].id);
        }
      } catch (err) {
        console.error("Failed to initialize user or sessions", err);
      } finally {
        setIsLoading(false);
      }
    }
    initUser();
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [rooms, activeRoomId]);

  const handleCreateRoom = async (name: string) => {
    if (!userId) return;
    try {
      const session = await api.createSession(userId, name);
      const welcomeMsg = await api.addMessage(session.id, "assistant", `Selamat datang di sesi "${name}". Saya NephroAid, asisten RAG Anda. Silakan tanyakan hal-hal terkait penanganan medis GGK.`);
      
      const newRoom: ChatRoom = {
        id: session.id,
        name: session.name,
        messages: [
          {
            id: welcomeMsg.id,
            role: "assistant",
            content: welcomeMsg.content,
            timestamp: new Date(welcomeMsg.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
          }
        ]
      };
      setRooms([newRoom, ...rooms]);
      setActiveRoomId(newRoom.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRoomClick = (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (rooms.length === 1) {
      alert("Anda harus mempertahankan minimal satu sesi diskusi.");
      return;
    }
    setRoomToDeleteId(roomId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteRoom = async () => {
    if (roomToDeleteId) {
      try {
        await api.deleteSession(roomToDeleteId);
        const nextRooms = rooms.filter((r) => r.id !== roomToDeleteId);
        setRooms(nextRooms);
        if (activeRoomId === roomToDeleteId && nextRooms.length > 0) {
          setActiveRoomId(nextRooms[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setRoomToDeleteId(null);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !userId) return;

    const activeRoom = rooms.find((r) => r.id === activeRoomId);
    if (!activeRoom) return;

    const query = input.toLowerCase();
    const currentInput = input;
    setInput("");
    setIsTyping(true);

    try {
      // 1. Post User Message to DB
      const dbUserMsg = await api.addMessage(activeRoomId, "user", currentInput);
      const userMessage: Message = {
        id: dbUserMsg.id,
        role: "user",
        content: dbUserMsg.content,
        timestamp: new Date(dbUserMsg.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      };

      // Optimistically update UI for user message
      setRooms((prevRooms) => prevRooms.map((r) => {
        if (r.id === activeRoomId) return { ...r, messages: [...r.messages, userMessage] };
        return r;
      }));

      // 2. Stream RAG Backend Processing
      const token = localStorage.getItem("nephroaid_token");
      const res = await fetch(`${API_URL}/api/rag/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          session_id: activeRoomId,
          message: currentInput
        })
      });

      if (!res.body) throw new Error("No body from stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
      let assistantMsgId = "temp-" + Date.now();
      let assistantContent = "";
      let citations: Citation[] = [];

      // Add placeholder message
      setRooms((prevRooms) => prevRooms.map(r => {
        if (r.id === activeRoomId) {
          return { ...r, messages: [...r.messages, {
            id: assistantMsgId, role: "assistant", content: "", timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }), citations: []
          }]};
        }
        return r;
      }));
      
      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";
        
        for (const block of lines) {
           const eventMatch = block.match(/event: (.*)\n/);
           const dataMatch = block.match(/data: (.*)/);
           if (eventMatch && dataMatch) {
             const event = eventMatch[1].trim();
             const data = JSON.parse(dataMatch[1].trim());
             
             if (event === "sources") {
                citations = data.map((c: any) => ({
                   sender: "Pengetahuan Komunitas",
                   content: c.content,
                   groupName: "Arsip",
                   date: c.timestamp ? new Date(c.timestamp).toLocaleDateString("id-ID") : new Date().toLocaleDateString("id-ID"),
                   category: "Umum"
                }));
             } else if (event === "message") {
                assistantContent += data.chunk;
                setRooms(prev => prev.map(r => {
                   if (r.id === activeRoomId) {
                      return { ...r, messages: r.messages.map(m => m.id === assistantMsgId ? { ...m, content: assistantContent, citations } : m) };
                   }
                   return r;
                }));
             } else if (event === "done") {
                setIsTyping(false);
             } else if (event === "error") {
                console.error("Stream error:", data.error);
                setIsTyping(false);
             }
           }
        }
      }
      setIsTyping(false);

    } catch (err) {
      console.error(err);
      setIsTyping(false);
    }
  };

  const activeRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0];

  return (
    <div className="absolute inset-0 flex flex-col md:flex-row bg-card/60 backdrop-blur-2xl rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.04)] overflow-hidden">
      
      {/* Rooms Sidebar */}
      <div className="w-full md:w-[280px] shrink-0 border-b md:border-b-0 md:border-r border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] flex flex-col min-h-[120px] md:min-h-0">
        <div className="p-5 md:p-6 flex items-center justify-between">
          <h3 className="font-heading font-medium text-sm text-foreground">Sesi Diskusi</h3>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 hover:bg-primary hover:text-primary-foreground text-muted-foreground flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-90"
          >
            <Plus weight="bold" className="w-4 h-4" />
          </button>
        </div>

        {/* Room List */}
        <div className="flex-1 overflow-y-auto px-4 md:px-5 pb-4 space-y-1.5 scrollbar-thin">
          {rooms.map((room) => (
            <div
              key={room.id}
              onClick={() => setActiveRoomId(room.id)}
              className={`group relative flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                activeRoomId === room.id
                  ? "bg-card shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                  : "hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeRoomId === room.id ? "bg-primary/10 text-primary" : "bg-black/5 dark:bg-white/5 text-muted-foreground"}`}>
                  <ChatTeardropText weight={activeRoomId === room.id ? "fill" : "light"} className="w-4 h-4" />
                </div>
                <span className={`text-xs truncate font-medium ${activeRoomId === room.id ? "text-foreground" : "text-muted-foreground"}`}>
                  {room.name}
                </span>
              </div>
              <button
                onClick={(e) => handleDeleteRoomClick(room.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all duration-300 active:scale-90"
              >
                <Trash weight="fill" className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>


      </div>

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        
        {/* Messages Stream */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-thin">
          <AnimatePresence initial={false}>
            {activeRoom?.messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className={`flex flex-col max-w-[85%] ${
                  msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                {/* Message Bubble */}
                <div
                  className={`p-5 rounded-3xl shadow-sm text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-foreground text-background rounded-tr-sm"
                      : "bg-card border border-black/5 dark:border-white/5 rounded-tl-sm shadow-[0_4px_16px_rgba(0,0,0,0.02)]"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  
                  <div className={`flex items-center justify-end mt-3 text-[10px] font-mono ${msg.role === "user" ? "text-background/60" : "text-muted-foreground"}`}>
                    {msg.timestamp}
                  </div>
                </div>

                {/* Citations Indicator for Assistant Messages */}
                {msg.role === "assistant" && msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 items-center">
                    {msg.citations.map((cit, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedCitation(cit)}
                        className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95"
                      >
                        <Quotes weight="fill" className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-[10px] font-mono font-medium text-muted-foreground group-hover:text-primary transition-colors">
                          {cit.sender.split(" ")[0]} ({cit.date.split(" ")[0]} {cit.date.split(" ")[1]})
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mr-auto items-start flex flex-col max-w-[80%]">
              <div className="bg-card p-5 rounded-3xl rounded-tl-sm border border-black/5 dark:border-white/5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex items-center gap-3">
                <div className="flex gap-1.5">
                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-primary/40 rounded-full" />
                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary/60 rounded-full" />
                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Retrieving...</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Form with Double-Bezel and Magnetic Button */}
        <div className="p-4 md:p-6 bg-transparent">
          <div className="p-1.5 bg-card/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.06)] flex items-center gap-2 relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pertanyaan untuk RAG..."
              className="flex-1 bg-transparent border-none focus:ring-0 px-5 text-sm h-12 outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e as any);
                }
              }}
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleSendMessage}
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/20 hover:scale-105 transition-transform"
            >
              <PaperPlaneRight weight="fill" className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

      </div>

      {/* Dialogs */}
      <CreateRoomDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onConfirm={handleCreateRoom}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Hapus Sesi Diskusi"
        description="Apakah Anda yakin ingin menghapus sesi diskusi ini? Semua riwayat obrolan dalam room ini akan hilang selamanya."
        confirmText="Hapus"
        onConfirm={confirmDeleteRoom}
        isDestructive={true}
      />

      {/* WhatsApp Citation View Dialog */}
      <Dialog open={!!selectedCitation} onOpenChange={(open) => !open && setSelectedCitation(null)}>
        <DialogContent className="sm:max-w-[480px] rounded-[2rem] overflow-hidden p-0 gap-0 border border-black/5 dark:border-white/10 shadow-[0_16px_64px_rgba(0,0,0,0.12)] [&>button]:hidden">
          {selectedCitation && (
            <>
              {/* Citation Header */}
              <div className="p-5 md:p-6 bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-between border-b border-emerald-500/10">
                <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-500">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                    <Quotes weight="fill" className="w-5 h-5" />
                  </div>
                  <div>
                    <DialogTitle className="font-heading font-medium text-base">Verifikasi Arsip RAG</DialogTitle>
                    <span className="text-[10px] font-mono uppercase tracking-widest opacity-80 mt-1 block">
                      Kutipan WhatsApp
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedCitation(null)} className="w-8 h-8 flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 transition-colors">
                  <X weight="bold" className="w-4 h-4" />
                </button>
              </div>
              
              <DialogDescription className="sr-only">Referensi kutipan WhatsApp untuk jawaban asisten.</DialogDescription>

              {/* WA Mock Message Bubble */}
              <div className="p-6 bg-card space-y-6">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                    <BookmarkSimple weight="fill" className="w-3 h-3 text-emerald-500" />
                    <span>GRUP: {selectedCitation.groupName}</span>
                  </div>
                  
                  <div className="p-5 bg-black/[0.02] dark:bg-white/[0.02] rounded-3xl border border-black/5 dark:border-white/5 relative">
                    <div className="flex justify-between items-baseline mb-3 border-b border-black/5 dark:border-white/5 pb-3">
                      <span className="text-sm font-medium text-emerald-600 dark:text-emerald-500">
                        {selectedCitation.sender}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {selectedCitation.date}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground italic">
                      &quot;{selectedCitation.content}&quot;
                    </p>
                  </div>
                </div>
                
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-3">
                  <ShieldCheck weight="duotone" className="w-6 h-6 text-primary shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong>Edukasi Terverifikasi:</strong> Kutipan ini diekstrak dari arsip grup WhatsApp yang dikurasi oleh pasien senior atau tenaga kesehatan. Identitas pasien lain dianonimkan untuk menjaga privasi.
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
