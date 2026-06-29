import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { User, Heart, Gear, FloppyDisk, CheckCircle } from "@phosphor-icons/react";

interface UserProfile {
  email: string;
  role: string;
  dialysisFrequency: string;
  targetDryWeight: number;
}

interface SettingsViewProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
}

export default function SettingsView({ user, onUpdateUser }: SettingsViewProps) {
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [dialysisFrequency, setDialysisFrequency] = useState(user.dialysisFrequency);
  const [targetDryWeight, setTargetDryWeight] = useState(user.targetDryWeight.toString());
  const [isSaved, setIsSaved] = useState(false);

  // Sync state if user prop changes externally
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEmail(user.email);
    setRole(user.role);
    setDialysisFrequency(user.dialysisFrequency);
    setTargetDryWeight(user.targetDryWeight.toString());
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = { email, role, dialysisFrequency, targetDryWeight: parseFloat(targetDryWeight) || 60.0 };
    onUpdateUser(updatedUser);
    
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 w-full pb-10">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-black/5 dark:bg-white/5 text-[10px] uppercase tracking-[0.2em] font-mono text-muted-foreground">
          <span>PREFERENSI</span>
        </div>
        <h2 className="font-heading font-medium text-3xl md:text-4xl tracking-tight">Pengaturan Akun</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Card Summary */}
        <div className="lg:col-span-4">
          <div className="p-2 bg-black/5 dark:bg-white/5 rounded-[2.5rem] ring-1 ring-black/5 dark:ring-white/10">
            <div className="p-6 rounded-[calc(2.5rem-0.5rem)] bg-card shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(255,255,255,0.02)] flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-primary/10" />
              
              <div className="w-20 h-20 rounded-full bg-card shadow-sm border-[4px] border-card flex items-center justify-center text-primary relative z-10 mt-6 mb-4">
                <div className="absolute inset-0 bg-primary/10 rounded-full" />
                <User weight="duotone" className="w-10 h-10" />
                <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-card ring-1 ring-black/5 dark:ring-white/10" />
              </div>
              
              <div className="z-10 w-full px-2 mb-6">
                <h3 className="font-heading font-medium text-lg text-foreground break-all">{user.email}</h3>
                <p className="text-[10px] font-mono uppercase tracking-widest text-primary mt-1.5">
                  {user.role === "patient" ? "Pasien GGK" : "Caregiver"}
                </p>
              </div>
              
              <div className="w-full p-4 bg-black/[0.03] dark:bg-white/[0.03] rounded-2xl flex justify-between items-center z-10">
                <span className="text-xs font-medium text-muted-foreground">Status HD</span>
                <span className="text-xs font-bold text-foreground">
                  {user.dialysisFrequency === "none" ? "Belum HD" : `${user.dialysisFrequency}x / Minggu`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-8">
          <div className="p-2 bg-black/5 dark:bg-white/5 rounded-[2.5rem] ring-1 ring-black/5 dark:ring-white/10">
            <div className="p-8 md:p-10 rounded-[calc(2.5rem-0.5rem)] bg-card shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(255,255,255,0.02)]">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-black/5 dark:border-white/5">
                <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-muted-foreground">
                  <Gear weight="duotone" className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-medium text-xl">Informasi Profil</h3>
                  <p className="text-xs text-muted-foreground mt-1">Perbarui data login dan preferensi medis Anda.</p>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground ml-1">
                    Alamat Email
                  </label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-muted-foreground transition-colors group-focus-within:text-primary">
                      <User weight="light" className="w-5 h-5" />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 pl-12 pr-4 bg-black/[0.03] dark:bg-white/[0.03] border-none rounded-2xl focus:ring-1 focus:ring-primary text-sm transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground ml-1">
                    Peran Anda
                  </label>
                  <div className="grid grid-cols-2 gap-3">
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
                      Pasien GGK
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

                <div className="space-y-2">
                  <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground ml-1">
                    Frekuensi Hemodialisis
                  </label>
                  <div className="relative">
                    <select
                      value={dialysisFrequency}
                      onChange={(e) => setDialysisFrequency(e.target.value)}
                      className="w-full h-12 px-4 bg-black/[0.03] dark:bg-white/[0.03] border-none rounded-2xl text-sm focus:ring-1 focus:ring-primary transition-all outline-none appearance-none cursor-pointer"
                    >
                      <option value="2">2 Kali Seminggu (Standar)</option>
                      <option value="3">3 Kali Seminggu</option>
                      <option value="1">1 Kali Seminggu</option>
                      <option value="none">Belum / Tidak Cuci Darah</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-muted-foreground">
                      <Gear weight="fill" className="w-4 h-4 opacity-50" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground ml-1">
                    Target BB Kering (kg)
                  </label>
                  <div className="relative group">
                    <input
                      type="number"
                      step="0.1"
                      value={targetDryWeight}
                      onChange={(e) => setTargetDryWeight(e.target.value)}
                      className="w-full h-12 px-4 bg-black/[0.03] dark:bg-white/[0.03] border-none rounded-2xl focus:ring-1 focus:ring-primary text-sm transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="pt-8 mt-8 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                  <div className="h-6">
                    {isSaved && (
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500 text-[11px] font-mono uppercase tracking-widest font-semibold">
                        <CheckCircle weight="fill" className="w-4 h-4" />
                        Tersimpan
                      </motion.div>
                    )}
                  </div>
                  
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="h-12 px-8 bg-foreground text-background font-medium rounded-full shadow-md shadow-black/10 transition-all flex items-center gap-2 hover:bg-foreground/90"
                  >
                    <FloppyDisk weight="bold" className="w-4 h-4" />
                    Simpan Profil
                  </motion.button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
