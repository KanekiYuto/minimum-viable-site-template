"use client";

import { motion } from "framer-motion";

type FilterValue = "all" | "active" | "expired";

interface CreditsFilterProps {
  filter: FilterValue;
  onChange: (value: FilterValue) => void;
  allLabel: string;
  activeLabel: string;
  expiredLabel: string;
}

export function CreditsFilter({
  filter,
  onChange,
  allLabel,
  activeLabel,
  expiredLabel,
}: CreditsFilterProps) {
  return (
    <div className="relative flex gap-1 bg-background-1 border border-background-2 rounded-lg p-1">
      <motion.button
        onClick={() => onChange("all")}
        className={`relative px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
          filter === "all"
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {filter === "all" && (
          <motion.div
            layoutId="filter-tab"
            className="absolute inset-0 bg-foreground rounded"
            transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
          />
        )}
        <span
          className={`relative z-10 ${
            filter === "all" ? "text-background" : ""
          }`}
        >
          {allLabel}
        </span>
      </motion.button>
      <motion.button
        onClick={() => onChange("active")}
        className={`relative px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
          filter === "active"
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {filter === "active" && (
          <motion.div
            layoutId="filter-tab"
            className="absolute inset-0 bg-foreground rounded"
            transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
          />
        )}
        <span
          className={`relative z-10 ${
            filter === "active" ? "text-background" : ""
          }`}
        >
          {activeLabel}
        </span>
      </motion.button>
      <motion.button
        onClick={() => onChange("expired")}
        className={`relative px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
          filter === "expired"
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {filter === "expired" && (
          <motion.div
            layoutId="filter-tab"
            className="absolute inset-0 bg-foreground rounded"
            transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
          />
        )}
        <span
          className={`relative z-10 ${
            filter === "expired" ? "text-background" : ""
          }`}
        >
          {expiredLabel}
        </span>
      </motion.button>
    </div>
  );
}
