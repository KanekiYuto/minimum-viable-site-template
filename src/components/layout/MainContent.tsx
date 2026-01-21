"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MainContentProps {
  children: ReactNode;
  className?: string;
}

export function MainContent({ children, className }: MainContentProps) {
  return (
    <motion.main
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className={cn(
        "flex-1",
        className
      )}
    >
      <div className="mx-auto">
        {children}
      </div>
    </motion.main>
  );
}
