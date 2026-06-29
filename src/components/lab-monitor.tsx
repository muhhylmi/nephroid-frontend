"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Plus, Trash, Calendar, Flask, Info, ChartLineUp, X } from "@phosphor-icons/react";
import ConfirmDialog from "@/components/confirm-dialog";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export interface LabRecord {
  id: string;
  date: string;
  kreatinin: number; // mg/dL
  ureum: number; // mg/dL
  kalium: number; // mEq/L
  hb: number; // g/dL
}

export const DEFAULT_LAB_RECORDS: LabRecord[] = [
  { id: "l-1", date: "05 Apr", kreatinin: 8.4, ureum: 130, kalium: 5.6, hb: 8.5 },
  { id: "l-2", date: "20 Apr", kreatinin: 7.9, ureum: 110, kalium: 4.8, hb: 9.0 },
  { id: "l-3", date: "05 Mei", kreatinin: 8.1, ureum: 125, kalium: 5.2, hb: 9.4 },
  { id: "l-4", date: "20 Mei", kreatinin: 7.5, ureum: 95, kalium: 4.5, hb: 9.8 },
  { id: "l-5", date: "05 Jun", kreatinin: 7.2, ureum: 88, kalium: 4.2, hb: 10.2 }
];

export function LabMonitorChart({ records }: { records: LabRecord[] }) {
  const [activeTab, setActiveTab] = useState<"kreatinin" | "ureum" | "kalium" | "hb">("kreatinin");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getActiveMetricDetails = () => {
    switch (activeTab) {
      case "kreatinin":
        return {
          title: "Kreatinin Serum",
          desc: "Indikator utama fungsi ginjal. Nilai tinggi menandakan penumpukan sisa metabolisme otot.",
          range: "Target GGK: < 8 mg/dL (Sebelum HD)",
          color: "oklch(0.65 0.17 195)",
        };
      case "ureum":
        return {
          title: "Ureum (BUN)",
          desc: "Hasil pemecahan protein oleh hati. Nilai tinggi dapat menyebabkan mual dan gatal uremik.",
          range: "Target GGK: < 100 mg/dL",
          color: "oklch(0.60 0.15 250)",
        };
      case "kalium":
        return {
          title: "Kalium (Potassium)",
          desc: "Elektrolit penting bagi jantung. Hiperkalemia (>5.5) sangat berisiko memicu henti jantung.",
          range: "Rentang Aman GGK: 3.5 - 5.5 mEq/L",
          color: "oklch(0.70 0.15 40)",
        };
      case "hb":
        return {
          title: "Hemoglobin (Hb)",
          desc: "Protein pembawa oksigen. Pasien GGK sering anemia akibat kekurangan hormon eritropoietin.",
          range: "Target GGK: 10.0 - 12.0 g/dL",
          color: "oklch(0.60 0.20 20)",
        };
    }
  };

  const metric = getActiveMetricDetails();

  return (
    <div className="bg-card border border-black/5 dark:border-white/5 rounded-[2rem] p-5 md:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <ChartLineUp weight="duotone" className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-heading font-medium text-base text-foreground">Grafik Tren Laboratorium</h3>
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-0.5">Perkembangan klinis fungsi ginjal Anda</p>
        </div>
      </div>

      {/* Tab selection */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-black/[0.03] dark:bg-white/[0.03] rounded-[1.25rem] border border-black/5 dark:border-white/5">
        {(["kreatinin", "ureum", "kalium", "hb"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-3 rounded-xl text-[11px] font-mono uppercase tracking-widest font-medium capitalize transition-all cursor-pointer ${
              activeTab === tab
                ? "bg-card text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/5"
                : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            {tab === "hb" ? "Hb" : tab}
          </button>
        ))}
      </div>

      {/* Chart Container */}
      <div className="h-[200px] w-full text-xs font-medium pr-2 min-w-0 min-h-0">
        {isMounted && (
          <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
            <LineChart data={records}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
            <XAxis dataKey="date" stroke="currentColor" className="text-muted-foreground" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} dy={10} />
            <YAxis domain={["auto", "auto"]} stroke="currentColor" className="text-muted-foreground" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} dx={-10} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "var(--card)", 
                borderColor: "var(--border)",
                borderRadius: "1rem",
                boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                color: "var(--foreground)",
                fontSize: "12px",
                fontWeight: 500,
                border: "1px solid rgba(0,0,0,0.05)"
              }} 
            />
            <Line
              type="monotone"
              dataKey={activeTab}
              stroke={metric.color}
              strokeWidth={3}
              activeDot={{ r: 6, fill: metric.color, stroke: "var(--card)", strokeWidth: 2 }}
              dot={{ r: 4, fill: "var(--card)", stroke: metric.color, strokeWidth: 2 }}
            />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Info Metric details */}
      <div className="p-4 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium font-heading text-foreground">{metric.title}</h4>
          <span className="text-[10px] font-mono uppercase tracking-widest font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
            {metric.range}
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {metric.desc}
        </p>
      </div>
    </div>
  );
}

import { api } from "@/lib/api";

export function LabMonitorTable({
  records,
  onRefresh
}: {
  records: LabRecord[];
  onRefresh: () => void;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form states
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [kreatinin, setKreatinin] = useState("");
  const [ureum, setUreum] = useState("");
  const [kalium, setKalium] = useState("");
  const [hb, setHb] = useState("");

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !kreatinin || !ureum || !kalium || !hb) return;

    const userId = localStorage.getItem("nephroaid_user_id");
    if (!userId) return;

    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

    try {
      await api.addLab(userId, {
        date: formattedDate,
        kreatinin: parseFloat(kreatinin),
        ureum: parseFloat(ureum),
        kalium: parseFloat(kalium),
        hb: parseFloat(hb)
      });

      onRefresh();
      setShowAddForm(false);
      
      // Clear inputs
      setDate(new Date().toISOString().split("T")[0]);
      setKreatinin("");
      setUreum("");
      setKalium("");
      setHb("");
    } catch (err) {
      console.error("Failed to add lab", err);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteRecord = async () => {
    if (deleteTargetId) {
      try {
        await api.deleteLab(deleteTargetId);
        onRefresh();
        setDeleteTargetId(null);
      } catch (err) {
        console.error("Failed to delete lab", err);
      }
    }
  };

  return (
    <div className="bg-card border border-black/5 dark:border-white/5 rounded-[2rem] p-5 md:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Flask weight="duotone" className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-medium text-base text-foreground">Riwayat & Hasil Laboratorium</h3>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-0.5">Kumpulan nilai tes klinis yang terdaftar</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(true)}
          className="h-10 px-4 rounded-xl bg-foreground text-background text-xs font-medium hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2"
        >
          <Plus weight="bold" className="w-4 h-4" /> Tambah Hasil Tes
        </motion.button>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto pr-2 scrollbar-thin max-h-[400px] rounded-2xl border border-black/5 dark:border-white/5">
        {records.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-10">Belum ada hasil lab terdaftar.</p>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                <th className="p-4 font-medium whitespace-nowrap">Tanggal</th>
                <th className="p-4 font-medium whitespace-nowrap">Kreatinin Serum</th>
                <th className="p-4 font-medium whitespace-nowrap">Ureum (BUN)</th>
                <th className="p-4 font-medium whitespace-nowrap">Kalium (Potassium)</th>
                <th className="p-4 font-medium whitespace-nowrap">Hemoglobin (Hb)</th>
                <th className="p-4 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {records.map((rec) => (
                <tr key={rec.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-medium text-foreground whitespace-nowrap">{rec.date}</td>
                  <td className="p-4 whitespace-nowrap">
                    <span className="font-medium text-foreground">{rec.kreatinin}</span> <span className="text-xs text-muted-foreground mr-2">mg/dL</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${rec.kreatinin > 8.0 ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                      {rec.kreatinin > 8.0 ? "Tinggi" : "Target"}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span className="font-medium text-foreground">{rec.ureum}</span> <span className="text-xs text-muted-foreground mr-2">mg/dL</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${rec.ureum > 100 ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                      {rec.ureum > 100 ? "Tinggi" : "Target"}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span className="font-medium text-foreground">{rec.kalium}</span> <span className="text-xs text-muted-foreground mr-2">mEq/L</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${rec.kalium > 5.5 ? "bg-destructive/10 text-destructive" : rec.kalium < 3.5 ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                      {rec.kalium > 5.5 ? "Hiperkalemia" : rec.kalium < 3.5 ? "Rendah" : "Aman"}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span className="font-medium text-foreground">{rec.hb}</span> <span className="text-xs text-muted-foreground mr-2">g/dL</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${rec.hb < 10.0 ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                      {rec.hb < 10.0 ? "Anemia" : "Aman"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteClick(rec.id)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all cursor-pointer"
                    >
                      <Trash weight="fill" className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Info Warning */}
      <div className="p-4 bg-primary/5 rounded-2xl flex gap-3">
        <Info weight="fill" className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Catatan hasil laboratorium di atas digunakan asisten AI NephroAid untuk memberikan konteks diet yang lebih akurat saat Anda bertanya. Selalu lakukan tes berkala di laboratorium klinik resmi rumah sakit rujukan hemodialisis Anda.
        </p>
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Hapus Catatan Hasil Laboratorium"
        description="Apakah Anda yakin ingin menghapus catatan hasil tes lab ini? Semua data terkait baris ini akan hilang dari riwayat klinis."
        confirmText="Hapus"
        onConfirm={confirmDeleteRecord}
        isDestructive={true}
      />

      {/* Add Record Modal Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="sm:max-w-[400px] rounded-[2rem] p-0 border-none shadow-[0_16px_64px_rgba(0,0,0,0.12)] overflow-hidden [&>button]:hidden">
          <div className="p-6 bg-card">
            <DialogTitle className="sr-only">Tambah Hasil Laboratorium</DialogTitle>
            <DialogDescription className="sr-only">Form untuk mencatat hasil pemeriksaan laboratorium baru.</DialogDescription>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center">
                  <Calendar weight="duotone" className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="font-heading font-medium text-lg">Tambah Hasil Lab</h3>
              </div>
              <button onClick={() => setShowAddForm(false)} className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-black/10 transition-colors">
                <X weight="bold" className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleAddRecord} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground ml-1">Tanggal Tes</label>
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
                  <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground ml-1">Kreatinin <span className="lowercase normal-case opacity-60">(mg/dL)</span></label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Contoh: 7.5"
                    value={kreatinin}
                    onChange={(e) => setKreatinin(e.target.value)}
                    className="w-full h-12 bg-black/[0.03] dark:bg-white/[0.03] border-none rounded-2xl px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground ml-1">Ureum <span className="lowercase normal-case opacity-60">(mg/dL)</span></label>
                  <input
                    type="number"
                    placeholder="Contoh: 95"
                    value={ureum}
                    onChange={(e) => setUreum(e.target.value)}
                    className="w-full h-12 bg-black/[0.03] dark:bg-white/[0.03] border-none rounded-2xl px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground ml-1">Kalium <span className="lowercase normal-case opacity-60">(mEq/L)</span></label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Contoh: 4.5"
                    value={kalium}
                    onChange={(e) => setKalium(e.target.value)}
                    className="w-full h-12 bg-black/[0.03] dark:bg-white/[0.03] border-none rounded-2xl px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground ml-1">Hb <span className="lowercase normal-case opacity-60">(g/dL)</span></label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Contoh: 10.2"
                    value={hb}
                    onChange={(e) => setHb(e.target.value)}
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
