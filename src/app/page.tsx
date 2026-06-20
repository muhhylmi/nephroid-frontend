"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, Variants } from "motion/react";
import { useFontSize } from "@/components/font-size-provider";
import { Heart, ShieldCheck, Sparkle, User, Key, Eye, EyeSlash, ArrowRight, TextAUnderline } from "@phosphor-icons/react";

export default function AuthPage() {
  const router = useRouter();
  const { fontSize, setFontSize } = useFontSize();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient"); 
  const [dialysisFrequency, setDialysisFrequency] = useState("2"); 
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Email dan kata sandi wajib diisi.");
      return;
    }

    if (password.length < 6) {
      setError("Kata sandi harus minimal 6 karakter.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      localStorage.setItem("nephroaid_user", JSON.stringify({ email, role, dialysisFrequency }));
      router.push("/dashboard");
    }, 1200);
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemFadeUp: Variants = {
    hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
    show: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: [0.32, 0.72, 0, 1] }
    },
  };

  return (
    <div className="relative min-h-[100dvh] flex flex-col md:flex-row bg-background text-foreground overflow-hidden">
      {/* Floating Accessibility Controls */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1], delay: 0.5 }}
        className="absolute top-6 right-6 z-50 flex items-center gap-2 p-1.5 bg-black/5 dark:bg-white/5 rounded-full ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-md"
      >
        <div className="pl-3 pr-2 flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
          <TextAUnderline weight="light" className="w-4 h-4" />
          <span>Teks</span>
        </div>
        <div className="flex gap-1">
          {(["normal", "large", "xlarge"] as const).map((sz) => (
            <button
              key={sz}
              onClick={() => setFontSize(sz)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                fontSize === sz 
                  ? "bg-card text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10" 
                  : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              {sz === "normal" ? "A" : sz === "large" ? "A+" : "A++"}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Editorial Left Half */}
      <div className="w-full md:w-1/2 min-h-[40dvh] md:min-h-[100dvh] p-8 md:p-16 lg:p-24 flex flex-col justify-between relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
          className="flex items-center gap-3"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
            <Heart weight="duotone" className="w-6 h-6" />
          </div>
          <span className="font-heading font-medium tracking-tight text-xl">NephroAid</span>
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="max-w-md mt-16 md:mt-0"
        >
          <motion.div variants={itemFadeUp} className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] uppercase tracking-[0.2em] font-mono font-medium">
            <Sparkle weight="fill" className="w-3 h-3" />
            <span>Asisten Virtual GGK</span>
          </motion.div>
          
          <motion.h1 variants={itemFadeUp} className="text-4xl md:text-5xl lg:text-6xl font-heading font-medium tracking-tighter leading-[1.1] mb-6">
            Ketenangan di setiap langkah perawatan.
          </motion.h1>
          
          <motion.p variants={itemFadeUp} className="text-muted-foreground leading-relaxed text-base md:text-lg max-w-[40ch]">
            Platform pendamping pasien Gagal Ginjal Kronis. Pantau cairan, jadwalkan hemodialisis, dan temukan jawaban dari komunitas tepercaya.
          </motion.p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="hidden md:flex items-center gap-6 text-[11px] uppercase tracking-widest text-muted-foreground font-mono"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck weight="light" className="w-4 h-4" /> Enkripsi Medis
          </span>
          <span className="flex items-center gap-2">
            <Heart weight="light" className="w-4 h-4" /> RAG Komunitas
          </span>
        </motion.div>
      </div>

      {/* Interactive Right Half (Double-Bezel Architecture) */}
      <div className="w-full md:w-1/2 min-h-[60dvh] md:min-h-[100dvh] p-4 md:p-12 lg:p-24 flex items-center justify-center bg-black/[0.02] dark:bg-white/[0.02] relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.32, 0.72, 0, 1], delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Outer Shell (Double-Bezel) */}
          <div className="p-2 bg-black/5 dark:bg-white/5 rounded-[2.5rem] ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-xl">
            {/* Inner Core */}
            <div className="p-8 md:p-10 bg-card rounded-[calc(2.5rem-0.5rem)] shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(255,255,255,0.02)] ring-1 ring-black/5 dark:ring-white/5">
              
              <div className="mb-8">
                <h2 className="text-2xl font-heading font-medium tracking-tight mb-2">
                  {isLogin ? "Selamat Datang" : "Mulai Perjalanan"}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {isLogin ? "Masuk ke akun Anda untuk melanjutkan." : "Buat profil baru untuk memulai pemantauan."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-destructive/10 text-destructive text-sm rounded-xl">
                    {error}
                  </motion.div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground ml-1">
                    Alamat Email
                  </label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-muted-foreground transition-colors group-focus-within:text-primary">
                      <User weight="light" className="w-5 h-5" />
                    </span>
                    <input
                      type="email"
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 pl-12 pr-4 bg-black/[0.03] dark:bg-white/[0.03] border-none rounded-2xl focus:ring-1 focus:ring-primary text-sm transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground ml-1">
                    Kata Sandi
                  </label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-muted-foreground transition-colors group-focus-within:text-primary">
                      <Key weight="light" className="w-5 h-5" />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 pl-12 pr-12 bg-black/[0.03] dark:bg-white/[0.03] border-none rounded-2xl focus:ring-1 focus:ring-primary text-sm transition-all outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeSlash weight="light" className="w-5 h-5" /> : <Eye weight="light" className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: "auto" }} 
                    className="space-y-5 pt-2"
                  >
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground ml-1">
                        Peran Anda
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRole("patient")}
                          className={`flex items-center justify-center gap-2 h-12 rounded-2xl text-sm transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                            role === "patient"
                              ? "bg-primary text-primary-foreground shadow-md"
                              : "bg-black/[0.03] dark:bg-white/[0.03] text-muted-foreground hover:bg-black/[0.06] dark:hover:bg-white/[0.06]"
                          }`}
                        >
                          <Heart weight={role === "patient" ? "fill" : "light"} className="w-4 h-4" />
                          Pasien
                        </button>
                        <button
                          type="button"
                          onClick={() => setRole("caregiver")}
                          className={`flex items-center justify-center gap-2 h-12 rounded-2xl text-sm transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                            role === "caregiver"
                              ? "bg-primary text-primary-foreground shadow-md"
                              : "bg-black/[0.03] dark:bg-white/[0.03] text-muted-foreground hover:bg-black/[0.06] dark:hover:bg-white/[0.06]"
                          }`}
                        >
                          <User weight={role === "caregiver" ? "fill" : "light"} className="w-4 h-4" />
                          Caregiver
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground ml-1">
                        Frekuensi Hemodialisis
                      </label>
                      <select
                        value={dialysisFrequency}
                        onChange={(e) => setDialysisFrequency(e.target.value)}
                        className="w-full h-12 px-4 bg-black/[0.03] dark:bg-white/[0.03] border-none rounded-2xl text-sm focus:ring-1 focus:ring-primary transition-all outline-none appearance-none"
                      >
                        <option value="2">2 Kali Seminggu (Standar)</option>
                        <option value="3">3 Kali Seminggu</option>
                        <option value="1">1 Kali Seminggu</option>
                        <option value="none">Belum / Tidak Cuci Darah</option>
                      </select>
                    </div>
                  </motion.div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full h-12 flex items-center justify-center gap-2 bg-foreground text-background rounded-full font-medium active:scale-[0.98] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
                  >
                    {loading ? (
                      <span className="h-5 w-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{isLogin ? "Masuk ke Dashboard" : "Daftar Sekarang"}</span>
                        {/* Nested CTA Icon */}
                        <div className="w-8 h-8 rounded-full bg-background/10 flex items-center justify-center absolute right-2 group-hover:bg-background/20 group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                          <ArrowRight weight="bold" className="w-4 h-4" />
                        </div>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center mt-6">
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                  >
                    {isLogin ? "Atau buat akun baru" : "Sudah punya akun? Masuk"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
        
        {/* Mobile footer disclaimer */}
        <div className="absolute bottom-8 md:hidden text-center text-[10px] text-muted-foreground opacity-60 px-8">
          NephroAid bukan pengganti diagnosis medis dari dokter profesional.
        </div>
      </div>
    </div>
  );
}
