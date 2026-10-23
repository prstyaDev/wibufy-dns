'use client';

import { HealthStatus } from '@/lib/dns/constants';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

export type IndicatorStatus = HealthStatus | 'operational' | 'degraded' | 'down' | 'stale';

interface StatusIndicatorProps {
  status: IndicatorStatus;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  customLabel?: string;
  showIcon?: boolean;
}

export function StatusIndicator({
  status,
  size = 'md',
  showText = true,
  customLabel,
  showIcon = false,
}: StatusIndicatorProps) {
  let dotColor = 'bg-slate-400 ring-slate-200';
  let badgeClasses = 'text-slate-600 bg-slate-100 border-slate-200';
  let defaultLabel = 'Belum Tersedia';
  let IconComponent = HelpCircle;

  switch (status) {
    case 'operational':
      dotColor = 'bg-emerald-500 ring-emerald-200';
      badgeClasses = 'text-emerald-800 bg-emerald-50 border-emerald-200';
      defaultLabel = 'Operasional';
      IconComponent = CheckCircle2;
      break;
    case 'degraded':
      dotColor = 'bg-amber-500 ring-amber-200';
      badgeClasses = 'text-amber-800 bg-amber-50 border-amber-200';
      defaultLabel = 'Degradasi';
      IconComponent = AlertTriangle;
      break;
    case 'down':
      dotColor = 'bg-rose-500 ring-rose-200';
      badgeClasses = 'text-rose-800 bg-rose-50 border-rose-200';
      defaultLabel = 'Gangguan';
      IconComponent = XCircle;
      break;
    case 'stale':
      dotColor = 'bg-amber-400 ring-amber-200';
      badgeClasses = 'text-amber-800 bg-amber-50 border-amber-200';
      defaultLabel = 'Kedaluwarsa';
      IconComponent = AlertTriangle;
      break;
    case 'unknown':
    default:
      dotColor = 'bg-slate-400 ring-slate-200';
      badgeClasses = 'text-slate-600 bg-slate-100 border-slate-200';
      defaultLabel = 'Belum Tersedia';
      IconComponent = HelpCircle;
      break;
  }

  const dotSizes = {
    sm: 'w-2 h-2 ring-2',
    md: 'w-2.5 h-2.5 ring-2',
    lg: 'w-3 h-3 ring-3',
  };

  const textSizes = {
    sm: 'text-xs font-medium',
    md: 'text-xs sm:text-sm font-medium',
    lg: 'text-sm sm:text-base font-semibold',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs ${badgeClasses}`}>
      {showIcon ? (
        <IconComponent className={`${iconSizes[size]} shrink-0`} aria-hidden="true" />
      ) : (
        <span className={`rounded-full shrink-0 ${dotSizes[size]} ${dotColor}`} aria-hidden="true" />
      )}
      {showText && (
        <span className={`${textSizes[size]} tracking-tight leading-none`}>
          {customLabel || defaultLabel}
        </span>
      )}
    </div>
  );
}
