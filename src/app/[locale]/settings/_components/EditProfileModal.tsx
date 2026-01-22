"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import type { User } from "@/store/useUserStore";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSuccess?: (user: User) => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: EditProfileModalProps) {
  const t = useTranslations("settings.profile.editModal");
  const [name, setName] = useState(() => user.name ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      onSuccess?.(data.user ?? data);
      onClose();
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName(user.name ?? "");
      setError("");
      onClose();
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
              className="relative w-full max-w-lg bg-background-1 border border-background-2 rounded-3xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -z-10" />

              <div className="relative pt-6 pb-6 px-6 md:px-8">
                <div className="flex items-start justify-between">
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold text-foreground"
                  >
                    {t("title")}
                  </motion.h2>
                  <button
                    onClick={handleClose}
                    disabled={loading}
                    className="flex items-center justify-center h-9 w-9 rounded-full bg-background-2 hover:bg-background-3/80 backdrop-blur-sm border border-background-4 text-muted hover:bg-background-2 hover:text-foreground transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={t("close")}
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-sm text-muted-foreground"
                >
                  {t("subtitle")}
                </motion.p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="px-6 md:px-8 pb-8 space-y-5"
              >
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm">
                        <p className="text-sm text-red-500 font-medium">
                          {error}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2.5">
                  <label
                    htmlFor="user-name"
                    className="flex items-center gap-2 text-sm font-semibold text-foreground"
                  >
                    {t("nameLabel")}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="user-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("namePlaceholder")}
                    maxLength={50}
                    required
                    disabled={loading}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      {name.length}/50 {t("characters")}
                    </p>
                    <div className="h-1 w-20 bg-sidebar-bg rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-primary-hover"
                        initial={{ width: 0 }}
                        animate={{ width: `${(name.length / 50) * 100}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="flex-1 px-5 py-3.5 bg-background-2 hover:bg-background-3 border border-background-4 text-foreground text-sm font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !name.trim()}
                    className="flex-1 px-5 py-3.5 bg-gradient-to-r from-primary to-primary-hover text-white text-sm font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="h-4 w-4 rounded-full"
                          style={{
                            border: "2px solid rgba(255, 255, 255, 0.3)",
                            borderTopColor: "white",
                          }}
                        />
                        {t("saving")}
                      </span>
                    ) : (
                      t("save")
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return typeof window !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
