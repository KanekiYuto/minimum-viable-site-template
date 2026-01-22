"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { signIn } from "@/lib/auth-client";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const t = useTranslations("auth.loginModal");
  const [loadingProvider, setLoadingProvider] = useState<
    "google" | "github" | null
  >(null);
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSocialSignIn = async (provider: "google" | "github") => {
    try {
      setLoadingProvider(provider);
      const callbackURL =
        pathname === "/" ? siteConfig.auth.defaultRedirectAfterLogin : pathname;
      await signIn.social({
        provider,
        callbackURL,
      });
    } catch (error) {
      console.error("Login failed:", error);
      setLoadingProvider(null);
    }
  };

  return typeof window !== "undefined"
    ? createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-sm"
              />

              <div className="fixed inset-0 z-[501] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="relative w-full max-w-md rounded-2xl bg-background border border-border p-8 shadow-2xl"
                >
                  <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-lg p-2 text-muted transition-colors hover:bg-sidebar-hover hover:text-foreground cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-foreground">
                      {t("title")}
                    </h2>
                    <p className="mt-2 text-sm text-muted">{t("subtitle")}</p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => handleSocialSignIn("google")}
                      disabled={loadingProvider !== null}
                      className="flex w-full items-center justify-center gap-3 rounded-xl bg-muted/20 px-6 py-3 font-medium text-foreground transition-all hover:bg-muted/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      {loadingProvider === "google" ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="inline-flex items-center"
                          >
                            {t("loggingIn")}
                            <span className="inline-flex ml-0.5">
                              <motion.span
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  delay: 0,
                                }}
                              >
                                .
                              </motion.span>
                              <motion.span
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  delay: 0.2,
                                }}
                              >
                                .
                              </motion.span>
                              <motion.span
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  delay: 0.4,
                                }}
                              >
                                .
                              </motion.span>
                            </span>
                          </motion.span>
                        </>
                      ) : (
                        t("signInWithGoogle")
                      )}
                    </button>

                    <button
                      onClick={() => handleSocialSignIn("github")}
                      disabled={loadingProvider !== null}
                      className="flex w-full items-center justify-center gap-3 rounded-xl bg-muted/20 px-6 py-3 font-medium text-foreground transition-all hover:bg-muted/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      {loadingProvider === "github" ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="inline-flex items-center"
                          >
                            {t("loggingIn")}
                            <span className="inline-flex ml-0.5">
                              <motion.span
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  delay: 0,
                                }}
                              >
                                .
                              </motion.span>
                              <motion.span
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  delay: 0.2,
                                }}
                              >
                                .
                              </motion.span>
                              <motion.span
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  delay: 0.4,
                                }}
                              >
                                .
                              </motion.span>
                            </span>
                          </motion.span>
                        </>
                      ) : (
                        t("signInWithGitHub")
                      )}
                    </button>
                  </div>

                  <p className="mt-6 text-center text-xs text-muted">
                    {t("agreement")}
                    <a
                      href="/legal/terms"
                      className="text-primary hover:underline cursor-pointer"
                    >
                      {t("termsOfService")}
                    </a>
                    {t("and")}
                    <a
                      href="/legal/privacy"
                      className="text-primary hover:underline cursor-pointer"
                    >
                      {t("privacyPolicy")}
                    </a>
                  </p>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )
    : null;
}
