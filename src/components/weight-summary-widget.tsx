"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Scales, ArrowRight, Info, Calendar } from "@phosphor-icons/react";
import { api } from "@/lib/api";

interface WeightRecord {
  id: string;
  date: string;
  preWeight: number;
  postWeight: number;
}

interface WeightSummaryWidgetProps {
  targetDryWeight: number;
  onNavigateToWeight: () => void;
}

export default function WeightSummaryWidget({
  targetDryWeight,
  onNavigateToWeight
}: WeightSummaryWidgetProps) {
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeights = async () => {
      const userId = localStorage.getItem("nephroaid_user_id");
      if (userId) {
        try {
          const data = await api.getWeights(userId);
          const formatted = data.map((r: any) => ({
            id: r.id,
            date: r.date,
            preWeight: r.preWeight,
            postWeight: r.postWeight
          }));
          // Slice the last 5 records
          setRecords(formatted.slice(-5));
        } catch (e) {
          console.error("Failed to fetch weights", e);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchWeights();
  }, []);

  return (
    <div className="bg-card border border-black/5 dark:border-white/5 rounded-[2rem] p-5 md:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] space-y-5 flex flex-col justify-between h-full">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Scales weight="duotone" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-medium text-base text-foreground">Berat Badan Kering</h3>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-0.5">5 Sesi Terakhir</p>
            </div>
          </div>
          <span className="text-xs font-semibold bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full text-foreground">
            Target: {targetDryWeight} kg
          </span>
        </div>

        {/* Table of 5 latest records */}
        <div className="overflow-hidden rounded-2xl border border-black/5 dark:border-white/5">
          {loading ? (
            <div className="py-8 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full border border-primary/20 border-t-primary animate-spin" />
            </div>
          ) : records.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-8">Belum ada catatan berat badan.</p>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-black/5 dark:bg-white/5 text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                  <th className="p-3 font-medium">Tanggal</th>
                  <th className="p-3 font-medium">Pre-HD</th>
                  <th className="p-3 font-medium">Post-HD</th>
                  <th className="p-3 font-medium text-right">Ditarik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {records.map((rec) => {
                  const removed = rec.preWeight - rec.postWeight;
                  return (
                    <tr key={rec.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                      <td className="p-3 font-medium text-foreground">{rec.date}</td>
                      <td className="p-3 text-muted-foreground">{rec.preWeight} kg</td>
                      <td className="p-3 text-muted-foreground">{rec.postWeight} kg</td>
                      <td className="p-3 font-semibold text-primary text-right">{removed.toFixed(1)} L</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <button
        onClick={onNavigateToWeight}
        className="w-full h-11 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] cursor-pointer mt-4"
      >
        <span>Kelola & Catat Berat Badan</span>
        <ArrowRight weight="bold" className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
