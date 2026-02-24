"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users, BarChart3, Star, MessageSquare,
  Activity, TrendingUp, Award, Zap,
} from "lucide-react";
import { adminApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export default function AdminDashboard({ params }: { params: Promise<{ eventId: string }> }) {
  const { token } = useAuthStore();
  const [eventId, setEventId] = useState("");

  useEffect(() => {
    params.then((p) => setEventId(p.eventId));
  }, [params]);

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["admin-dashboard", eventId],
    queryFn: () => adminApi.getDashboard(eventId, token!),
    enabled: !!eventId && !!token,
    refetchInterval: 10_000,
  });

  if (isLoading || !dashboard) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Registrations",
      value: dashboard.total_registrations,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Live Users",
      value: dashboard.live_concurrent_users,
      icon: Activity,
      color: "text-green-400",
      bg: "bg-green-500/10",
      live: true,
    },
    {
      label: "Total Votes",
      value: dashboard.total_votes,
      icon: BarChart3,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      label: "Avg Rating",
      value: dashboard.average_rating.toFixed(1),
      icon: Star,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
    },
    {
      label: "Feedback",
      value: dashboard.total_feedback,
      icon: Award,
      color: "text-pink-400",
      bg: "bg-pink-500/10",
    },
    {
      label: "AI Queries",
      value: dashboard.total_queries,
      icon: MessageSquare,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
    },
    {
      label: "Active Polls",
      value: dashboard.total_polls,
      icon: TrendingUp,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
    },
  ];

  return (
    <div className="min-h-dvh">
      {/* Header */}
      <nav className="sticky top-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
            Auto-refresh 10s
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                {stat.live && (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Live
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Top Queries */}
        {dashboard.top_queries.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[var(--color-primary)]" />
              Top AI Queries
            </h3>
            <div className="space-y-2">
              {dashboard.top_queries.map((q, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-surface)] text-sm"
                >
                  <span className="text-[var(--color-text-subtle)] font-mono text-xs w-6">
                    #{i + 1}
                  </span>
                  <span className="text-[var(--color-text-muted)]">{q}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
