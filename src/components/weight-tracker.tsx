"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Plus, Trash, Scales, Info, Warning, CheckCircle, Gear, X } from "@phosphor-icons/react";
import ConfirmDialog from "@/components/confirm-dialog";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface WeightRecord {
  id: string;
  date: string;
  preWeight: number; // kg
  postWeight: number; // kg
}

const DEFAULT_WEIGHT_RECORDS: WeightRecord[] = [
  { id: "w-1", date: "08 Jun", preWeight: 62.5, postWeight: 59.8 },
  { id: "w-2", date: "11 Jun", preWeight: 63.1, postWeight: 60.0 },
  { id: "w-3", date: "15 Jun", preWeight: 62.8, postWeight: 59.9 },
  { id: "w-4", date: "18 Jun", preWeight: 63.4, postWeight: 60.1 }
];

export default function WeightTracker() {
  const [records, setRecords] = useState<WeightRecord[]>(DEFAULT_WEIGHT_RECORDS);
  const [dryWeight, setDryWeight] = useState(60.0); // Target dry weight in kg
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Dry Weight Modal States
  const [showDryWeightModal, setShowDryWeightModal] = useState(false);
  const [tempDryWeight, setTempDryWeight] = useState("");

  // Form states
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [preWeight, setPreWeight] = useState("");
  const [postWeight, setPostWeight] = useState("");

  useEffect(() => {
    const fetchWeights = async () => {
      const userId = localStorage.getItem("nephroaid_user_id");
      if (userId) {
        try {
          const data = await api.getWeights(userId);
          setRecords(data.map((r: any) => ({
            id: r.id,
            date: r.date,
            preWeight: r.preWeight,
            postWeight: r.postWeight
          })));
        } catch (e) {
          console.error("Failed to fetch weights", e);
        }
      }
    };
    fetchWeights();

    const savedUser = localStorage.getItem("nephroaid_user");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.target_dry_weight) {
          setDryWeight(u.target_dry_weight);
        }
      } catch (e) {}
    }
  }, []);

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !preWeight || !postWeight) return;

    const userId = localStorage.getItem("nephroaid_user_id");
    if (!userId) return;

    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

    try {
      const newRec = await api.addWeight(userId, {
        date: formattedDate,
        preWeight: parseFloat(preWeight),
        postWeight: parseFloat(postWeight)
      });
      
      const newRecord: WeightRecord = {
        id: newRec.id,
        date: newRec.date,
        preWeight: newRec.preWeight,
        postWeight: newRec.postWeight
      };

      setRecords([...records, newRecord]);
      setShowAddModal(false);

      // Clear form
      setDate(new Date().toISOString().split("T")[0]);
      setPreWeight("");
      setPostWeight("");
    } catch (err) {
      console.error("Failed to add weight", err);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteRecord = async () => {
    if (deleteTargetId) {
      try {
        await api.deleteWeight(deleteTargetId);
        setRecords(records.filter((r) => r.id !== deleteTargetId));
        setDeleteTargetId(null);
      } catch (err) {
        console.error("Failed to delete weight", err);
      }
    }
  };

  const handleSaveDryWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(tempDryWeight);
    if (!isNaN(val) && val > 0) {
      setDryWeight(val);
      setShowDryWeightModal(false);
      
      const userId = localStorage.getItem("nephroaid_user_id");
      const savedUser = localStorage.getItem("nephroaid_user");
      if (userId && savedUser) {
        try {
          const u = JSON.parse(savedUser);
          const data = await api.updateProfile(userId, {
            email: u.email,
            role: u.role,
            dialysis_frequency: u.dialysis_frequency,
            target_dry_weight: val
          });
          localStorage.setItem("nephroaid_user", JSON.stringify(data));
        } catch(e) {
          console.error("failed to save dry weight", e);
        }
      }
    }
  };

  // Calculations for IDWG (Interdialytic Weight Gain)
  // IDWG is Pre-weight of current session minus Post-weight of previous session
  let latestIdwg = 0;
  let idwgPercentage = 0;
  
  if (records.length >= 2) {
    const latest = records[records.length - 1];
    const prev = records[records.length - 2];
    latestIdwg = latest.preWeight - prev.postWeight;
    idwgPercentage = (latestIdwg / dryWeight) * 100;
  }

  const isIdwgHigh = idwgPercentage >= 5.0;
  const isIdwgWarning = idwgPercentage >= 3.0 && idwgPercentage < 5.0;

  return (
    <div className="bg-card border border-black/5 dark:border-white/5 rounded-[2rem] p-5 md:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Scales weight="duotone" className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-medium text-base text-foreground">Berat Badan Pre & Post HD</h3>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-0.5">Kenaikan cairan (IDWG)</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="h-10 px-4 rounded-xl bg-foreground text-background text-xs font-medium hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2"
        >
          <Plus weight="bold" className="w-4 h-4" /> Catat BB
        </motion.button>
      </div>

      {/* IDWG Analysis Card */}
      {records.length >= 2 && (
        <div className={`p-5 rounded-[1.5rem] border text-sm flex gap-3 ${
          isIdwgHigh 
            ? "bg-destructive/5 border-destructive/10 text-destructive"
            : isIdwgWarning
              ? "bg-amber-500/5 border-amber-500/10 text-amber-600 dark:text-amber-500"
              : "bg-emerald-500/5 border-emerald-500/10 text-emerald-600 dark:text-emerald-500"
        }`}>
          <div className="mt-0.5">
            {isIdwgHigh || isIdwgWarning ? <Warning weight="duotone" className="w-5 h-5" /> : <CheckCircle weight="duotone" className="w-5 h-5" />}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex justify-between items-center font-medium">
              <span>Status Cairan (IDWG)</span>
              <span className="font-bold">{latestIdwg.toFixed(1)} kg ({idwgPercentage.toFixed(1)}%)</span>
            </div>
            <p className="text-xs leading-relaxed opacity-80">
              {isIdwgHigh 
                ? "Peringatan: Kenaikan berat badan melebihi batas aman 5.0%. Risiko sesak napas tinggi! Sangat penting membatasi asupan air dan garam dapur segera."
                : isIdwgWarning
                  ? "Waspada: Kenaikan berat badan mendekati batas aman 5.0%. Harap pantau ketat asupan minum Anda hingga jadwal cuci darah berikutnya."
                  : "Baik sekali: Kenaikan cairan Anda terjaga di bawah 3.0%. Pertahankan kontrol asupan minum dan garam Anda harian."
              }
            </p>
          </div>
        </div>
      )}

      {/* Dry Weight Setting Area */}
      <div className="flex items-center justify-between text-sm p-4 bg-black/5 dark:bg-white/5 rounded-2xl">
        <div className="flex items-center gap-2 text-muted-foreground font-medium">
          <Info weight="fill" className="w-4 h-4" />
          <span>BB Kering (Target):</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-bold text-foreground">{dryWeight} kg</span>
          <button
            onClick={() => {
              setTempDryWeight(dryWeight.toString());
              setShowDryWeightModal(true);
            }}
            className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shadow-sm"
          >
            <Gear weight="bold" className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Records table/list */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
        {records.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-8">Belum ada catatan berat badan.</p>
        ) : (
          <div className="rounded-2xl overflow-hidden text-sm border border-black/5 dark:border-white/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/5 dark:bg-white/5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  <th className="p-4 font-medium">Tanggal</th>
                  <th className="p-4 font-medium">Pre-HD</th>
                  <th className="p-4 font-medium">Post-HD</th>
                  <th className="p-4 font-medium">Ditarik</th>
                  <th className="p-4 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {records.map((rec) => {
                  const removedFluid = rec.preWeight - rec.postWeight;
                  return (
                    <tr key={rec.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-medium text-foreground">{rec.date}</td>
                      <td className="p-4 text-muted-foreground">{rec.preWeight} kg</td>
                      <td className="p-4 text-muted-foreground">{rec.postWeight} kg</td>
                      <td className="p-4 font-semibold text-primary">{removedFluid.toFixed(1)} L</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteClick(rec.id)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all cursor-pointer"
                        >
                          <Trash weight="fill" className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reusable Delete Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Hapus Catatan Berat Badan"
        description="Apakah Anda yakin ingin menghapus catatan berat badan ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        onConfirm={confirmDeleteRecord}
        isDestructive={true}
      />

      {/* Set Target Dry Weight Modal */}
      <Dialog open={showDryWeightModal} onOpenChange={setShowDryWeightModal}>
        <DialogContent className="sm:max-w-[400px] rounded-[2rem] p-0 border-none shadow-[0_16px_64px_rgba(0,0,0,0.12)] overflow-hidden [&>button]:hidden">
          <div className="p-6 bg-card">
            <DialogTitle className="sr-only">Ubah Berat Badan Kering</DialogTitle>
            <DialogDescription className="sr-only">Form untuk mengubah target berat badan kering (kering).</DialogDescription>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center">
                  <Gear weight="duotone" className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="font-heading font-medium text-lg">Ubah BB Kering</h3>
              </div>
              <button onClick={() => setShowDryWeightModal(false)} className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-black/10 transition-colors">
                <X weight="bold" className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSaveDryWeight} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground ml-1">Target BB Kering (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Misal: 60.0"
                  value={tempDryWeight}
                  onChange={(e) => setTempDryWeight(e.target.value)}
                  className="w-full h-12 bg-black/[0.03] dark:bg-white/[0.03] border-none rounded-2xl px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full h-12 text-sm font-medium bg-foreground text-background rounded-full shadow-md hover:bg-foreground/90 transition-colors"
              >
                Simpan Target
              </motion.button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Entry Modal Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[400px] rounded-[2rem] p-0 border-none shadow-[0_16px_64px_rgba(0,0,0,0.12)] overflow-hidden [&>button]:hidden">
          <div className="p-6 bg-card">
            <DialogTitle className="sr-only">Catat Berat Badan Sesi HD</DialogTitle>
            <DialogDescription className="sr-only">Form untuk mencatat berat badan sebelum dan sesudah HD.</DialogDescription>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center">
                  <Scales weight="duotone" className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="font-heading font-medium text-lg">Catat Berat Badan</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-black/10 transition-colors">
                <X weight="bold" className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleAddRecord} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground ml-1">Tanggal Sesi</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-12 bg-black/[0.03] dark:bg-white/[0.03] border-none rounded-2xl px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground ml-1">BB Pre-HD</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Misal: 63.4"
                    value={preWeight}
                    onChange={(e) => setPreWeight(e.target.value)}
                    className="w-full h-12 bg-black/[0.03] dark:bg-white/[0.03] border-none rounded-2xl px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground ml-1">BB Post-HD</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Misal: 60.1"
                    value={postWeight}
                    onChange={(e) => setPostWeight(e.target.value)}
                    className="w-full h-12 bg-black/[0.03] dark:bg-white/[0.03] border-none rounded-2xl px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="w-full h-12 text-sm font-medium bg-foreground text-background rounded-full shadow-md hover:bg-foreground/90 transition-colors mt-2"
                >
                  Simpan Catatan
                </motion.button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
