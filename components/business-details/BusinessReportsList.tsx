import { Clock, ShieldAlert, UserCheck } from 'lucide-react';
import type { IBusinessReport } from '@/types/business';

interface BusinessReportsListProps {
  reports?: IBusinessReport[];
}

export function BusinessReportsList({ reports }: BusinessReportsListProps) {
  if (!reports || reports.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-4 text-rose-500" />
          <h3 className="text-base font-bold text-foreground">
            Customer Incident Reports ({reports.length})
          </h3>
        </div>
        <span className="text-xs font-medium text-muted-foreground">Public Logs</span>
      </div>

      <div className="grid gap-3.5">
        {reports.map((report) => {
          const isResolved = report.status === 'RESOLVED' || report.status === 'SOLVED';

          return (
            <div
              key={report.id}
              className="rounded-xl border border-border/80 bg-card p-5 shadow-xs transition hover:border-border space-y-3.5"
            >
              {/* Header row */}
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-lg bg-rose-500/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  {report.reason.replace(/_/g, ' ')}
                </span>
                
                {isResolved ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <UserCheck className="size-3" /> Resolved
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <Clock className="size-3" /> Under Investigation
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-foreground/90 leading-relaxed font-normal">
                "{report.description}"
              </p>

              {/* Metadata footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="text-foreground">{report.reporter?.name || 'Verified Customer'}</span>
                  {report.reporter?.email && (
                    <span className="text-muted-foreground/80 font-normal">({report.reporter.email})</span>
                  )}
                </div>
                <time dateTime={report.createdAt} className="text-xs">
                  {new Date(report.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}