"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "motion/react";
import { api } from "@/lib/api";
import ChatInterface from "@/components/chat-interface";
import ConfirmDialog from "@/components/confirm-dialog";
import FluidTracker from "@/components/fluid-tracker";
import { LabMonitorChart, LabMonitorTable, LabRecord, LabParameter, DEFAULT_PARAMETERS } from "@/components/lab-monitor";
import WeightTracker from "@/components/weight-tracker";
import WeightSummaryWidget from "@/components/weight-summary-widget";
import SettingsView from "@/components/settings-view";
import { 
  Heart, SignOut, User, SquaresFour, 
  ChatTeardropText, Flask, Gear, Sparkle, Scales
} from "@phosphor-icons/react";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; role: string; dialysisFrequency: string; targetDryWeight: number } | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const [activeTab, setActiveTab] = useState<"summary" | "chat" | "lab" | "weight" | "settings">("summary");
  const [labRecords, setLabRecords] = useState<LabRecord[]>([]);
  const [parameters, setParameters] = useState<LabParameter[]>([]);

  const mergeLabsWithCustom = (apiData: any[]): LabRecord[] => {
    return apiData.map((r: any) => {
      const record: LabRecord = {
        id: r.id,
        date: r.date,
        kreatinin: r.kreatinin,
        ureum: r.ureum,
        kalium: r.kalium,
        hb: r.hb,
      };

      if (r.custom_values) {
        Object.assign(record, r.custom_values);
      }

      return record;
    });
  };

  useEffect(() => {
    const token = localStorage.getItem("nephroaid_token");
    const userStr = localStorage.getItem("nephroaid_user");
    if (token && userStr) {
      try {
        const u = JSON.parse(userStr);
        setUser({
          email: u.email,
          role: u.role,
          dialysisFrequency: u.dialysis_frequency || "2",
          targetDryWeight: u.target_dry_weight || 60.0
        });

        if (u.lab_parameters && u.lab_parameters.length > 0) {
          setParameters(u.lab_parameters);
          localStorage.setItem("nephroaid_lab_parameters", JSON.stringify(u.lab_parameters));
        } else {
          const savedParams = localStorage.getItem("nephroaid_lab_parameters");
          if (savedParams) {
            setParameters(JSON.parse(savedParams));
          } else {
            setParameters(DEFAULT_PARAMETERS);
          }
        }
      } catch(e) {}
    } else {
      router.push("/");
    }

    const fetchLabs = async () => {
      const userId = localStorage.getItem("nephroaid_user_id");
      if (userId) {
        try {
          const data = await api.getLabs(userId);
          setLabRecords(mergeLabsWithCustom(data));
        } catch (e) {
          console.error("Failed to fetch labs", e);
        }
      }
    };
    fetchLabs();
  }, [router]);

  const handleUpdateParameters = async (updated: LabParameter[]) => {
    setParameters(updated);
    localStorage.setItem("nephroaid_lab_parameters", JSON.stringify(updated));

    const userId = localStorage.getItem("nephroaid_user_id");
    if (userId && user) {
      try {
        const data = await api.updateProfile(userId, {
          email: user.email,
          role: user.role,
          dialysis_frequency: user.dialysisFrequency,
          target_dry_weight: user.targetDryWeight,
          lab_parameters: updated
        });
        localStorage.setItem("nephroaid_user", JSON.stringify(data));
      } catch (err) {
        console.error("Failed to sync lab parameters to backend", err);
      }
    }
  };

  const handleRefreshLabs = async () => {
    const userId = localStorage.getItem("nephroaid_user_id");
    if (userId) {
      try {
        const data = await api.getLabs(userId);
        setLabRecords(mergeLabsWithCustom(data));
      } catch (e) {}
    }
  };

  const handleUserUpdate = async (updatedUser: { email: string; role: string; dialysisFrequency: string; targetDryWeight: number }) => {
    try {
      const userId = localStorage.getItem("nephroaid_user_id");
      if (!userId) return;
      
      const data = await api.updateProfile(userId, {
        email: updatedUser.email,
        role: updatedUser.role,
        dialysis_frequency: updatedUser.dialysisFrequency,
        target_dry_weight: updatedUser.targetDryWeight,
        lab_parameters: parameters
      });
      
      const mappedUser = {
        email: data.email,
        role: data.role,
        dialysisFrequency: data.dialysis_frequency || "2",
        targetDryWeight: data.target_dry_weight
      };
      
      setUser(mappedUser);
      localStorage.setItem("nephroaid_user", JSON.stringify(data));
      if (data.lab_parameters) {
        setParameters(data.lab_parameters);
        localStorage.setItem("nephroaid_lab_parameters", JSON.stringify(data.lab_parameters));
      }
    } catch (err) {
      console.error("Failed to update profile", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("nephroaid_user");
    router.push("/");
  };

  if (!user) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border border-primary/20 border-t-primary animate-spin" />
        </div>
      </div>
    );
  }

  const navItems = [
    { id: "summary", icon: SquaresFour, label: "Rangkuman" },
    { id: "chat", icon: ChatTeardropText, label: "Tanya AI" },
    { id: "lab", icon: Flask, label: "Laboratorium" },
    { id: "weight", icon: Scales, label: "BB Kering" },
    { id: "settings", icon: Gear, label: "Pengaturan" },
  ] as const;

  const contentVariants: Variants = {
    hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.32, 0.72, 0, 1] } },
    exit: { opacity: 0, y: -16, filter: "blur(4px)", transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] } }
  };

  return (
    <div className="h-[100dvh] w-full overflow-hidden flex flex-col md:flex-row bg-background text-foreground transition-all duration-500">
      
      {/* LEFT SIDEBAR (Desktop) - Floating Island Architecture */}
      <aside className="hidden md:flex flex-col w-[300px] shrink-0 p-4 lg:p-6 pr-0 lg:pr-2 h-full z-30">
        <div className="h-full w-full bg-card/60 backdrop-blur-2xl rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(255,255,255,0.02)] flex flex-col justify-between overflow-hidden relative">
          
          <div className="p-6 lg:p-8 space-y-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-primary/10 text-primary">
                <Heart weight="duotone" className="w-6 h-6" />
              </div>
              <div>
                <span className="font-heading text-lg font-medium tracking-tight">NephroAid</span>
              </div>
            </div>

            {/* User Profile Nested Core */}
            <div className="p-4 rounded-[1.5rem] bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-muted-foreground">
                  <User weight="light" className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-medium truncate text-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest pt-3 border-t border-black/5 dark:border-white/5">
                <span className="text-primary">
                  {user.role === "patient" ? "Pasien" : "Caregiver"}
                </span>
                <span className="text-muted-foreground">
                  HD: {user.dialysisFrequency === "none" ? "None" : `${user.dialysisFrequency}x`}
                </span>
              </div>
            </div>

            {/* Sidebar Menu Items */}
            <nav className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`group relative w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] ${
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <item.icon weight={activeTab === item.id ? "fill" : "light"} className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Sidebar Footer Controls */}
          <div className="p-6 lg:p-8 bg-black/[0.02] dark:bg-white/[0.02]">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full h-12 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-destructive/10 hover:text-destructive text-muted-foreground text-xs font-medium flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98]"
            >
              <SignOut weight="light" className="w-4 h-4" />
              <span>Keluar Akun</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden h-16 bg-card/60 backdrop-blur-2xl border-b border-black/5 dark:border-white/5 flex items-center justify-between px-6 z-30 shrink-0">
        <div className="flex items-center gap-2">
          <Heart weight="duotone" className="w-5 h-5 text-primary" />
          <span className="font-heading text-sm font-medium">NephroAid</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowLogoutConfirm(true)} className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
            <SignOut weight="light" className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN VIEWPORT */}
      <main className={`flex-1 relative z-10 flex flex-col overflow-hidden ${activeTab === "chat" ? "" : "overflow-y-auto"}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={contentVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className={`flex-1 p-4 md:p-8 lg:p-12 pb-24 md:pb-12 ${activeTab === "chat" ? "h-full flex flex-col overflow-hidden" : ""}`}
          >
            {/* Summary */}
            {activeTab === "summary" && (
              <div className="max-w-6xl mx-auto space-y-8">
                <div className="mb-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-black/5 dark:bg-white/5 text-[10px] uppercase tracking-[0.2em] font-mono text-muted-foreground">
                    <span>OVERVIEW</span>
                  </div>
                  <h2 className="font-heading font-medium text-3xl md:text-4xl tracking-tight">Rangkuman Kesehatan</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-7">
                    <WeightSummaryWidget targetDryWeight={user.targetDryWeight} onNavigateToWeight={() => setActiveTab("weight")} />
                  </div>
                  <div className="lg:col-span-5">
                    <FluidTracker />
                  </div>
                  <div className="lg:col-span-12">
                    <LabMonitorChart records={labRecords} parameters={parameters} />
                  </div>
                </div>
              </div>
            )}

            {/* Chat */}
            {activeTab === "chat" && (
              <div className="max-w-5xl w-full mx-auto h-full flex flex-col">
                <div className="shrink-0 mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-primary/10 text-primary text-[10px] uppercase tracking-[0.2em] font-mono font-medium">
                    <Sparkle weight="fill" className="w-3 h-3" />
                    <span>ASISTEN RAG</span>
                  </div>
                  <h2 className="font-heading font-medium text-3xl tracking-tight">Tanya AI NephroAid</h2>
                </div>
                <div className="flex-1 min-h-0 relative">
                  <ChatInterface />
                </div>
              </div>
            )}

            {/* Lab */}
            {activeTab === "lab" && (
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="mb-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-black/5 dark:bg-white/5 text-[10px] uppercase tracking-[0.2em] font-mono text-muted-foreground">
                    <span>DATABASE</span>
                  </div>
                  <h2 className="font-heading font-medium text-3xl tracking-tight">Nilai Laboratorium</h2>
                </div>
                <LabMonitorTable records={labRecords} parameters={parameters} onRefresh={handleRefreshLabs} />
              </div>
            )}

            {/* Weight */}
            {activeTab === "weight" && (
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="mb-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-black/5 dark:bg-white/5 text-[10px] uppercase tracking-[0.2em] font-mono text-muted-foreground">
                    <span>DATABASE</span>
                  </div>
                  <h2 className="font-heading font-medium text-3xl tracking-tight">Berat Badan Kering</h2>
                </div>
                <WeightTracker />
              </div>
            )}

            {/* Settings */}
            {activeTab === "settings" && (
              <SettingsView user={user} onUpdateUser={handleUserUpdate} parameters={parameters} onUpdateParameters={handleUpdateParameters} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* MOBILE BOTTOM NAV - Floating Pill Architecture */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 h-16 bg-card/80 backdrop-blur-2xl rounded-full border border-black/5 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.08)] flex items-center justify-around z-50 px-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.9] ${
              activeTab === item.id ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <item.icon weight={activeTab === item.id ? "fill" : "light"} className="w-5 h-5" />
          </button>
        ))}
      </nav>

      <ConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        title="Keluar dari NephroAid?"
        description="Anda akan keluar dari akun Anda. Semua data sesi tetap tersimpan dan dapat diakses kembali saat Anda login."
        confirmText="Ya, Keluar"
        cancelText="Batal"
        onConfirm={handleLogout}
        isDestructive
      />

    </div>
  );
}
