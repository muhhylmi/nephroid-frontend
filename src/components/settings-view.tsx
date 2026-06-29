import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { User, Heart, Gear, FloppyDisk, CheckCircle, Flask, Plus, Trash, X } from "@phosphor-icons/react";
import { LabParameter } from "./lab-monitor";
import ConfirmDialog from "@/components/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserProfile {
  email: string;
  role: string;
  dialysisFrequency: string;
  targetDryWeight: number;
}

interface SettingsViewProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  parameters: LabParameter[];
  onUpdateParameters: (updatedParams: LabParameter[]) => void;
}

export default function SettingsView({
  user,
  onUpdateUser,
  parameters,
  onUpdateParameters
}: SettingsViewProps) {
  const [subMenu, setSubMenu] = useState<"akun" | "laboratorium">("akun");
  
  // Account Form States
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [dialysisFrequency, setDialysisFrequency] = useState(user.dialysisFrequency);
  const [targetDryWeight, setTargetDryWeight] = useState(user.targetDryWeight.toString());
  const [isSaved, setIsSaved] = useState(false);

  // Deletion Confirmation States
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetKey, setDeleteTargetKey] = useState<string | null>(null);

  // Custom Parameter Modal States
  const [showAddParamModal, setShowAddParamModal] = useState(false);
  const [pendingParams, setPendingParams] = useState<{ label: string; unit: string; targetRange: string }[]>([
    { label: "", unit: "", targetRange: "" }
  ]);

  // Sync state if user prop changes externally
  useEffect(() => {
    setEmail(user.email);
    setRole(user.role);
    setDialysisFrequency(user.dialysisFrequency);
    setTargetDryWeight(user.targetDryWeight.toString());
  }, [user]);

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = { email, role, dialysisFrequency, targetDryWeight: parseFloat(targetDryWeight) || 60.0 };
    onUpdateUser(updatedUser);
    
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  const handleToggleParam = (key: string) => {
    const updated = parameters.map((p) =>
      p.key === key ? { ...p, enabled: !p.enabled } : p
    );
    onUpdateParameters(updated);
  };

  const handleSaveParams = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all pending parameters
    const validParams = pendingParams.filter(p => p.label.trim() !== "");
    if (validParams.length === 0) return;

    const newParametersList = [...parameters];

    for (const p of validParams) {
      const key = p.label.toLowerCase().replace(/\s+/g, "_");
      
      // Check if key already exists
      if (newParametersList.some((existing) => existing.key === key)) {
        alert(`Parameter dengan nama "${p.label}" sudah ada.`);
        return;
      }

      newParametersList.push({
        key,
        label: p.label,
        unit: p.unit || "-",
        targetRange: p.targetRange || "-",
        enabled: true,
        isCustom: true,
      });
    }

    onUpdateParameters(newParametersList);
    
    // Reset modal states
    setPendingParams([{ label: "", unit: "", targetRange: "" }]);
    setShowAddParamModal(false);
  };

  const handleAddPendingRow = () => {
    setPendingParams([...pendingParams, { label: "", unit: "", targetRange: "" }]);
  };

  const handleRemovePendingRow = (index: number) => {
    if (pendingParams.length > 1) {
      setPendingParams(pendingParams.filter((_, i) => i !== index));
    }
  };

  const handlePendingChange = (index: number, field: 'label' | 'unit' | 'targetRange', value: string) => {
    const updated = pendingParams.map((p, i) => 
      i === index ? { ...p, [field]: value } : p
    );
    setPendingParams(updated);
  };

  const handleDeleteClick = (key: string) => {
    setDeleteTargetKey(key);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteParam = () => {
    if (deleteTargetKey) {
      const updated = parameters.filter((p) => p.key !== deleteTargetKey);
      onUpdateParameters(updated);
      setDeleteTargetKey(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 w-full pb-10">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-black/5 dark:bg-white/5 text-[10px] uppercase tracking-[0.2em] font-mono text-muted-foreground">
          <span>PREFERENSI</span>
        </div>
        <h2 className="font-heading font-medium text-3xl md:text-4xl tracking-tight">Pengaturan</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Card Summary & Navigation */}
        <div className="lg:col-span-4 space-y-6">
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

          {/* Sub Menu Navigation */}
          <div className="p-2 bg-black/5 dark:bg-white/5 rounded-[2.5rem] ring-1 ring-black/5 dark:ring-white/10">
            <div className="p-4 rounded-[calc(2.5rem-0.5rem)] bg-card shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(255,255,255,0.02)] flex flex-col gap-2">
              <button
                onClick={() => setSubMenu("akun")}
                className={`w-full h-11 px-4 rounded-xl text-xs font-medium flex items-center gap-3 transition-all duration-300 cursor-pointer ${
                  subMenu === "akun"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <User weight={subMenu === "akun" ? "fill" : "light"} className="w-4 h-4" />
                <span>Akun</span>
              </button>
              <button
                onClick={() => setSubMenu("laboratorium")}
                className={`w-full h-11 px-4 rounded-xl text-xs font-medium flex items-center gap-3 transition-all duration-300 cursor-pointer ${
                  subMenu === "laboratorium"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <Flask weight={subMenu === "laboratorium" ? "fill" : "light"} className="w-4 h-4" />
                <span>Laboratorium</span>
              </button>
            </div>
          </div>
        </div>

        {/* Edit Viewport */}
        <div className="lg:col-span-8">
          <div className="p-2 bg-black/5 dark:bg-white/5 rounded-[2.5rem] ring-1 ring-black/5 dark:ring-white/10">
            <div className="p-8 md:p-10 rounded-[calc(2.5rem-0.5rem)] bg-card shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(255,255,255,0.02)]">
              
              {/* AKUN SUBMENU */}
              {subMenu === "akun" && (
                <>
                  <div className="flex items-center gap-4 mb-8 pb-6 border-b border-black/5 dark:border-white/5">
                    <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-muted-foreground">
                      <Gear weight="duotone" className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-heading font-medium text-xl">Informasi Profil</h3>
                      <p className="text-xs text-muted-foreground mt-1">Perbarui data login dan preferensi medis Anda.</p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveAccount} className="space-y-6">
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
                          className={`flex items-center justify-center gap-2 h-12 rounded-2xl text-sm transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer ${
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
                          className={`flex items-center justify-center gap-2 h-12 rounded-2xl text-sm transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer ${
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
                        className="h-12 px-8 bg-foreground text-background font-medium rounded-full shadow-md shadow-black/10 transition-all flex items-center gap-2 hover:bg-foreground/90 cursor-pointer"
                      >
                        <FloppyDisk weight="bold" className="w-4 h-4" />
                        Simpan Profil
                      </motion.button>
                    </div>
                  </form>
                </>
              )}

              {/* LABORATORIUM SUBMENU */}
              {subMenu === "laboratorium" && (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex items-center gap-4 mb-8 pb-6 border-b border-black/5 dark:border-white/5">
                    <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-muted-foreground">
                      <Flask weight="duotone" className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-heading font-medium text-xl">Pengaturan Laboratorium</h3>
                      <p className="text-xs text-muted-foreground mt-1">Pilih dan buat formulir laboratorium dinamis Anda sendiri.</p>
                    </div>
                  </div>

                  {/* Predefined parameters */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Parameter Bawaan</h4>
                    <div className="space-y-3">
                      {parameters.filter(p => !p.isCustom).map(param => (
                        <div key={param.key} className="flex items-center justify-between p-4 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl">
                          <div>
                            <span className="text-sm font-semibold text-foreground">{param.label}</span>
                            <span className="text-xs text-muted-foreground ml-2">({param.unit}) • Rujukan: {param.targetRange}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleParam(param.key)}
                            className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-300 focus:outline-none cursor-pointer ${
                              param.enabled ? "bg-primary" : "bg-black/20 dark:bg-white/20"
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                                param.enabled ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Custom parameters list */}
                  {parameters.some(p => p.isCustom) && (
                    <div className="space-y-4 pt-6 border-t border-black/5 dark:border-white/5">
                      <h4 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Parameter Kustom</h4>
                      <div className="space-y-3">
                        {parameters.filter(p => p.isCustom).map(param => (
                          <div key={param.key} className="flex items-center justify-between p-4 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl">
                            <div>
                              <span className="text-sm font-semibold text-foreground">{param.label}</span>
                              <span className="text-xs text-muted-foreground ml-2">({param.unit}) • Target: {param.targetRange}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => handleToggleParam(param.key)}
                                className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-300 focus:outline-none cursor-pointer ${
                                  param.enabled ? "bg-primary" : "bg-black/20 dark:bg-white/20"
                                }`}
                              >
                                <div
                                  className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                                    param.enabled ? "translate-x-4" : "translate-x-0"
                                  }`}
                                />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteClick(param.key)}
                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all cursor-pointer"
                              >
                                <Trash weight="fill" className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Parameter button */}
                  <div className="pt-6 border-t border-black/5 dark:border-white/5 flex justify-start">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setShowAddParamModal(true)}
                      className="h-12 px-6 bg-foreground text-background font-medium rounded-full shadow-md hover:bg-foreground/90 transition-all flex items-center gap-2 cursor-pointer text-xs"
                    >
                      <Plus weight="bold" className="w-4 h-4" />
                      Buat Parameter Baru
                    </motion.button>
                  </div>
                </div>
              )}
              
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Hapus Parameter Laboratorium"
        description="Apakah Anda yakin ingin menghapus parameter kustom ini? Seluruh data yang sudah tercatat untuk parameter ini akan disembunyikan dari riwayat."
        confirmText="Hapus"
        onConfirm={confirmDeleteParam}
        isDestructive={true}
      />

      <Dialog open={showAddParamModal} onOpenChange={setShowAddParamModal}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 border-none shadow-[0_16px_64px_rgba(0,0,0,0.12)] overflow-hidden [&>button]:hidden">
          <div className="p-6 bg-card max-h-[85vh] flex flex-col">
            <DialogTitle className="sr-only">Buat Parameter Baru</DialogTitle>
            <DialogDescription className="sr-only">Form untuk menambahkan beberapa parameter kustom baru sekaligus.</DialogDescription>
            
            <div className="flex items-center justify-between mb-6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center">
                  <Flask weight="duotone" className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="font-heading font-medium text-lg">Buat Parameter Baru</h3>
              </div>
              <button onClick={() => setShowAddParamModal(false)} className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-black/10 transition-colors">
                <X weight="bold" className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveParams} className="flex-1 flex flex-col min-h-0 space-y-6">
              <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-thin animate-fadeIn">
                {pendingParams.map((p, idx) => (
                  <div key={idx} className="p-4 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl relative space-y-4">
                    {pendingParams.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePendingRow(idx)}
                        className="absolute top-3 right-3 text-muted-foreground hover:text-destructive p-1 rounded-full hover:bg-destructive/10 transition-colors"
                      >
                        <Trash weight="fill" className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
                      Parameter #{idx + 1}
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground ml-1">Nama Parameter</label>
                        <input
                          type="text"
                          placeholder="Contoh: Asam Urat"
                          value={p.label}
                          onChange={(e) => handlePendingChange(idx, 'label', e.target.value)}
                          className="w-full h-10 px-4 bg-black/[0.03] dark:bg-white/[0.03] border-none rounded-xl text-sm focus:ring-1 focus:ring-primary outline-none"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground ml-1">Satuan</label>
                          <input
                            type="text"
                            placeholder="Contoh: mg/dL"
                            value={p.unit}
                            onChange={(e) => handlePendingChange(idx, 'unit', e.target.value)}
                            className="w-full h-10 px-4 bg-black/[0.03] dark:bg-white/[0.03] border-none rounded-xl text-sm focus:ring-1 focus:ring-primary outline-none"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground ml-1">Target / Nilai Rujukan</label>
                          <input
                            type="text"
                            placeholder="Contoh: 3.4 - 7.0"
                            value={p.targetRange}
                            onChange={(e) => handlePendingChange(idx, 'targetRange', e.target.value)}
                            className="w-full h-10 px-4 bg-black/[0.03] dark:bg-white/[0.03] border-none rounded-xl text-sm focus:ring-1 focus:ring-primary outline-none"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddPendingRow}
                  className="w-full py-3 border border-dashed border-black/10 dark:border-white/10 rounded-2xl text-xs text-muted-foreground hover:text-foreground hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors flex items-center justify-center gap-2 cursor-pointer font-medium"
                >
                  <Plus weight="bold" className="w-3.5 h-3.5" />
                  Tambah Parameter Lainnya
                </button>
              </div>

              <div className="pt-4 border-t border-black/5 dark:border-white/5 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddParamModal(false)}
                  className="flex-1 h-12 text-sm font-medium border border-black/10 dark:border-white/10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Batal
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="flex-1 h-12 text-sm font-medium bg-foreground text-background rounded-full shadow-md hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FloppyDisk weight="fill" className="w-4 h-4" />
                  Simpan Semua
                </motion.button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
