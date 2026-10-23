'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SystemStatusSummary, HealthStatus } from '@/lib/dns/constants';

interface StatusContextValue {
  summary: SystemStatusSummary | null;
  status: HealthStatus;
  lastChecked: string | null;
  isLoading: boolean;
  cooldown: number;
  errorMsg: string | null;
  hasData: boolean;
  isStale: boolean;
  runLiveProbe: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

const StatusContext = createContext<StatusContextValue | undefined>(undefined);

export function StatusProvider({
  children,
  initialSummary = null,
}: {
  children: React.ReactNode;
  initialSummary?: SystemStatusSummary | null;
}) {
  const [summary, setSummary] = useState<SystemStatusSummary | null>(initialSummary);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Background fetch to ensure fresh client state & fetch current cooldown
  const refreshStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (data.summary) {
        setSummary(data.summary);
      }
      if (data.meta && typeof data.meta.cooldownRemainingSeconds === 'number') {
        if (data.meta.cooldownRemainingSeconds > 0) {
          setCooldown(data.meta.cooldownRemainingSeconds);
        }
      }
    } catch {
      // Keep existing status if network fetch fails
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const syncStatus = async () => {
      try {
        const res = await fetch('/api/status', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!isCancelled) {
          if (data.summary) {
            setSummary(data.summary);
          }
          if (data.meta && typeof data.meta.cooldownRemainingSeconds === 'number') {
            if (data.meta.cooldownRemainingSeconds > 0) {
              setCooldown(data.meta.cooldownRemainingSeconds);
            }
          }
        }
      } catch {
        // Keep initial server-rendered status
      }
    };

    void syncStatus();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const runLiveProbe = useCallback(async () => {
    if (isLoading || cooldown > 0) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/status', {
        method: 'POST',
      });
      const data = await res.json();

      if (res.status === 429) {
        setErrorMsg(
          data.message ||
            'Batas laju kueri tercapai. Mohon tunggu beberapa detik sebelum melakukan pemeriksaan ulang.'
        );
        setCooldown(data.remainingSeconds || 60);
        return;
      }

      if (res.status === 503) {
        setErrorMsg(
          data.message ||
            'Database Supabase belum terhubung. Pemeriksaan otomatis terjadwal tetap berjalan via Vercel Cron.'
        );
        return;
      }

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Pemeriksaan DNS tidak berhasil dieksekusi.');
        return;
      }

      if (data.summary) {
        setSummary(data.summary);
        setCooldown(60);
      }
    } catch {
      setErrorMsg('Koneksi ke endpoint status server terputus. Silakan coba kembali.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, cooldown]);

  const hasData = Boolean(summary && summary.lastChecked);
  const isStale = Boolean(summary?.isStale);

  const status: HealthStatus = !hasData
    ? 'unknown'
    : isStale
    ? 'unknown'
    : summary?.status ?? 'unknown';

  const lastChecked = summary?.lastChecked ?? null;

  return (
    <StatusContext.Provider
      value={{
        summary,
        status,
        lastChecked,
        isLoading,
        cooldown,
        errorMsg,
        hasData,
        isStale,
        runLiveProbe,
        refreshStatus,
      }}
    >
      {children}
    </StatusContext.Provider>
  );
}

export function useSystemStatus() {
  const context = useContext(StatusContext);
  if (!context) {
    throw new Error('useSystemStatus must be used within a StatusProvider');
  }
  return context;
}
