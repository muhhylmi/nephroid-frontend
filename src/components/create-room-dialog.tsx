"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (name: string) => void;
}

export default function CreateRoomDialog({
  open,
  onOpenChange,
  onConfirm,
}: CreateRoomDialogProps) {
  const [roomName, setRoomName] = useState("");

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRoomName("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName.trim()) {
      onConfirm(roomName.trim());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="font-heading font-semibold text-lg">Buat Sesi Diskusi Baru</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-1.5">
              Berikan nama atau topik pembahasan untuk sesi diskusi RAG baru Anda (misal: Tips Kram Pasca HD).
            </DialogDescription>
          </DialogHeader>
          
          <div className="pt-1">
            <Input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Nama Sesi Diskusi..."
              maxLength={40}
              className="h-10 rounded-xl bg-background border-border text-sm"
              required
              autoFocus
            />
          </div>

          <DialogFooter className="flex sm:justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-border cursor-pointer h-9 text-xs font-semibold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={!roomName.trim()}
              className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer h-9 text-xs font-semibold"
            >
              Buat Sesi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
