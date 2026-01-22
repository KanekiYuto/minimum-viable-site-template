"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Menu,
  TrendingDown,
  Calendar,
  FileText,
  InboxIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useSettingsNav } from "../_components/SettingsNavContext";
import { useUserStore } from "@/store/useUserStore";
import { UsageSkeleton } from "./UsageSkeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Badge } from "@/components/ui/badge";

interface UsageRecord {
  id: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  note: string | null;
  createdAt: string;
  creditType: string;
}

export default function UsagePage() {
  const t = useTranslations("settings.usage");
  const { openMenu } = useSettingsNav();
  const { user } = useUserStore();
  const [records, setRecords] = useState<UsageRecord[]>([]);
  const [stats, setStats] = useState({
    totalConsumed: 0,
    totalRecords: 0,
    avgPerRecord: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "consume" | "refund">("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/credit/usage/stats");
        if (!response.ok) throw new Error("Failed to fetch stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  useEffect(() => {
    const fetchRecords = async () => {
      setIsLoading(true);
      const minLoadingTime = new Promise((resolve) => setTimeout(resolve, 300));

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
          type: filter,
        });
        const response = await fetch(`/api/credit/usage/records?${params}`);

        if (!response.ok) throw new Error("Failed to fetch records");

        const data = await response.json();
        setRecords(data.records || []);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error("Failed to fetch records:", error);
        setRecords([]);
        setTotalPages(1);
      } finally {
        await minLoadingTime;
        setIsLoading(false);
      }
    };

    if (user) {
      fetchRecords();
    }
  }, [user, page, pageSize, filter]);

  const handleFilterChange = (newFilter: "all" | "consume" | "refund") => {
    setFilter(newFilter);
    setPage(1);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted">未登录</div>
      </div>
    );
  }

  if (isLoading) {
    return <UsageSkeleton />;
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="bg-background-1 border border-background-2 rounded-2xl p-5 md:p-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={openMenu}
              className="lg:hidden flex-shrink-0 flex items-center justify-center h-9 w-9 rounded-lg bg-sidebar-hover border border-border text-foreground hover:bg-sidebar-active transition-colors"
              aria-label={t("openMenu")}
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground">
              {t("title")}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            {t("description")}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-background-1 border border-background-2 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-muted">
              <TrendingDown className="h-4 w-4" />
              <span>{t("stats.totalConsumed")}</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground">
            {stats.totalConsumed.toLocaleString()}
          </div>
        </div>

        <div className="bg-background-1 border border-background-2 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Calendar className="h-4 w-4" />
              <span>{t("stats.recordCount")}</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground">
            {stats.totalRecords}
          </div>
        </div>

        <div className="bg-background-1 border border-background-2 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-muted">
              <FileText className="h-4 w-4" />
              <span>{t("stats.avgPerRecord")}</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground">
            {stats.avgPerRecord}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted">{t("table.title")}</h2>

          <div className="relative flex gap-1 bg-background-1 border border-background-2 rounded-lg p-1">
            <motion.button
              onClick={() => handleFilterChange("all")}
              className={`relative px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                filter === "all"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter === "all" && (
                <motion.div
                  layoutId="usage-filter-tab"
                  className="absolute inset-0 bg-foreground rounded"
                  transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                />
              )}
              <span
                className={`relative z-10 ${
                  filter === "all" ? "text-background" : ""
                }`}
              >
                {t("filter.all")}
              </span>
            </motion.button>
            <motion.button
              onClick={() => handleFilterChange("consume")}
              className={`relative px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                filter === "consume"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter === "consume" && (
                <motion.div
                  layoutId="usage-filter-tab"
                  className="absolute inset-0 bg-foreground rounded"
                  transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                />
              )}
              <span
                className={`relative z-10 ${
                  filter === "consume" ? "text-background" : ""
                }`}
              >
                {t("filter.consume")}
              </span>
            </motion.button>
            <motion.button
              onClick={() => handleFilterChange("refund")}
              className={`relative px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                filter === "refund"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter === "refund" && (
                <motion.div
                  layoutId="usage-filter-tab"
                  className="absolute inset-0 bg-foreground rounded"
                  transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                />
              )}
              <span
                className={`relative z-10 ${
                  filter === "refund" ? "text-background" : ""
                }`}
              >
                {t("filter.refund")}
              </span>
            </motion.button>
          </div>
        </div>

        {records.length === 0 ? (
          <Empty className="border border-border rounded-2xl bg-sidebar-bg">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="bg-sidebar-hover text-muted-foreground">
                <InboxIcon className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle className="text-foreground">
                {t("table.noRecords")}
              </EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-3">
            <div className="border border-border rounded-2xl overflow-hidden">
              <Table>
                <TableHeader className="bg-sidebar-hover/50">
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t("table.columns.time")}
                    </TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t("table.columns.type")}
                    </TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t("table.columns.description")}
                    </TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t("table.columns.amount")}
                    </TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t("table.columns.balance")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow
                      key={record.id}
                      className="hover:bg-sidebar-hover/30 border-border"
                    >
                      <TableCell className="text-sm text-foreground">
                        {new Date(record.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            record.type === "consume" ? "error" : "success"
                          }
                        >
                          {t(`table.types.${record.type}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {record.note || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        <span
                          className={`font-semibold ${
                            record.amount > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {record.amount > 0 ? "+" : ""}
                          {record.amount}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {record.balanceAfter.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {t("pagination.pageInfo", { current: page, total: totalPages })}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border hover:bg-sidebar-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="text-xs font-medium">
                    {t("pagination.previous")}
                  </span>
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border hover:bg-sidebar-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="text-xs font-medium">
                    {t("pagination.next")}
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
