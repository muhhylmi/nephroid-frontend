"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
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

const CITATIONS_DB: Record<string, Citation[]> = {
  kalium: [
    {
      sender: "dr. Andi (Sp.PD-KGH)",
      content: "Hati-hati ya bapak ibu anggota grup, pisang itu tinggi kalium sekali. Kemarin ada pasien masuk IGD karena sesak dan jantung berdebar kencang setelah makan pisang ambon 2 buah berturut-turut. Batasi betul kalau mau buah, lebih aman apel atau pir kupas.",
      groupName: "Grup Sehat Ginjal Kita",
      date: "14 Feb 2026",
      category: "Diet & Kalium"
    },
    {
      sender: "Bu Ningsih (Pasien HD 6 Tahun)",
      content: "Saya kalau pengen buah biasanya makan apel malang dipotong kecil-kecil, atau pepaya satu potong tipis. Sama dokternya dibilangin jangan makan pisang, alpukat, durian sama air kelapa. Kaliumnya ampun tinggi banget.",
      groupName: "Komunitas HD Indonesia",
      date: "20 Feb 2026",
      category: "Diet & Kalium"
    }
  ],
  kelapa: [
    {
      sender: "Pak Heru (Pasien HD 8 Tahun)",
      content: "Betul mbak, air kelapa pantangan keras buat kita pasien cuci darah. Dulu awal-awal HD saya sempat bandel minum setengah gelas air kelapa muda karena haus banget, malamnya langsung lemas dan dilarikan ke IGD karena kalium naik jadi 6.8. Jangan dicoba ya.",
      groupName: "Komunitas HD Indonesia",
      date: "03 Mar 2026",
      category: "Diet & Kalium"
    }
  ],
  kram: [
    {
      sender: "Bu Retno (Caregiver / Istri Pasien)",
      content: "Kalau bapak kram di mesin cuci darah, biasanya saya langsung minta suster kurangi UFR-nya (kecepatan tarik cairan) dulu. Terus saya pijat betisnya pakai minyak kayu putih hangat dan ditegakkan telapak kakinya. Ini membantu banget biar bapak ga kesakitan.",
      groupName: "Keluarga Tangguh GGK",
      date: "28 Jan 2026",
      category: "Hemodialisis & Gejala"
    },
    {
      sender: "Ns. Dian (Perawat Ruang HD)",
      content: "Bagi pasien yang sering kram di akhir-akhir jam HD, usahakan kenaikan berat badan antar dua sesi HD (interdialytic weight gain/IDWG) tidak melebihi 5% dari berat kering. Kalau naiknya terlalu banyak, mesin harus menarik cairan dengan cepat, itu pemicu kram nomor satu.",
      groupName: "Edukasi GGK WhatsApp Grup",
      date: "05 Feb 2026",
      category: "Hemodialisis & Gejala"
    }
  ],
  cairan: [
    {
      sender: "Mbak Yanti (Edukator Medis)",
      content: "Pasien sering mengeluh haus karena makanannya masih terlalu asin atau gurih. Coba kurangi garam dapur dan MSG di masakan. Kalau masakan hambar memang kurang enak di awal, tapi rasa haus akan berkurang drastis sehingga ga kelebihan minum.",
      groupName: "Edukasi GGK WhatsApp Grup",
      date: "12 Apr 2026",
      category: "Cairan & Garam"
    },
    {
      sender: "Pak Joko (Pasien HD)",
      content: "Tips dari saya biar ga kelebihan minum: sediakan botol minum ukuran 600ml untuk jatah seharian. Setiap kali minum catat atau pakai sedotan kecil biar minumnya sedikit-sedikit. Air es juga lebih membasahi tenggorokan dibanding air biasa.",
      groupName: "Komunitas HD Indonesia",
      date: "18 Apr 2026",
      category: "Cairan & Garam"
    }
  ]
};

const DEFAULT_ROOMS: ChatRoom[] = [
  {
    id: "room-1",
    name: "Panduan Diet & Makanan Kalium",
    messages: [
      {
        id: "m-welcome-1",
        role: "assistant",
        content: "Halo! Saya NephroAid, asisten virtual berbasis RAG komunitas. Saya siap membantu menjawab pertanyaan Anda seputar keseharian Gagal Ginjal Kronis (GGK). Silakan tanyakan hal-seperti pantangan makanan (Pisang, Air Kelapa), cara mengatasi kram hemodialisis, atau tips mengontrol asupan cairan.",
        timestamp: "10:00"
      },
      {
        id: "m-user-1",
        role: "user",
        content: "Boleh makan pisang tidak ya setelah cuci darah?",
        timestamp: "10:02"
      },
      {
        id: "m-assistant-1",
        role: "assistant",
        content: "Berdasarkan arsip diskusi komunitas medis GGK, **buah pisang sangat disarankan untuk dibatasi** bagi pasien GGK cuci darah karena memiliki kadar kalium yang sangat tinggi (sekitar 400mg per buah). Kelebihan kalium dapat memicu kondisi hiperkalemia yang berbahaya bagi detak jantung Anda. Sebagai pengganti, Anda dapat mengonsumsi buah apel, pir, atau pepaya kupas dalam porsi kecil (target kalium harian dibatasi).",
        timestamp: "10:03",
        citations: [
          {
            sender: "dr. Andi (Sp.PD-KGH)",
            content: "Hati-hati ya bapak ibu anggota grup, pisang itu tinggi kalium sekali. Kemarin ada pasien masuk IGD karena sesak dan jantung berdebar kencang setelah makan pisang ambon 2 buah berturut-turut. Batasi betul kalau mau buah, lebih aman apel atau pir kupas.",
            groupName: "Grup Sehat Ginjal Kita",
            date: "14 Feb 2026",
            category: "Diet & Kalium"
          },
          {
            sender: "Bu Ningsih (Pasien HD 6 Tahun)",
            content: "Saya kalau pengen buah biasanya makan apel malang dipotong kecil-kecil, atau pepaya satu potong tipis. Sama dokternya dibilangin jangan makan pisang, alpukat, durian sama air kelapa. Kaliumnya ampun tinggi banget.",
            groupName: "Komunitas HD Indonesia",
            date: "20 Feb 2026",
            category: "Diet & Kalium"
          }
        ]
      }
    ]
  },
  {
    id: "room-2",
    name: "Kontrol Cairan Harian",
    messages: [
      {
        id: "m-welcome-2",
        role: "assistant",
        content: "Halo! Di ruang obrolan ini, mari diskusikan tips menjaga asupan cairan harian Anda agar tidak melebihi kapasitas ultrafiltrasi mesin cuci darah Anda.",
        timestamp: "11:00"
      },
      {
        id: "m-user-2",
        role: "user",
        content: "Bagaimana cara mengurangi rasa haus? Saya sering kelebihan minum di antara jadwal HD.",
        timestamp: "11:05"
      },
      {
        id: "m-assistant-2",
        role: "assistant",
        content: "Untuk mengurangi rasa haus yang berlebih:\n1. **Kurangi garam dapur & MSG** di masakan (garam menahan cairan di sel tubuh dan memicu haus terus-menerus).\n2. **Minum air es** atau emut es batu kecil (membasahi tenggorokan lebih lama dibanding air biasa dengan volume yang jauh lebih sedikit).\n3. Gunakan gelas kecil khusus atau sedotan untuk mengontrol jatah minum harian Anda.",
        timestamp: "11:06",
        citations: [
          {
            sender: "Mbak Yanti (Edukator Medis)",
            content: "Pasien sering mengeluh haus karena makanannya masih terlalu asin atau gurih. Coba kurangi garam dapur dan MSG di masakan. Kalau masakan hambar memang kurang enak di awal, tapi rasa haus akan berkurang drastis sehingga ga kelebihan minum.",
            groupName: "Edukasi GGK WhatsApp Grup",
            date: "12 Apr 2026",
            category: "Cairan & Garam"
          },
          {
            sender: "Pak Joko (Pasien HD)",
            content: "Tips dari saya biar ga kelebihan minum: sediakan botol minum ukuran 600ml untuk jatah seharian. Setiap kali minum catat atau pakai sedotan kecil biar minumnya sedikit-sedikit. Air es juga lebih membasahi tenggorokan dibanding air biasa.",
            groupName: "Komunitas HD Indonesia",
            date: "18 Apr 2026",
            category: "Cairan & Garam"
          }
        ]
      }
    ]
  }
];

export default function ChatInterface() {
  const [rooms, setRooms] = useState<ChatRoom[]>(DEFAULT_ROOMS);
  const [activeRoomId, setActiveRoomId] = useState("room-1");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);

  // Dialog control states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [roomToDeleteId, setRoomToDeleteId] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const saveRooms = (updatedRooms: ChatRoom[]) => {
    setRooms(updatedRooms);
    localStorage.setItem("nephroaid_chat_rooms", JSON.stringify(updatedRooms));
  };

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("nephroaid_chat_rooms");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Check if it has user messages to avoid empty session display
      const hasUserMessages = parsed.some((room: ChatRoom) =>
        room.messages.some((msg) => msg.role === "user")
      );
      if (hasUserMessages) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRooms(parsed);
        if (parsed.length > 0) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setActiveRoomId(parsed[0].id);
        }
        return;
      }
    }
    // If empty or has no user messages, save and use DEFAULT_ROOMS
    // eslint-disable-next-line react-hooks/set-state-in-effect
    saveRooms(DEFAULT_ROOMS);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveRoomId(DEFAULT_ROOMS[0].id);
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [rooms, activeRoomId]);

  const handleCreateRoom = (name: string) => {
    const newRoom: ChatRoom = {
      id: `room-${Date.now()}`,
      name: name,
      messages: [
        {
          id: `m-${Date.now()}`,
          role: "assistant",
          content: `Selamat datang di sesi "${name}". Saya NephroAid, asisten RAG Anda. Silakan tanyakan hal-hal terkait penanganan medis GGK.`,
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        }
      ]
    };
    const nextRooms = [newRoom, ...rooms];
    saveRooms(nextRooms);
    setActiveRoomId(newRoom.id);
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

  const confirmDeleteRoom = () => {
    if (roomToDeleteId) {
      const nextRooms = rooms.filter((r) => r.id !== roomToDeleteId);
      saveRooms(nextRooms);
      if (activeRoomId === roomToDeleteId) {
        setActiveRoomId(nextRooms[0].id);
      }
      setRoomToDeleteId(null);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const activeRoom = rooms.find((r) => r.id === activeRoomId);
    if (!activeRoom) return;

    const timeString = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    // User Message
    const userMessage: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: timeString
    };

    const updatedMessages = [...activeRoom.messages, userMessage];
    const updatedRooms = rooms.map((r) => {
      if (r.id === activeRoomId) {
        return { ...r, messages: updatedMessages };
      }
      return r;
    });

    saveRooms(updatedRooms);
    const query = input.toLowerCase();
    setInput("");
    setIsTyping(true);

    // Simulate RAG Backend Processing with response delay
    setTimeout(() => {
      let responseText = "";
      let citations: Citation[] = [];

      if (query.includes("pisang") || query.includes("kalium") || query.includes("buah")) {
        responseText = "Berdasarkan arsip diskusi komunitas medis GGK, **buah pisang sangat disarankan untuk dibatasi** bagi pasien GGK cuci darah karena memiliki kadar kalium yang sangat tinggi (sekitar 400mg per buah). Kelebihan kalium dapat memicu kondisi hiperkalemia yang berbahaya bagi detak jantung Anda. Sebagai pengganti, Anda dapat mengonsumsi buah apel, pir, atau pepaya kupas dalam porsi kecil (target kalium harian dibatasi).";
        citations = CITATIONS_DB.kalium;
      } else if (query.includes("kelapa")) {
        responseText = "Air kelapa muda sangat **tidak disarankan** bagi pasien GGK lanjut atau hemodialisis. Kandungan kalium dalam air kelapa sangat tinggi (sekitar 250mg per 100ml) dan dapat diserap sangat cepat oleh tubuh. Hal ini sering menjadi penyebab utama pasien dilarikan ke IGD karena serangan jantung mendadak akibat hiperkalemia berat.";
        citations = CITATIONS_DB.kelapa;
      } else if (query.includes("kram") || query.includes("hemodialisis") || query.includes("cuci darah")) {
        responseText = "Kram otot saat cuci darah sering kali dipicu oleh penarikan cairan tubuh (ultrafiltrasi) yang terlalu cepat oleh mesin. Untuk meredakannya: \n1. **Kompres hangat** bagian otot yang kram.\n2. **Minta perawat** melambatkan kecepatan penarikan cairan (UFR) sementara waktu.\n3. Pertahankan kenaikan berat badan antardialisis (**IDWG**) kurang dari 5% berat badan kering untuk mencegah tarikan ekstrem.";
        citations = CITATIONS_DB.kram;
      } else if (query.includes("cairan") || query.includes("minum") || query.includes("air")) {
        responseText = "Untuk pasien GGK, batas minum harian Anda adalah **volume urin 24 jam terakhir ditambah 500-750 ml** (sebagai pengganti keringat dan pernapasan). Untuk mengurangi rasa haus yang berlebih: \n1. Kurangi masakan yang asin/gurih (garam menahan air dan memicu haus).\n2. Minum menggunakan gelas kecil atau sedotan.\n3. Gunakan es batu kecil untuk diemut guna membasahi mulut tanpa menambah banyak volume air.";
        citations = CITATIONS_DB.cairan;
      } else {
        responseText = "Pertanyaan Anda sangat penting. Maaf, saya tidak menemukan diskusi WhatsApp komunitas yang persis mencakup topik ini dalam arsip terkurasi kami. Secara umum, pastikan Anda mematuhi pembatasan asupan fosfor, kalium, dan cairan harian sesuai instruksi dokter spesialis penyakit dalam (KGH) Anda. Jangan ragu menanyakan topik spesifik seperti pisang, air kelapa, kram, atau asupan cairan.";
        citations = [
          {
            sender: "Sistem Edukasi NephroAid",
            content: "Untuk pertanyaan di luar topik darurat, selalu rujuk ke panduan klinis dokter Anda. Asisten RAG ini memprioritaskan arsip WhatsApp grup pasien terverifikasi demi keamanan pasien.",
            groupName: "Disclaimer Medis",
            date: "20 Jun 2026",
            category: "Umum"
          }
        ];
      }

      // Add Assistant Message
      const assistantMessage: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: responseText,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        citations: citations
      };

      setIsTyping(false);
      setRooms((prevRooms) => {
        const finalRooms = prevRooms.map((r) => {
          if (r.id === activeRoomId) {
            return {
              ...r,
              messages: [...r.messages, assistantMessage]
            };
          }
          return r;
        });
        localStorage.setItem("nephroaid_chat_rooms", JSON.stringify(finalRooms));
        return finalRooms;
      });
    }, 1500);
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

        {/* Status Indicator */}
        <div className="p-5 border-t border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01]">
          <div className="flex items-center gap-2.5 px-3 py-2 bg-emerald-500/10 rounded-full w-max border border-emerald-500/20">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-medium">
              RAG Aktif
            </span>
          </div>
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
