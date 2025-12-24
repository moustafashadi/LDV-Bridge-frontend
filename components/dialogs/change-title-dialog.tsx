"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";

const MAX_TITLE_LENGTH = 75;

interface ChangeTitleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appName: string;
  onSubmit: (changeTitle: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function ChangeTitleDialog({
  open,
  onOpenChange,
  appName,
  onSubmit,
  isLoading = false,
  error = null,
}: ChangeTitleDialogProps) {
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && !isLoading) {
      onSubmit(title.trim());
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setTitle("");
      onOpenChange(false);
    }
  };

  const remainingChars = MAX_TITLE_LENGTH - title.length;
  const isValid = title.trim().length > 0 && title.length <= MAX_TITLE_LENGTH;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-700">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-white">
              Describe Your Changes
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Enter a short title describing what you&apos;ve changed in{" "}
              <span className="font-semibold text-white">{appName}</span>. This
              helps track different versions of your work.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <div className="space-y-2">
              <Label htmlFor="changeTitle" className="text-slate-300">
                Change Title
              </Label>
              <Input
                id="changeTitle"
                placeholder="e.g., Add new login page"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value.slice(0, MAX_TITLE_LENGTH))
                }
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                disabled={isLoading}
                autoFocus
              />
              <div className="flex justify-between items-center">
                <span
                  className={`text-xs ${
                    remainingChars < 10 ? "text-orange-400" : "text-slate-500"
                  }`}
                >
                  {remainingChars} characters remaining
                </span>
              </div>
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-2 p-3 bg-red-900/30 border border-red-800 rounded-md">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                "Start Sync"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
