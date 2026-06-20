"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Plus, ArrowCounterClockwise, Warning, Drop, Info, Gear, X } from "@phosphor-icons/react";
import ConfirmDialog from "@/components/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export default function FluidTracker() {
  const [limit, setLimit] = useState(1000); // Default GGK limit is 1000ml
  const [current, setCurrent] = useState(350); // Mocked initial water intake
  const [customInput, setCustomInput] = useState("");

  // Custom Modal States
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [tempLimit, setTempLimit] = useState("");

  useEffect(() => {
    const savedIntake = localStorage.getItem("nephroaid_fluid_intake");
    if (savedIntake) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrent(parseInt(savedIntake));
    }
    const savedLimit = localStorage.getItem("nephroaid_fluid_limit");
    if (savedLimit) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLimit(parseInt(savedLimit));
    }
  }, []);

  const addFluid = (amount: number) => {
    const next = Math.max(0, current + amount);
    setCurrent(next);
    localStorage.setItem("nephroaid_fluid_intake", next.toString());
  };

  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customInput);
    if (!isNaN(val) && val > 0) {
      addFluid(val);
      setCustomInput("");
    }
  };

  const confirmResetTracker = () => {
    setCurrent(0);
    localStorage.setItem("nephroaid_fluid_intake", "0");
  };

  const handleSaveLimit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(tempLimit);
    if (!isNaN(val) && val > 0) {
      setLimit(val);
      localStorage.setItem("nephroaid_fluid_limit", val.toString());
      setShowLimitModal(false);
    }
  };

  const percentage = Math.min(100, Math.round((current / limit) * 100));
  const isCloseToLimit = percentage >= 85 && percentage < 100;
  const isOverLimit = percentage >= 100;

  // Visual SVG fill calculation (representing the liquid height from bottom)
  // Height of bottle is 120px. Fill starts at y=110 (empty) and goes to y=20 (full).
  const fillY = 110 - (percentage / 100) * 90;

  return (
    <div className="space-y-6">
      {/* Tracker Card */}
      <div className="bg-card border border-black/5 dark:border-white/5 rounded-[2rem] p-5 md:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Drop weight="duotone" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-medium text-base text-foreground">Pemantau Cairan</h3>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-0.5">Batas harian pasien GGK</p>
            </div>
          </div>
          <button
            onClick={() => setShowResetConfirm(true)}
            title="Reset Catatan"
            className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors shadow-sm"
          >
            <ArrowCounterClockwise weight="bold" className="w-4 h-4" />
          </button>
        </div>

        {/* Display Fluid Intake Graphic */}
        <div className="flex items-center justify-around py-4">
          
          {/* Custom SVG Water Bottle Fill Animation */}
          <div className="relative flex flex-col items-center justify-center bg-black/[0.02] dark:bg-white/[0.02] p-4 rounded-[2rem] border border-black/5 dark:border-white/5">
            <svg
              width="70"
              height="130"
              viewBox="0 0 70 130"
              className="drop-shadow-lg"
            >
              {/* Bottle Outline */}
              <path
                d="M25 10 h20 v10 h-5 v5 h10 a8 8 0 0 1 8 8 v80 a10 10 0 0 1 -10 10 h-36 a10 10 0 0 1 -10 -10 v-80 a8 8 0 0 1 8 -8 h10 v-5 h-5 z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-border dark:text-muted-foreground/30"
              />
              
              {/* Liquid Fill Clip Path */}
              <defs>
                <clipPath id="bottle-clip-fluid">
                  <path d="M25 10 h20 v10 h-5 v5 h10 a8 8 0 0 1 8 8 v80 a10 10 0 0 1 -10 10 h-36 a10 10 0 0 1 -10 -10 v-80 a8 8 0 0 1 8 -8 h10 v-5 h-5 z" />
                </clipPath>
              </defs>

              {/* Liquid Color */}
              <rect
                x="2"
                y={fillY}
                width="66"
                height="120"
                fill={isOverLimit ? "oklch(0.65 0.17 20)" : isCloseToLimit ? "oklch(0.75 0.15 70)" : "oklch(0.6 0.15 220)"}
                clipPath="url(#bottle-clip-fluid)"
                className="transition-all duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)]"
              />

              {/* Grid markings */}
              <line x1="15" y1="35" x2="25" y2="35" stroke="currentColor" strokeWidth="1" className="opacity-20" />
              <line x1="15" y1="65" x2="30" y2="65" stroke="currentColor" strokeWidth="1" className="opacity-20" />
              <line x1="15" y1="95" x2="25" y2="95" stroke="currentColor" strokeWidth="1" className="opacity-20" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 pointer-events-none drop-shadow-md">
              <span className={`text-sm font-bold tracking-tight ${percentage > 50 ? 'text-white' : 'text-foreground'}`}>
                {percentage}%
              </span>
              <span className={`text-[9px] font-semibold ${percentage > 50 ? 'text-white/80' : 'text-muted-foreground'}`}>
                {current} ml
              </span>
            </div>
          </div>

          {/* Statistics */}
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Telah Diminum</p>
              <p className="text-3xl font-medium font-heading text-primary tracking-tight">{current} <span className="text-sm font-semibold opacity-60">ml</span></p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Batas Harian</p>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-foreground">{limit} ml</span>
                <button
                  onClick={() => {
                    setTempLimit(limit.toString());
                    setShowLimitModal(true);
                  }}
                  className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Gear weight="bold" className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Quick logging Buttons */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => addFluid(150)}
            className="h-12 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 hover:bg-black/[0.06] dark:hover:bg-white/[0.06] text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Plus weight="bold" className="w-4 h-4 text-primary" /> 150ml
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => addFluid(250)}
            className="h-12 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 hover:bg-black/[0.06] dark:hover:bg-white/[0.06] text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Plus weight="bold" className="w-4 h-4 text-primary" /> 250ml
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => addFluid(500)}
            className="h-12 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 hover:bg-black/[0.06] dark:hover:bg-white/[0.06] text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Plus weight="bold" className="w-4 h-4 text-primary" /> 500ml
          </motion.button>
        </div>

        {/* Custom logging Form */}
        <form onSubmit={handleCustomAdd} className="flex gap-2 mt-2">
          <input
            type="number"
            placeholder="Ketik ml custom..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            className="flex-1 h-12 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="h-12 px-6 rounded-xl bg-foreground text-background text-sm font-medium shadow-md hover:bg-foreground/90 transition-colors"
          >
            Tambah
          </motion.button>
        </form>

        {/* Dynamic warning banners */}
        {isCloseToLimit && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-500 font-medium flex items-start gap-2 animate-pulse">
            <Warning weight="duotone" className="w-5 h-5 shrink-0" />
            <span className="leading-relaxed">Mendekati batas cairan! Hindari makanan berkuah/asin untuk mengurangi haus.</span>
          </div>
        )}

        {isOverLimit && (
          <div className="mt-4 p-4 rounded-2xl bg-destructive/5 border border-destructive/10 text-xs text-destructive font-medium flex items-start gap-2 animate-bounce">
            <Warning weight="duotone" className="w-5 h-5 shrink-0" />
            <span className="leading-relaxed">Melebihi batas harian! Risiko sesak napas tinggi. Segera konsultasikan ke dokter jika berat badan naik drastis.</span>
          </div>
        )}
      </div>

      {/* Info card */}
      <div className="p-4 bg-primary/5 rounded-2xl flex gap-3">
        <Info weight="fill" className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Bagi pasien hemodialisis, pembatasan asupan cairan sangat krusial di antara sesi cuci darah untuk mencegah penumpukan cairan di paru-paru (edema paru) dan pembengkakan tubuh.
        </p>
      </div>

      {/* Custom Dialogs */}
      <ConfirmDialog
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        title="Setel Ulang Catatan Cairan"
        description="Apakah Anda yakin ingin menghapus seluruh catatan asupan cairan hari ini? Data harian akan disetel ke nol."
        confirmText="Ya, Setel Ulang"
        onConfirm={confirmResetTracker}
        isDestructive={true}
      />

      <Dialog open={showLimitModal} onOpenChange={setShowLimitModal}>
        <DialogContent className="sm:max-w-[400px] rounded-[2rem] p-0 border-none shadow-[0_16px_64px_rgba(0,0,0,0.12)] overflow-hidden [&>button]:hidden">
          <div className="p-6 bg-card">
            <DialogTitle className="sr-only">Ubah Batas Cairan Harian</DialogTitle>
            <DialogDescription className="sr-only">Form untuk mengubah batas maksimal cairan harian.</DialogDescription>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center">
                  <Gear weight="duotone" className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="font-heading font-medium text-lg">Ubah Batas Harian</h3>
              </div>
              <button onClick={() => setShowLimitModal(false)} className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-black/10 transition-colors">
                <X weight="bold" className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSaveLimit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground ml-1">Batas Cairan Baru (ml)</label>
                <input
                  type="number"
                  placeholder="Misal: 1000"
                  value={tempLimit}
                  onChange={(e) => setTempLimit(e.target.value)}
                  className="w-full h-12 bg-black/[0.03] dark:bg-white/[0.03] border-none rounded-2xl px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full h-12 text-sm font-medium bg-foreground text-background rounded-full shadow-md hover:bg-foreground/90 transition-colors"
              >
                Simpan Batas
              </motion.button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
