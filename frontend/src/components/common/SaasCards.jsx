import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * Compact Section Heading — clean hierarchy without excess whitespace
 */
export function SectionHeader({ title, subtitle, actionLabel, actionTo, onAction, count }) {
  return (
    <div className="flex items-end justify-between gap-3 mb-3">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-foreground tracking-tight">
            {title}
          </h2>
          {count !== undefined && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F8EDF0] dark:bg-[#312128] text-[#8B2942] dark:text-[#F2B8C7]">
              {count}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>

      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#8B2942] dark:text-[#F2B8C7] hover:text-[#702038] transition-colors shrink-0"
        >
          <span>{actionLabel}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      )}
      {actionLabel && !actionTo && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#8B2942] dark:text-[#F2B8C7] hover:text-[#702038] transition-colors shrink-0 cursor-pointer"
        >
          <span>{actionLabel}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

/**
 * Type 1: Statistic Card — Compact KPI card with optional thin burgundy top bar
 */
export function KpiCard({ label, value, subtitle, icon: Icon, trend, accentTop = false, to }) {
  const inner = (
    <div
      className={`bg-card text-card-foreground rounded-xl border border-border p-4 shadow-2xs transition-all hover:border-[#8B2942]/35 hover:shadow-xs h-full flex flex-col justify-between ${
        accentTop ? 'border-t-2 border-t-[#8B2942]' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground leading-tight">
          {label}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-[#F8EDF0] dark:bg-[#312128] text-[#8B2942] dark:text-[#F2B8C7] flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 stroke-[1.9]" />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-xl font-bold text-foreground tracking-tight">
          {value ?? '—'}
        </span>
        {trend !== undefined && trend !== null && (
          <span
            className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${
              trend >= 0
                ? 'bg-[#26966B]/10 text-[#26966B]'
                : 'bg-[#B42318]/10 text-[#B42318]'
            }`}
          >
            {trend > 0 ? `+${trend}%` : `${trend}%`}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-muted-foreground truncate">{subtitle}</p>
      )}
    </div>
  );

  return to ? <Link to={to} className="block h-full">{inner}</Link> : inner;
}

/**
 * Type 2: Feature Card — Horizontal navigation card inspired by the reference portal
 */
export function ModuleFeatureCard({ icon: Icon, title, description, to, meta, onClick }) {
  const content = (
    <div className="group bg-card text-card-foreground rounded-xl border border-border p-4 shadow-2xs hover:border-[#8B2942]/40 hover:shadow-xs transition-all flex items-center gap-3.5 h-full cursor-pointer">
      {Icon && (
        <div className="w-10 h-10 rounded-xl bg-[#F8EDF0] dark:bg-[#312128] text-[#8B2942] dark:text-[#F2B8C7] group-hover:bg-[#8B2942] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
          <Icon className="w-5 h-5 stroke-[1.8]" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground group-hover:text-[#8B2942] dark:group-hover:text-[#F2B8C7] transition-colors truncate">
            {title}
          </h3>
          {meta && (
            <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-[#F7F6F7] dark:bg-white/5 text-muted-foreground shrink-0">
              {meta}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {description}
          </p>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-[#8B2942] group-hover:translate-x-0.5 transition-all shrink-0" />
    </div>
  );

  if (to) {
    return <Link to={to} className="block h-full">{content}</Link>;
  }
  return (
    <button type="button" onClick={onClick} className="block w-full text-left h-full">
      {content}
    </button>
  );
}
